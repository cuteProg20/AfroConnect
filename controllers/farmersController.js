const smsService = require('../services/smsService');

// In-memory storage for demo purposes
// In production, you'd use a proper database
let farmers = [
  {
    id: 1,
    name: 'John Doe',
    phone: '+254700000000',
    location: 'Nairobi',
    cropType: 'Maize',
    farmSize: '5 acres',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Jane Smith',
    phone: '+254700000001',
    location: 'Kisumu',
    cropType: 'Rice',
    farmSize: '3 acres',
    createdAt: new Date().toISOString()
  }
];

let nextId = 3;

// Get all farmers
const getAllFarmers = async (req, res) => {
  try {
    res.json({
      success: true,
      data: farmers,
      count: farmers.length
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
    const farmer = farmers.find(f => f.id === parseInt(id));
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    res.json({
      success: true,
      data: farmer
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
    const existingFarmer = farmers.find(f => f.phone === phone);
    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        error: 'Farmer with this phone number already exists'
      });
    }
    
    const newFarmer = {
      id: nextId++,
      name,
      phone,
      location,
      cropType: cropType || '',
      farmSize: farmSize || '',
      createdAt: new Date().toISOString()
    };
    
    farmers.push(newFarmer);
    
    // Send welcome SMS
    try {
      await smsService.sendWelcomeSMS(phone, name);
    } catch (smsError) {
      console.error('Failed to send welcome SMS:', smsError);
      // Don't fail the registration if SMS fails
    }
    
    res.status(201).json({
      success: true,
      data: newFarmer,
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
    
    const farmerIndex = farmers.findIndex(f => f.id === parseInt(id));
    
    if (farmerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    // Check if new phone number conflicts with existing farmer
    if (phone && phone !== farmers[farmerIndex].phone) {
      const existingFarmer = farmers.find(f => f.phone === phone && f.id !== parseInt(id));
      if (existingFarmer) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists for another farmer'
        });
      }
    }
    
    // Update farmer data
    farmers[farmerIndex] = {
      ...farmers[farmerIndex],
      ...(name && { name }),
      ...(phone && { phone }),
      ...(location && { location }),
      ...(cropType !== undefined && { cropType }),
      ...(farmSize !== undefined && { farmSize }),
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: farmers[farmerIndex],
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
    const farmerIndex = farmers.findIndex(f => f.id === parseInt(id));
    
    if (farmerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    const deletedFarmer = farmers.splice(farmerIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedFarmer,
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
    
    const farmer = farmers.find(f => f.id === parseInt(id));
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }
    
    const result = await smsService.sendSMS(farmer.phone, message);
    
    res.json({
      success: true,
      data: result,
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
    
    const phoneNumbers = farmers.map(farmer => farmer.phone);
    
    if (phoneNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No farmers found to send SMS'
      });
    }
    
    const result = await smsService.sendBulkSMS(phoneNumbers, message);
    
    res.json({
      success: true,
      data: result,
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

module.exports = {
  getAllFarmers,
  getFarmerById,
  createFarmer,
  updateFarmer,
  deleteFarmer,
  sendSMSToFarmer,
  sendBulkSMS
};