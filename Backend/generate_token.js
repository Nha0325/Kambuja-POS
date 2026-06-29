require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { 
        id: '6a40f8e1538959ed557cd5ac', 
        role: 'CASHIER',
        shopId: '6a40f8450f0cdae3e61aa7c2' 
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
);

console.log("TOKEN:", token);
