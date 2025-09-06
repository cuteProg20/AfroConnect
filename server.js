import express, { json, urlencoded } from 'express';
import cors from 'cors';
require('dotenv').config();

import farmersRoutes from './routes/farmersRoutes';
import buyersRoutes from './routes/buyersRoutes';
import transactionsRoutes from './routes/transactionsRoutes';
import ussdRoutes from './routes/ussdRoutes';


// import express from 'express';
const app = express();
// const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

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

app.get('/', (req, res) => {
  res.send('Hello AfroConnect!');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});