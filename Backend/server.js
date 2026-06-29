require('./config/env');
const app = require('./app');
const { connectToDatabase } = require('./database/db');

const port = process.env.PORT;
console.log('[DEBUG] Backend port: ' + port);

var authRoutes = [];
app.router.stack.forEach(function(layer) {
  if (layer.name === 'router' && layer.handle && layer.handle.stack) {
    layer.handle.stack.forEach(function(inner) {
      if (inner.route && ['/signup', '/signin', '/signout', '/me'].indexOf(inner.route.path) !== -1) {
        authRoutes.push(inner.route.path + ' [' + Object.keys(inner.route.methods).join(',') + ']');
      }
    });
  }
});
console.log('[DEBUG] Auth routes mounted: ' + (authRoutes.length > 0 ? 'YES (' + authRoutes.join(', ') + ')' : 'NO'));

// connect to the database
connectToDatabase().then(async function() {
    const Alert = require('./models/system/Alert.model');
    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
        await Alert.insertMany([
            { type: 'LOGIN', severity: 'INFO', title: 'System Login', message: 'Admin logged in successfully.' },
            { type: 'FAILED_LOGIN', severity: 'WARNING', title: 'Failed Login Attempt', message: 'Multiple failed logins from 192.168.1.1' },
            { type: 'LOW_STOCK', severity: 'INFO', title: 'Low Stock: Cola', message: 'Cola has only 10 items left.' },
            { type: 'CRITICAL_STOCK', severity: 'WARNING', title: 'Critical Stock: Pepsi', message: 'Pepsi has only 2 items left.' },
            { type: 'OUT_OF_STOCK', severity: 'CRITICAL', title: 'Out of Stock: Water', message: 'Water is completely out of stock.' },
            { type: 'SUSPICIOUS_ACTIVITY', severity: 'CRITICAL', title: 'Suspicious Activity Detected', message: 'Unusual amount of voided receipts.' }
        ]);
        console.log('Seeded sample alerts');
    }

    const adminEmail = process.env.BOOTSTRAP_ADMIN_MANAGER_EMAIL || process.env.SUPER_EMAIL;
    const adminPassword = process.env.BOOTSTRAP_ADMIN_MANAGER_PASSWORD || process.env.SUPER_PASSWORD;
    const adminName = process.env.BOOTSTRAP_ADMIN_MANAGER_NAME || process.env.SUPER_USERNAME || 'Admin';

    if (adminEmail && adminPassword) {
        const User = require('./models/users/User.model');
        const { ROLES } = require('./constants/roles');
        const existSuper = await User.findOne({ email: adminEmail.trim().toLowerCase() });
        
        if (!existSuper) {
            const bcryptjs = require("bcryptjs");
            const hashed = await bcryptjs.hash(adminPassword, 10);
            await new User({
                username: adminName.trim(),
                email: adminEmail.trim().toLowerCase(),
                password: hashed,
                role: ROLES.ADMIN_MANAGER,
                shopId: null,
                status: "ACTIVE",
            }).save();
            console.log('Bootstrap Admin Manager created automatically.');
        } else {
            console.log('Bootstrap Admin Manager already exists.');
        }
    }

    app.listen(port, "0.0.0.0", function() {
        console.log('Server is running on 0.0.0.0:' + port);
    });
}).catch(function(error) {
    console.error('Failed to connect to database:', error.message);
    process.exitCode = 1;
});
