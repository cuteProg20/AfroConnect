const smsService = require('../services/smsService');

// In-memory storage for demo purposes
// In production, you'd use a proper database
let buyers = [
  {
    id: 1,
    name: 'ABC Agro Ltd',
    phone: '+254700000010',
    email: 'contact@abcagro.com',
    location: 'Nairobi',
    businessType: 'Wholesale',
    interestedCrops: ['Maize', 'Rice', 'Beans'],
    paymentTerms: 'Net 30',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Fresh Market Co',
    phone: '+254700000011',
    email: 'orders@freshmarket.com',
    location: 'Mombasa',
    businessType: 'Retail',
    interestedCrops: ['Vegetables', 'Fruits'],
    paymentTerms: 'Cash on delivery',
    createdAt: new Date().toISOString()
  }
];

let nextBuyerId = 3;

// Get all buyers
const getAllBuyers = async (req, res) => {
  try {
    res.json({
      success: true,
      data: buyers,
      count: buyers.length
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
    const buyer = buyers.find(b => b.id === parseInt(id));
    
    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    res.json({
      success: true,
      data: buyer
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
    
    // Check if phone number already exists
    const existingBuyer = buyers.find(b => b.phone === phone);
    if (existingBuyer) {
      return res.status(400).json({
        success: false,
        error: 'Buyer with this phone number already exists'
      });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = buyers.find(b => b.email === email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Buyer with this email already exists'
        });
      }
    }
    
    const newBuyer = {
      id: nextBuyerId++,
      name,
      phone,
      email: email || '',
      location,
      businessType: businessType || '',
      interestedCrops: Array.isArray(interestedCrops) ? interestedCrops : [],
      paymentTerms: paymentTerms || '',
      createdAt: new Date().toISOString()
    };
    
    buyers.push(newBuyer);
    
    // Send welcome SMS
    try {
      await smsService.sendBuyerWelcomeSMS(phone, name);
    } catch (smsError) {
      console.error('Failed to send welcome SMS:', smsError);
      // Don't fail the registration if SMS fails
    }
    
    res.status(201).json({
      success: true,
      data: newBuyer,
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
    
    const buyerIndex = buyers.findIndex(b => b.id === parseInt(id));
    
    if (buyerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    // Check if new phone number conflicts with existing buyer
    if (phone && phone !== buyers[buyerIndex].phone) {
      const existingBuyer = buyers.find(b => b.phone === phone && b.id !== parseInt(id));
      if (existingBuyer) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists for another buyer'
        });
      }
    }
    
    // Check if new email conflicts with existing buyer
    if (email && email !== buyers[buyerIndex].email) {
      const existingEmail = buyers.find(b => b.email === email && b.id !== parseInt(id));
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists for another buyer'
        });
      }
    }
    
    // Update buyer data
    buyers[buyerIndex] = {
      ...buyers[buyerIndex],
      ...(name && { name }),
      ...(phone && { phone }),
      ...(email !== undefined && { email }),
      ...(location && { location }),
      ...(businessType !== undefined && { businessType }),
      ...(interestedCrops !== undefined && { interestedCrops: Array.isArray(interestedCrops) ? interestedCrops : [] }),
      ...(paymentTerms !== undefined && { paymentTerms }),
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: buyers[buyerIndex],
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
    const buyerIndex = buyers.findIndex(b => b.id === parseInt(id));
    
    if (buyerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    const deletedBuyer = buyers.splice(buyerIndex, 1)[0];
    
    res.json({
      success: true,
      data: deletedBuyer,
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
    
    const buyer = buyers.find(b => b.id === parseInt(id));
    
    if (!buyer) {
      return res.status(404).json({
        success: false,
        error: 'Buyer not found'
      });
    }
    
    const result = await smsService.sendSMS(buyer.phone, message);
    
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
    
    const phoneNumbers = buyers.map(buyer => buyer.phone);
    
    if (phoneNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No buyers found to send SMS'
      });
    }
    
    const result = await smsService.sendBulkSMS(phoneNumbers, message);
    
    res.json({
      success: true,
      data: result,
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
    
    const interestedBuyers = buyers.filter(buyer => 
      buyer.interestedCrops.some(interestedCrop => 
        interestedCrop.toLowerCase().includes(crop.toLowerCase())
      )
    );
    
    res.json({
      success: true,
      data: interestedBuyers,
      count: interestedBuyers.length,
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

module.exports = {
  getAllBuyers,
  getBuyerById,
  createBuyer,
  updateBuyer,
  deleteBuyer,
  sendSMSToBuyer,
  sendBulkSMSToBuyers,
  getBuyersByCrop
};