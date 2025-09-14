import smsService from '../services/smsService.js';
import { farmersDB } from '../services/databaseService.js';

// Get all farmers
const getAllFarmers = async (req, res) => {
  try {
    const result = await farmersDB.getAll();
    
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
      error: 'Failed to fetch farmers',
      message: error.message
    });
  }
};

// Get farmer by ID
const getFarmerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await farmersDB.getById(id);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    if (!result.data) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch farmer',
      message: error.message
    });
  }
};

// Create new farmer
const createFarmer = async (req, res) => {
  try {
    const { name, phone, location, cropType, farmSize } = req.body;
    
    // Validation
    if (!name || !phone || !location) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and location are required'
      });
    }
    
    // Check if phone number already exists
    const existingResult = await farmersDB.getByPhone(phone);
    if (existingResult.success && existingResult.data) {
      return res.status(400).json({
        success: false,
        error: 'Farmer with this phone number already exists'
      });
    }
    
    const farmerData = {
      name,
      phone,
      location,
      crop_type: cropType || '',
      farm_size: farmSize || ''
    };
    
    const result = await farmersDB.create(farmerData);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    // Send welcome SMS
    try {
      await smsService.sendWelcomeSMS(phone, name);
    } catch (smsError) {
      console.error('Failed to send welcome SMS:', smsError);
      // Don't fail the registration if SMS fails
    }
    
    res.status(201).json({
      success: true,
      data: result.data,
      message: 'Farmer registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create farmer',
      message: error.message
    });
  }
};

// Update farmer
const updateFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, location, cropType, farmSize } = req.body;
    
    // Check if farmer exists
    const existingResult = await farmersDB.getById(id);
    if (!existingResult.success || !existingResult.data) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    // Check if new phone number conflicts with existing farmer
    if (phone && phone !== existingResult.data.phone) {
      const phoneCheckResult = await farmersDB.getByPhone(phone);
      if (phoneCheckResult.success && phoneCheckResult.data) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists for another farmer'
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (cropType !== undefined) updateData.crop_type = cropType;
    if (farmSize !== undefined) updateData.farm_size = farmSize;
    
    const result = await farmersDB.update(id, updateData);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      message: 'Farmer updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update farmer',
      message: error.message
    });
  }
};

// Delete farmer
const deleteFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await farmersDB.delete(id);
    
    if (!result.success) {
      return res.status(result.code || 500).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      message: 'Farmer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete farmer',
      message: error.message
    });
  }
};

// Send SMS to farmer
const sendSMSToFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    const result = await farmersDB.getById(id);
    
    if (!result.success || !result.data) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
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

// Send bulk SMS to all farmers
const sendBulkSMS = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    const result = await farmersDB.getAll();
    
    if (!result.success || result.data.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No farmers found to send SMS'
      });
    }
    
    const phoneNumbers = result.data.map(farmer => farmer.phone);
    const smsResult = await smsService.sendBulkSMS(phoneNumbers, message);
    
    res.json({
      success: true,
      data: smsResult,
      message: `SMS sent to ${phoneNumbers.length} farmers`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk SMS',
      message: error.message
    });
  }
};

export default {
  getAllFarmers,
  getFarmerById,
  createFarmer,
  updateFarmer,
  deleteFarmer,
  sendSMSToFarmer,
  sendBulkSMS
};