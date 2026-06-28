require('dotenv').config({ path: '../Backend/.env' });
const mongoose = require('mongoose');
const readline = require('readline');

// Models
const Product = require('../Backend/models/Product.model');
const Inventory = require('../Backend/models/Inventory.model');
const StockMovement = require('../Backend/models/StockMovement.model');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log("==========================================");
    console.log("   PRODUCT DUPLICATE CLEANUP SCRIPT");
    console.log("==========================================\n");

    if (!process.env.MONGODB_URI) {
        console.error("Error: MONGODB_URI not found in ../Backend/.env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.\n");

        console.log("Scanning for duplicates based on shopId + barcode, sku, or code...");
        
        const products = await Product.find({ isDeleted: { $ne: true } }).lean();
        
        const duplicateGroups = [];
        const seenKeys = {}; // key -> [products]

        for (const p of products) {
            const keys = [];
            if (p.barcode) keys.push(`${p.shopId}_barcode_${p.barcode}`);
            if (p.sku) keys.push(`${p.shopId}_sku_${p.sku}`);
            if (p.code) keys.push(`${p.shopId}_code_${p.code}`);

            for (const k of keys) {
                if (!seenKeys[k]) {
                    seenKeys[k] = [];
                }
                seenKeys[k].push(p);
            }
        }

        // Filter out groups with < 2 products
        const processedGroupIds = new Set();
        
        for (const [key, groupProducts] of Object.entries(seenKeys)) {
            if (groupProducts.length > 1) {
                // Deduplicate within the group by _id
                const uniqueProductsMap = new Map();
                for (const p of groupProducts) {
                    uniqueProductsMap.set(p._id.toString(), p);
                }
                
                const uniqueList = Array.from(uniqueProductsMap.values());
                if (uniqueList.length > 1) {
                    const groupHash = uniqueList.map(p => p._id.toString()).sort().join('_');
                    if (!processedGroupIds.has(groupHash)) {
                        processedGroupIds.add(groupHash);
                        duplicateGroups.push({
                            reason: `Duplicate match on ${key.split('_')[1]}`,
                            products: uniqueList
                        });
                    }
                }
            }
        }

        if (duplicateGroups.length === 0) {
            console.log("No duplicate products found in active shops. System is clean.");
            process.exit(0);
        }

        console.log(`Found ${duplicateGroups.length} duplicate groups.\n`);

        for (let i = 0; i < duplicateGroups.length; i++) {
            const group = duplicateGroups[i];
            console.log(`[Group ${i + 1}] Reason: ${group.reason}`);
            console.log("Products:");
            
            // Sort to keep newest or product with most stock first? Let's just list them.
            group.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            for (let j = 0; j < group.products.length; j++) {
                const p = group.products[j];
                console.log(`  ${j + 1}. ID: ${p._id} | Name: ${p.name} | Stock: ${p.stockQtyBase ?? p.currentStock ?? 0} | Barcode: ${p.barcode || 'N/A'} | Code: ${p.code} | Created: ${new Date(p.createdAt).toLocaleDateString()}`);
            }
            console.log("------------------------------------------");
        }

        console.log("\nWARNING: This script allows you to manually resolve duplicates.");
        console.log("It will keep the selected primary product, merge the stock quantity (optional), and mark others as isDeleted=true.");
        console.log("StockMovements are NOT modified, they remain linked to the old IDs for historical audit.\n");

        const answer = await question("Do you want to resolve these duplicates interactively? (y/N): ");
        
        if (answer.toLowerCase() !== 'y') {
            console.log("Exiting without making changes.");
            process.exit(0);
        }

        for (let i = 0; i < duplicateGroups.length; i++) {
            const group = duplicateGroups[i];
            console.log(`\nResolving Group ${i + 1} (${group.reason})`);
            for (let j = 0; j < group.products.length; j++) {
                const p = group.products[j];
                console.log(`  [${j + 1}] ID: ${p._id} (Stock: ${p.stockQtyBase ?? p.currentStock ?? 0})`);
            }
            
            const keepIndexStr = await question("Enter the number of the product to KEEP (or 's' to skip this group): ");
            if (keepIndexStr.toLowerCase() === 's') {
                console.log("Skipping group.");
                continue;
            }
            
            const keepIndex = parseInt(keepIndexStr) - 1;
            if (isNaN(keepIndex) || keepIndex < 0 || keepIndex >= group.products.length) {
                console.log("Invalid selection. Skipping group.");
                continue;
            }

            const keepProduct = group.products[keepIndex];
            const duplicateProducts = group.products.filter((_, idx) => idx !== keepIndex);

            const mergeStockStr = await question(`Merge stock from duplicates into the kept product? (${duplicateProducts.map(p => p.stockQtyBase ?? p.currentStock ?? 0).join(' + ')}) (y/N): `);
            const shouldMergeStock = mergeStockStr.toLowerCase() === 'y';

            if (shouldMergeStock) {
                let totalStockToAdd = 0;
                for (const dp of duplicateProducts) {
                    totalStockToAdd += (dp.stockQtyBase ?? dp.currentStock ?? 0);
                }
                
                await Product.findByIdAndUpdate(keepProduct._id, {
                    $inc: { 
                        currentStock: totalStockToAdd,
                        stockQtyBase: totalStockToAdd 
                    }
                });
                
                // Update Inventory
                await Inventory.updateMany({ product: keepProduct._id }, {
                    $inc: { quantity: totalStockToAdd }
                });
                
                console.log(`Added ${totalStockToAdd} stock to Product ${keepProduct._id}.`);
            }

            // Mark others as deleted
            for (const dp of duplicateProducts) {
                await Product.findByIdAndUpdate(dp._id, {
                    isDeleted: true,
                    // append random string to barcode/sku to free up the unique index
                    barcode: dp.barcode ? `${dp.barcode}_dup_${Date.now()}` : dp.barcode,
                    sku: dp.sku ? `${dp.sku}_dup_${Date.now()}` : dp.sku,
                    code: dp.code ? `${dp.code}_dup_${Date.now()}` : dp.code
                });
                
                console.log(`Marked Product ${dp._id} as deleted and freed its unique keys.`);
            }
            
            console.log(`Group ${i + 1} resolved successfully.`);
        }

        console.log("\nCleanup process completed.");
        process.exit(0);

    } catch (err) {
        console.error("Fatal Error:", err);
        process.exit(1);
    }
}

main();
