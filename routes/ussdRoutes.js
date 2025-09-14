<<<<<<< HEAD
import express from 'express';
import ussdController from '../controllers/ussdController.js';

const router = express.Router();
=======
// const express = require('express');
import express from 'express';
const router = express.Router();
import ussdController from '../controllers/ussdController.js';
>>>>>>> development

// POST /ussd - Handle USSD requests from Africa's Talking
router.post('/', ussdController.handleUSSD);

// GET /ussd/sessions - Get current USSD sessions (for debugging)
router.get('/sessions', ussdController.getUSSDSessions);

// DELETE /ussd/sessions - Clear all USSD sessions (for debugging)
router.delete('/sessions', ussdController.clearUSSDSessions);

<<<<<<< HEAD
=======
// module.exports = router;
>>>>>>> development
export default router;