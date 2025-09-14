import express from 'express';
<<<<<<< HEAD
import buyersController from '../controllers/buyersController.js';

const router = express.Router();
=======
 const router = express.Router();
import buyersController from '../controllers/buyersController.js';
>>>>>>> development

// GET /api/buyers - Get all buyers
router.get('/', buyersController.getAllBuyers);

// GET /api/buyers/:id - Get buyer by ID
router.get('/:id', buyersController.getBuyerById);

// POST /api/buyers - Create new buyer
router.post('/', buyersController.createBuyer);

// PUT /api/buyers/:id - Update buyer
router.put('/:id', buyersController.updateBuyer);

// DELETE /api/buyers/:id - Delete buyer
router.delete('/:id', buyersController.deleteBuyer);

// POST /api/buyers/:id/sms - Send SMS to specific buyer
router.post('/:id/sms', buyersController.sendSMSToBuyer);

// POST /api/buyers/bulk-sms - Send SMS to all buyers
router.post('/bulk-sms', buyersController.sendBulkSMSToBuyers);

// GET /api/buyers/crop/:crop - Get buyers interested in specific crop
router.get('/crop/:crop', buyersController.getBuyersByCrop);

<<<<<<< HEAD
=======
// module.exports = router;
>>>>>>> development
export default router;