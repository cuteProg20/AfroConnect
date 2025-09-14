import express from 'express';
const router = express.Router();
import transactionsController from '../controllers/transactionsController.js';

// GET /api/transactions - Get all transactions (with optional filters)
router.get('/', transactionsController.getAllTransactions);

// GET /api/transactions/stats - Get transaction statistics
router.get('/stats', transactionsController.getTransactionStats);

// GET /api/transactions/:id - Get transaction by ID
router.get('/:id', transactionsController.getTransactionById);

// POST /api/transactions - Create new transaction
router.post('/', transactionsController.createTransaction);

// PUT /api/transactions/:id - Update transaction
router.put('/:id', transactionsController.updateTransaction);

// PATCH /api/transactions/:id/status - Update transaction status
router.patch('/:id/status', transactionsController.updateTransactionStatus);

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', transactionsController.deleteTransaction);

// GET /api/transactions/farmer/:farmerId - Get transactions by farmer
router.get('/farmer/:farmerId', transactionsController.getTransactionsByFarmer);

// GET /api/transactions/buyer/:buyerId - Get transactions by buyer
router.get('/buyer/:buyerId', transactionsController.getTransactionsByBuyer);

// module.exports = router;
export default router;