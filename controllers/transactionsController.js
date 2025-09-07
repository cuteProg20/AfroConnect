import smsService from '../services/smsService.js';

// In-memory storage for demo purposes
// In production, you'd use a proper database
let transactions = [
  {
    id: 1,
    farmerId: 1,
    buyerId: 1,
    cropType: 'Maize',
    quantity: 100,
    unit: 'kg',
    pricePerUnit: 50,
    totalAmount: 5000,
    currency: 'KES',
    status: 'completed',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    deliveryDate: '2024-01-15',
    deliveryLocation: 'Nairobi',
    notes: 'High quality maize, well dried',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 2,
    farmerId: 2,
    buyerId: 2,
    cropType: 'Rice',
    quantity: 50,
    unit: 'kg',
    pricePerUnit: 80,
    totalAmount: 4000,
    currency: 'KES',
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    deliveryDate: '2024-01-20',
    deliveryLocation: 'Mombasa',
    notes: 'Premium rice variety',
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString()
  }
];

let nextTransactionId = 3;

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const { status, farmerId, buyerId, cropType } = req.query;
    
    let filteredTransactions = transactions;
    
    // Apply filters if provided
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }
    if (farmerId) {
      filteredTransactions = filteredTransactions.filter(t => t.farmerId === parseInt(farmerId));
    }
    if (buyerId) {
      filteredTransactions = filteredTransactions.filter(t => t.buyerId === parseInt(buyerId));
    }
    if (cropType) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.cropType.toLowerCase().includes(cropType.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredTransactions,
      count: filteredTransactions.length,
      filters: { status, farmerId, buyerId, cropType }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = transactions.find(t => t.id === parseInt(id));
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
      message: error.message
    });
  }
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    const {
      farmerId,
      buyerId,
      cropType,
      quantity,
      unit,
      pricePerUnit,
      deliveryDate,
      deliveryLocation,
      paymentMethod,
      notes
    } = req.body;
    
    // Validation
    if (!farmerId || !buyerId || !cropType || !quantity || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        error: 'farmerId, buyerId, cropType, quantity, and pricePerUnit are required'
      });
    }
    
    const totalAmount = quantity * pricePerUnit;
    
    const newTransaction = {
      id: nextTransactionId++,
      farmerId: parseInt(farmerId),
      buyerId: parseInt(buyerId),
      cropType,
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      pricePerUnit: parseFloat(pricePerUnit),
      totalAmount,
      currency: 'KES',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'cash',
      deliveryDate: deliveryDate || null,
      deliveryLocation: deliveryLocation || '',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    
    // Send notification SMS to both parties
    try {
      // Note: In a real app, you'd fetch farmer and buyer phone numbers from database
      const notificationMessage = `New transaction created: ${quantity}${unit} of ${cropType} for KES ${totalAmount}. Transaction ID: ${newTransaction.id}`;
      // await smsService.sendSMS(farmerPhone, notificationMessage);
      // await smsService.sendSMS(buyerPhone, notificationMessage);
    } catch (smsError) {
      console.error('Failed to send transaction notification SMS:', smsError);
    }
    
    res.status(201).json({
      success: true,
      data: newTransaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction',
      message: error.message
    });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const transactionIndex = transactions.findIndex(t => t.id === parseInt(id));
    
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Recalculate total amount if quantity or price changes
    const currentTransaction = transactions[transactionIndex];
    const quantity = updateData.quantity || currentTransaction.quantity;
    const pricePerUnit = updateData.pricePerUnit || currentTransaction.pricePerUnit;
    const totalAmount = quantity * pricePerUnit;
    
    // Update transaction data
    transactions[transactionIndex] = {
      ...currentTransaction,
      ...updateData,
      totalAmount,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: transactions[transactionIndex],
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction',
      message: error.message
    });
  }
};

// Update transaction status
const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const transactionIndex = transactions.findIndex(t => t.id === parseInt(id));
    
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ')
      });
    }
    
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment status. Valid payment statuses: ' + validPaymentStatuses.join(', ')
      });
    }
    
    // Update status
    if (status) {
      transactions[transactionIndex].status = status;
    }
    if (paymentStatus) {
      transactions[transactionIndex].paymentStatus = paymentStatus;
    }
    
    transactions[transactionIndex].updatedAt = new Date().toISOString();
    
    // Send status update SMS
    try {
      const transaction = transactions[transactionIndex];
      const statusMessage = `Transaction ${transaction.id} status updated: ${status || transaction.status}${paymentStatus ? `, Payment: ${paymentStatus}` : ''}`;
      // await smsService.sendSMS(farmerPhone, statusMessage);
      // await smsService.sendSMS(buyerPhone, statusMessage);
    } catch (smsError) {
      console.error('Failed to send status update SMS:', smsError);
    }
    
    res.json({
      success: true,
      data: transactions[transactionIndex],
      message: 'Transaction status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction status',
      message: error.message
    });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transactionIndex = transactions.findIndex(t => t.id === parseInt(id));
    
    if (transactionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    const deletedTransaction = transactions.splice(transactionIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedTransaction,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
      message: error.message
    });
  }
};

// Get transactions by farmer
const getTransactionsByFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const farmerTransactions = transactions.filter(t => t.farmerId === parseInt(farmerId));
    
    res.json({
      success: true,
      data: farmerTransactions,
      count: farmerTransactions.length,
      farmerId: parseInt(farmerId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch farmer transactions',
      message: error.message
    });
  }
};

// Get transactions by buyer
const getTransactionsByBuyer = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const buyerTransactions = transactions.filter(t => t.buyerId === parseInt(buyerId));
    
    res.json({
      success: true,
      data: buyerTransactions,
      count: buyerTransactions.length,
      buyerId: parseInt(buyerId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buyer transactions',
      message: error.message
    });
  }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const totalValue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const completedValue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.totalAmount, 0);
    
    // Group by crop type
    const cropStats = transactions.reduce((acc, t) => {
      if (!acc[t.cropType]) {
        acc[t.cropType] = { count: 0, totalValue: 0, totalQuantity: 0 };
      }
      acc[t.cropType].count++;
      acc[t.cropType].totalValue += t.totalAmount;
      acc[t.cropType].totalQuantity += t.quantity;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        overview: {
          totalTransactions,
          completedTransactions,
          pendingTransactions,
          totalValue,
          completedValue,
          averageTransactionValue: totalTransactions > 0 ? totalValue / totalTransactions : 0
        },
        cropStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction statistics',
      message: error.message
    });
  }
};

export default {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  updateTransactionStatus,
  deleteTransaction,
  getTransactionsByFarmer,
  getTransactionsByBuyer,
  getTransactionStats
};