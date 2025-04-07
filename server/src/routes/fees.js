const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const { v4: uuidv4 } = require('uuid');

// Get all fees
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all fees');
    const fees = await Fee.find();
    res.json(fees);
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get fees for a specific event
router.get('/event/:eventId', async (req, res) => {
  try {
    console.log(`Fetching fees for event ID: ${req.params.eventId}`);
    const fees = await Fee.find({ eventId: req.params.eventId });
    res.json(fees);
  } catch (err) {
    console.error(`Error fetching fees for event ${req.params.eventId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Get a specific fee
router.get('/:feeId', async (req, res) => {
  try {
    console.log(`Fetching fee with ID: ${req.params.feeId}`);
    const fee = await Fee.findOne({ feeId: req.params.feeId });
    if (!fee) {
      console.log(`Fee not found: ${req.params.feeId}`);
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.json(fee);
  } catch (err) {
    console.error(`Error fetching fee ${req.params.feeId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new fee
router.post('/', async (req, res) => {
  try {
    const { feeName, description, price, paidBy, memberIds, eventId } = req.body;
    console.log(`Creating new fee: ${feeName} for event: ${eventId}`);
    
    const newFee = new Fee({
      feeId: uuidv4(),
      feeName,
      description,
      price,
      paidBy,
      memberIds,
      eventId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedFee = await newFee.save();
    console.log(`Fee created with ID: ${savedFee.feeId}`);
    res.status(201).json(savedFee);
  } catch (err) {
    console.error('Error creating fee:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update a fee
router.put('/:feeId', async (req, res) => {
  try {
    console.log(`Updating fee with ID: ${req.params.feeId}`);
    const { feeName, description, price, paidBy, memberIds } = req.body;
    
    const updatedFee = await Fee.findOneAndUpdate(
      { feeId: req.params.feeId },
      { 
        feeName, 
        description, 
        price, 
        paidBy, 
        memberIds,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedFee) {
      console.log(`Fee not found for update: ${req.params.feeId}`);
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    console.log(`Fee updated: ${updatedFee.feeId}`);
    res.json(updatedFee);
  } catch (err) {
    console.error(`Error updating fee ${req.params.feeId}:`, err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a fee
router.delete('/:feeId', async (req, res) => {
  try {
    console.log(`Deleting fee with ID: ${req.params.feeId}`);
    const deletedFee = await Fee.findOneAndDelete({ feeId: req.params.feeId });
    
    if (!deletedFee) {
      console.log(`Fee not found for deletion: ${req.params.feeId}`);
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    console.log(`Fee deleted: ${req.params.feeId}`);
    res.json({ message: 'Fee deleted successfully' });
  } catch (err) {
    console.error(`Error deleting fee ${req.params.feeId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;