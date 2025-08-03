const express = require('express');
const cors = require('cors');
require('dotenv').config();

const farmersRoutes = require('./routes/farmersRoutes');
const buyersRoutes = require('./routes/buyersRoutes');
const transactionsRoutes = require('./routes/transactionsRoutes');
const ussdRoutes = require('./routes/ussdRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/farmers', farmersRoutes);
app.use('/api/buyers', buyersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/ussd', ussdRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});