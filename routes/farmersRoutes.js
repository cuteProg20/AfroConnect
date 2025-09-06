import express from 'express'; 
// const express = require('express');
const router = express.Router();
const farmersController = require('../controllers/farmersController');

// GET /api/farmers - Get all farmers
router.get('/', farmersController.getAllFarmers);

// GET /api/farmers/:id - Get farmer by ID
router.get('/:id', farmersController.getFarmerById);

// POST /api/farmers - Create new farmer
router.post('/', farmersController.createFarmer);

// PUT /api/farmers/:id - Update farmer
router.put('/:id', farmersController.updateFarmer);

// DELETE /api/farmers/:id - Delete farmer
router.delete('/:id', farmersController.deleteFarmer);

// POST /api/farmers/:id/sms - Send SMS to specific farmer
router.post('/:id/sms', farmersController.sendSMSToFarmer);

// POST /api/farmers/bulk-sms - Send SMS to all farmers
router.post('/bulk-sms', farmersController.sendBulkSMS);

module.exports = router;