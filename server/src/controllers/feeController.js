const Fee = require('../models/feeModel');

// Get all fees
exports.getFees = async (req, res) => {
  try {
    const fees = await Fee.find();
    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single fee
exports.getFee = async (req, res) => {
  try {
    const fee = await Fee.findOne({ feeId: req.params.feeId });
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new fee
exports.createFee = async (req, res) => {
  try {
    const fee = new Fee(req.body);
    const savedFee = await fee.save();
    res.status(201).json(savedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update fee
exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findOneAndUpdate(
      { feeId: req.params.feeId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    res.status(200).json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete fee
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findOneAndDelete({ feeId: req.params.feeId });
    
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    
    res.status(200).json({ message: 'Fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};