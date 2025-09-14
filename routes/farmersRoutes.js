import express from 'express';
import farmersController from '../controllers/farmersController.js';

const router = express.Router();

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

export default router;