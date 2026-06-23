const express = require('express');
const errorHandler = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');
const saleRoutes = require('./routes/saleRoutes'); // Adjust path as needed

const app = express();

app.use(express.json());

// Mount the sales routes. 
app.use('/api/v1/sales', saleRoutes);

// The error handler must be the last middleware added to the app
app.use(errorHandler);

// Catch errors outside of Express (Uncaught Exceptions)
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception! Shutting down...');
  logger.error(err.stack);
  process.exit(1);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection! Shutting down...');
  logger.error(err.stack);
  process.exit(1);
});