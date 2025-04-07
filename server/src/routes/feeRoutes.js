const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

// Get all fees
router.get('/', feeController.getFees);

// Create a new fee
router.post('/', feeController.createFee);

// Get a single fee
router.get('/:feeId', feeController.getFee);

// Update a fee
router.put('/:feeId', feeController.updateFee);

// Delete a fee
router.delete('/:feeId', feeController.deleteFee);

module.exports = router;