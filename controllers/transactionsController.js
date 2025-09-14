import smsService from '../services/smsService.js';
import { transactionsDB } from '../services/databaseService.js';

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const { status, farmerId, buyerId, cropType } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (farmerId) filters.farmerId = farmerId;
    if (buyerId) filters.buyerId = buyerId;
    if (cropType) filters.cropType = cropType;
    
    const result = await transactionsDB.getAll(filters);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      count: result.count,
      filters
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
    const result = await transactionsDB.getById(id);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    if (!result.data) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: result.data
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
    
    const totalAmount = parseFloat(quantity) * parseFloat(pricePerUnit);
    
    const transactionData = {
      farmer_id: farmerId,
      buyer_id: buyerId,
      crop_type: cropType,
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      price_per_unit: parseFloat(pricePerUnit),
      total_amount: totalAmount,
      currency: 'TSh',
      status: 'pending',
      payment_status: 'pending',
      payment_method: paymentMethod || 'cash',
      delivery_date: deliveryDate || null,
      delivery_location: deliveryLocation || '',
      notes: notes || ''
    };
    
    const result = await transactionsDB.create(transactionData);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    // Send notification SMS to both parties
    try {
      const transaction = result.data;
      const notificationMessage = `Muamala mpya umetengenezwa: ${quantity}${unit || 'kg'} ya ${cropType} kwa TSh ${totalAmount.toLocaleString()}. Nambari ya muamala: ${transaction.id}`;
      
      if (transaction.farmers && transaction.farmers.phone) {
        await smsService.sendSMS(transaction.farmers.phone, notificationMessage);
      }
      if (transaction.buyers && transaction.buyers.phone) {
        await smsService.sendSMS(transaction.buyers.phone, notificationMessage);
      }
    } catch (smsError) {
      console.error('Failed to send transaction notification SMS:', smsError);
    }
    
    res.status(201).json({
      success: true,
      data: result.data,
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
    
    // Recalculate total amount if quantity or price changes
    if (updateData.quantity || updateData.pricePerUnit) {
      const currentResult = await transactionsDB.getById(id);
      if (!currentResult.success || !currentResult.data) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }
      
      const current = currentResult.data;
      const quantity = updateData.quantity || current.quantity;
      const pricePerUnit = updateData.price_per_unit || updateData.pricePerUnit || current.price_per_unit;
      updateData.total_amount = parseFloat(quantity) * parseFloat(pricePerUnit);
      
      // Convert camelCase to snake_case for database
      if (updateData.pricePerUnit) {
        updateData.price_per_unit = updateData.pricePerUnit;
        delete updateData.pricePerUnit;
      }
    }
    
    const result = await transactionsDB.update(id, updateData);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
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
    
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.payment_status = paymentStatus;
    
    const result = await transactionsDB.update(id, updateData);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    // Send status update SMS
    try {
      const transaction = result.data;
      const statusMessage = `Muamala ${transaction.id} umebadilishwa: ${status || transaction.status}${paymentStatus ? `, Malipo: ${paymentStatus}` : ''}`;
      
      if (transaction.farmers && transaction.farmers.phone) {
        await smsService.sendSMS(transaction.farmers.phone, statusMessage);
      }
      if (transaction.buyers && transaction.buyers.phone) {
        await smsService.sendSMS(transaction.buyers.phone, statusMessage);
      }
    } catch (smsError) {
      console.error('Failed to send status update SMS:', smsError);
    }
    
    res.json({
      success: true,
      data: result.data,
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
    
    const result = await transactionsDB.delete(id);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
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
    
    const result = await transactionsDB.getAll({ farmerId });
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      count: result.count,
      farmerId
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
    
    const result = await transactionsDB.getAll({ buyerId });
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      count: result.count,
      buyerId
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
    const result = await transactionsDB.getStats();
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data
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