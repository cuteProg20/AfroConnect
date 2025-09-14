// const express = require('express');
import express from 'express';
const router = express.Router();
import ussdController from '../controllers/ussdController.js';

// POST /ussd - Handle USSD requests from Africa's Talking
router.post('/', ussdController.handleUSSD);

// GET /ussd/sessions - Get current USSD sessions (for debugging)
router.get('/sessions', ussdController.getUSSDSessions);

// DELETE /ussd/sessions - Clear all USSD sessions (for debugging)
router.delete('/sessions', ussdController.clearUSSDSessions);

// module.exports = router;
export default router;