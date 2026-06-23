const dotenv = require('dotenv');
const app = require('./app');
const { connectToDatabase } = require('./database/db');

dotenv.config();

// connect to the database
connectToDatabase().then(() => {
    const port = process.env.PORT || 5000;

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((error) => {
    console.error('Failed to connect to database:', error);
});