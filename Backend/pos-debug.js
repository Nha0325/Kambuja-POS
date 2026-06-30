const readline = require('readline');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/.env' });

const User = require('./models/users/User.model');
const Shop = require('./models/system/Shop.model');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function connectDB() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully.\n");
}

async function selectShop() {
    const shops = await Shop.find({});
    if (shops.length === 0) {
        console.log("No shops found in the database.");
        return null;
    }
    console.log("\n--- Available Shops ---");
    console.log("0. Back to Main Menu");
    shops.forEach((shop, index) => {
        console.log(`${index + 1}. ${shop.name} (ID: ${shop._id})`);
    });
    const choice = await question("\nEnter the number of the shop (or 0 to cancel): ");
    const idx = parseInt(choice, 10);
    if (isNaN(idx) || idx < 1 || idx > shops.length) {
        console.log("Aborted or invalid selection.");
        return null;
    }
    return shops[idx - 1];
}

async function selectUser(filter = {}) {
    const users = await User.find(filter).populate('shopId', 'name');
    if (users.length === 0) {
        console.log("No users found matching criteria.");
        return null;
    }
    console.log("\n--- Available Users ---");
    console.log("0. Back to Main Menu");
    users.forEach((u, index) => {
        const shopName = u.shopId ? u.shopId.name : 'Global/All';
        console.log(`${index + 1}. ${u.username} (${u.role}) - Shop: ${shopName}`);
    });
    const choice = await question("\nEnter the number of the user (or 0 to cancel): ");
    const idx = parseInt(choice, 10);
    if (isNaN(idx) || idx < 1 || idx > users.length) {
        console.log("Aborted or invalid selection.");
        return null;
    }
    return users[idx - 1];
}

async function showMenu() {
    console.log("\n=====================================");
    console.log("      Kambuja POS Debug Tool         ");
    console.log("=====================================");
    console.log("1. Change User Password (Pick from list)");
    console.log("2. Delete User (Pick from list)");
    console.log("3. List all users");
    console.log("4. Delete Products for a Specific Shop");
    console.log("5. Delete Categories for a Specific Shop");
    console.log("6. Delete Sales Data for a Specific Shop");
    console.log("7. Delete Sales Data for a Specific Cashier");
    console.log("8. [DANGER] Delete ALL Test Data (Wipe Everything)");
    console.log("0. Exit");
    console.log("=====================================");
    
    const choice = await question("Select an option: ");
    
    switch(choice.trim()) {
        case '1': await changePassword(); break;
        case '2': await deleteUser(); break;
        case '3': await listUsers(); break;
        case '4': await deleteProductsForShop(); break;
        case '5': await deleteCategoriesForShop(); break;
        case '6': await deleteSalesForShop(); break;
        case '7': await deleteSalesForCashier(); break;
        case '8': await deleteTestData(); break;
        case '0':
            console.log("Exiting...");
            mongoose.connection.close();
            rl.close();
            process.exit(0);
        default:
            console.log("Invalid option!");
            await showMenu();
    }
}

async function changePassword() {
    const user = await selectUser();
    if (!user) {
        return await showMenu();
    }
    
    const newPassword = await question(`Enter new password for ${user.username} (min 6 chars): `);
    if (newPassword.length < 6) {
        console.log("Password must be at least 6 characters.");
    } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        console.log(`Password for ${user.username} updated successfully!`);
    }
    await showMenu();
}

async function deleteUser() {
    const user = await selectUser();
    if (!user) {
        return await showMenu();
    }
    
    const confirm = await question(`Are you sure you want to delete ${user.username}? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
        await User.deleteOne({ _id: user._id });
        console.log(`User ${user.username} deleted successfully.`);
    } else {
        console.log("Aborted.");
    }
    await showMenu();
}

async function listUsers() {
    const users = await User.find({}).populate('shopId', 'name').select('username role email shopId');
    const displayData = users.map(u => ({
        Username: u.username,
        Role: u.role,
        Shop: u.shopId ? u.shopId.name : 'N/A'
    }));
    console.table(displayData);
    await showMenu();
}

async function deleteProductsForShop() {
    const shop = await selectShop();
    if (!shop) return await showMenu();

    const confirm = await question(`Type 'DELETE' to confirm wiping ALL PRODUCTS for shop ${shop.name}: `);
    if (confirm === 'DELETE') {
        const Product = require('./models/inventory/Product.model');
        const Inventory = require('./models/inventory/Inventory.model');
        const res1 = await Product.deleteMany({ shopId: shop._id });
        const res2 = await Inventory.deleteMany({ shopId: shop._id });
        console.log(`Deleted ${res1.deletedCount} products and ${res2.deletedCount} inventory records for ${shop.name}.`);
    } else {
        console.log("Aborted.");
    }
    await showMenu();
}

async function deleteCategoriesForShop() {
    const shop = await selectShop();
    if (!shop) return await showMenu();

    const confirm = await question(`Type 'DELETE' to confirm wiping ALL CATEGORIES for shop ${shop.name}: `);
    if (confirm === 'DELETE') {
        const Category = require('./models/inventory/Category.model');
        const res = await Category.deleteMany({ shopId: shop._id });
        console.log(`Deleted ${res.deletedCount} categories for ${shop.name}.`);
    } else {
        console.log("Aborted.");
    }
    await showMenu();
}

async function deleteSalesForShop() {
    const shop = await selectShop();
    if (!shop) return await showMenu();

    console.log(`\nWARNING: This will delete ALL sales, receipts, and shifts for shop: "${shop.name}"!`);
    const confirm = await question(`Type 'DELETE' to confirm: `);
    
    if (confirm === 'DELETE') {
        const Sale = require('./models/sales/Sale.model');
        const DailyClose = require('./models/sales/DailyClose.model');
        const Receipt = require('./models/sales/Receipt.model');
        const Payment = require('./models/payment/Payment.model');
        const StockMovement = require('./models/misc/StockMovement.model');
        
        let count = 0;
        count += (await Sale.deleteMany({ shopId: shop._id })).deletedCount;
        count += (await DailyClose.deleteMany({ shopId: shop._id })).deletedCount;
        count += (await Receipt.deleteMany({ shopId: shop._id })).deletedCount;
        count += (await Payment.deleteMany({ shopId: shop._id })).deletedCount;
        count += (await StockMovement.deleteMany({ shopId: shop._id, type: "SALE" })).deletedCount;
        console.log(`Deleted ${count} sales-related records for ${shop.name}.`);
    } else {
        console.log("Aborted.");
    }
    await showMenu();
}

async function deleteSalesForCashier() {
    const shop = await selectShop();
    if (!shop) return await showMenu();

    console.log(`\nSelect a Cashier from shop: ${shop.name}`);
    const cashier = await selectUser({ shopId: shop._id, role: 'CASHIER' });
    if (!cashier) return await showMenu();

    console.log(`\nWARNING: This will delete ALL sales/shifts for cashier "${cashier.username}" in shop "${shop.name}"!`);
    const confirm = await question(`Type 'DELETE' to confirm: `);
    
    if (confirm === 'DELETE') {
        const Sale = require('./models/sales/Sale.model');
        const DailyClose = require('./models/sales/DailyClose.model');
        const Receipt = require('./models/sales/Receipt.model');
        const Payment = require('./models/payment/Payment.model');
        
        let count = 0;
        count += (await Sale.deleteMany({ shopId: shop._id, user: cashier._id })).deletedCount;
        count += (await DailyClose.deleteMany({ shopId: shop._id, cashier: cashier._id })).deletedCount;
        console.log(`Deleted ${count} sales/shift records for cashier ${cashier.username}.`);
        console.log("Note: Receipts/Payments/StockMovements for these sales are kept as orphaned records unless cleared by full shop wipe.");
    } else {
        console.log("Aborted.");
    }
    await showMenu();
}

async function deleteTestData() {
    console.log("\nWARNING: This will delete ALL data (except ADMIN_MANAGER) from ALL shops!");
    const confirm = await question("Type 'DELETE ALL' to confirm total wipe: ");
    if (confirm === 'DELETE ALL') {
        const Product = require('./models/inventory/Product.model');
        const Sale = require('./models/sales/Sale.model');
        const DailyClose = require('./models/sales/DailyClose.model');
        const Receipt = require('./models/sales/Receipt.model');
        const Payment = require('./models/payment/Payment.model');
        const StockMovement = require('./models/misc/StockMovement.model');
        const Category = require('./models/inventory/Category.model');
        
        await User.deleteMany({ role: { $ne: 'ADMIN_MANAGER' } });
        await Product.deleteMany({});
        await Sale.deleteMany({});
        await DailyClose.deleteMany({});
        await Receipt.deleteMany({});
        await Payment.deleteMany({});
        await StockMovement.deleteMany({});
        await Category.deleteMany({});
        
        console.log("Data wipe complete.");
    } else {
        console.log("Aborted.");
    }
    await showMenu();
}

// Start
connectDB().then(() => showMenu()).catch(console.error);
