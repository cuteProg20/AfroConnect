import smsService from '../services/smsService.js';
import { buyersDB } from '../services/databaseService.js';

// Get all buyers
const getAllBuyers = async (req, res) => {
  try {
    const result = await buyersDB.getAll();
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      count: result.count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buyers',
      message: error.message
    });
  }
};

// Get buyer by ID
const getBuyerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await buyersDB.getById(id);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    if (!result.data) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buyer',
      message: error.message
    });
  }
};

// Create new buyer
const createBuyer = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      location, 
      businessType, 
      interestedCrops, 
      paymentTerms 
    } = req.body;
    
    // Validation
    if (!name || !phone || !location) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and location are required'
      });
    }
    
    const buyerData = {
      name,
      phone,
      email: email || null,
      location,
      business_type: businessType || '',
      interested_crops: Array.isArray(interestedCrops) ? interestedCrops : [],
      payment_terms: paymentTerms || ''
    };
    
    const result = await buyersDB.create(buyerData);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    // Send welcome SMS
    try {
      await smsService.sendBuyerWelcomeSMS(phone, name);
    } catch (smsError) {
      console.error('Failed to send welcome SMS:', smsError);
      // Don't fail the registration if SMS fails
    }
    
    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Buyer registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create buyer',
      message: error.message
    });
  }
};

// Update buyer
const updateBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      phone, 
      email, 
      location, 
      businessType, 
      interestedCrops, 
      paymentTerms 
    } = req.body;
    
    // Check if buyer exists
    const existingResult = await buyersDB.getById(id);
    if (!existingResult.success || !existingResult.data) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (location) updateData.location = location;
    if (businessType !== undefined) updateData.business_type = businessType;
    if (interestedCrops !== undefined) updateData.interested_crops = Array.isArray(interestedCrops) ? interestedCrops : [];
    if (paymentTerms !== undefined) updateData.payment_terms = paymentTerms;
    
    const result = await buyersDB.update(id, updateData);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      message: 'Buyer updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update buyer',
      message: error.message
    });
  }
};

// Delete buyer
const deleteBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await buyersDB.delete(id);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      message: 'Buyer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete buyer',
      message: error.message
    });
  }
};

// Send SMS to buyer
const sendSMSToBuyer = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    const result = await buyersDB.getById(id);
    
    if (!result.success || !result.data) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    const smsResult = await smsService.sendSMS(result.data.phone, message);
    
    res.json({
      success: true,
      data: smsResult,
      message: 'SMS sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send SMS',
      message: error.message
    });
  }
};

// Send bulk SMS to all buyers
const sendBulkSMSToBuyers = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    const result = await buyersDB.getAll();
    
    if (!result.success || result.data.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No buyers found to send SMS'
      });
    }
    
    const phoneNumbers = result.data.map(buyer => buyer.phone);
    const smsResult = await smsService.sendBulkSMS(phoneNumbers, message);
    
    res.json({
      success: true,
      data: smsResult,
      message: `SMS sent to ${phoneNumbers.length} buyers`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk SMS',
      message: error.message
    });
  }
};

// Get buyers interested in specific crop
const getBuyersByCrop = async (req, res) => {
  try {
    const { crop } = req.params;
    
    const result = await buyersDB.getByCrop(crop);
    
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
      crop: crop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch buyers by crop',
      message: error.message
    });
  }
};

export default {
  getAllBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer,
  sendSMSToBuyer,
  sendBulkSMSToBuyers,
  getBuyersByCrop
};