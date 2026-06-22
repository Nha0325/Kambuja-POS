const mongoose = require('mongoose');

const connectToDatabase = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to the database successfully');
};

module.exports = {connectToDatabase}
