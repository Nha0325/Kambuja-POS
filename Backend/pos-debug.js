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

async function showMenu() {
    console.log("=====================================");
    console.log("      Kambuja POS Debug Tool         ");
    console.log("=====================================");
    console.log("1. Change user password (Admin/Cashier)");
    console.log("2. Delete user (Admin/Cashier)");
    console.log("3. List all users");
    console.log("4. Delete ALL test data (DANGEROUS)");
    console.log("0. Exit");
    console.log("=====================================");
    
    const choice = await question("Select an option: ");
    
    switch(choice.trim()) {
        case '1':
            await changePassword();
            break;
        case '2':
            await deleteUser();
            break;
        case '3':
            await listUsers();
            break;
        case '4':
            await deleteTestData();
            break;
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
    const username = await question("Enter username: ");
    const user = await User.findOne({ username });
    
    if (!user) {
        console.log("User not found!");
    } else {
        const newPassword = await question("Enter new password (min 6 chars): ");
        if (newPassword.length < 6) {
            console.log("Password must be at least 6 characters.");
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
            await user.save();
            console.log(`Password for ${username} updated successfully!`);
        }
    }
    
    console.log("\n");
    await showMenu();
}

async function deleteUser() {
    const username = await question("Enter username to delete: ");
    const user = await User.findOne({ username });
    
    if (!user) {
        console.log("User not found!");
    } else {
        const confirm = await question(`Are you sure you want to delete ${username}? (y/N): `);
        if (confirm.toLowerCase() === 'y') {
            await User.deleteOne({ username });
            console.log(`User ${username} deleted successfully.`);
        } else {
            console.log("Aborted.");
        }
    }
    
    console.log("\n");
    await showMenu();
}

async function listUsers() {
    const users = await User.find({}).select('username role email -_id');
    console.table(users.map(u => ({ Username: u.username, Role: u.role, Email: u.email })));
    console.log("\n");
    await showMenu();
}

async function deleteTestData() {
    console.log("\nWARNING: This will delete data from your database!");
    const target = await question("What do you want to delete? (users/products/sales/all/cancel): ");
    
    if (target === 'cancel') {
        console.log("Aborted.");
        return await showMenu();
    }
    
    const confirm = await question(`Type 'DELETE' to confirm wiping ${target}: `);
    if (confirm === 'DELETE') {
        try {
            if (target === 'users' || target === 'all') {
                // Keep ADMIN_MANAGER so we can still login!
                const res = await User.deleteMany({ role: { $ne: 'ADMIN_MANAGER' } });
                console.log(`Deleted ${res.deletedCount} users (kept ADMIN_MANAGER).`);
            }
            if (target === 'products' || target === 'all') {
                const Product = require('./models/inventory/Product.model');
                const res = await Product.deleteMany({});
                console.log(`Deleted ${res.deletedCount} products.`);
            }
            if (target === 'sales' || target === 'all') {
                const Sale = require('./models/sales/Sale.model');
                const DailyClose = require('./models/sales/DailyClose.model');
                const Receipt = require('./models/sales/Receipt.model');
                const Payment = require('./models/payment/Payment.model');
                const StockMovement = require('./models/misc/StockMovement.model');
                
                let count = 0;
                count += (await Sale.deleteMany({})).deletedCount;
                count += (await DailyClose.deleteMany({})).deletedCount;
                count += (await Receipt.deleteMany({})).deletedCount;
                count += (await Payment.deleteMany({})).deletedCount;
                count += (await StockMovement.deleteMany({ type: "SALE" })).deletedCount;
                console.log(`Deleted ${count} sales records (including DailyClose, Receipts, Payments, and StockMovements).`);
            }
            console.log("Data wipe complete.");
        } catch (error) {
            console.error("Error wiping data:", error.message);
        }
    } else {
        console.log("Aborted.");
    }
    
    console.log("\n");
    await showMenu();
}

// Start
connectDB().then(() => showMenu()).catch(console.error);
