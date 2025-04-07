const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const { v4: uuidv4 } = require('uuid');

// Get all members
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all members');
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a specific member
router.get('/:memberId', async (req, res) => {
  try {
    console.log(`Fetching member with ID: ${req.params.memberId}`);
    const member = await Member.findOne({ memberId: req.params.memberId });
    if (!member) {
      console.log(`Member not found: ${req.params.memberId}`);
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (err) {
    console.error(`Error fetching member ${req.params.memberId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new member
router.post('/', async (req, res) => {
  try {
    const { memberName, email, phone } = req.body;
    console.log('Creating new member:', memberName);
    
    const newMember = new Member({
      memberId: uuidv4(),
      memberName,
      email,
      phone,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedMember = await newMember.save();
    console.log(`Member created with ID: ${savedMember.memberId}`);
    res.status(201).json(savedMember);
  } catch (err) {
    console.error('Error creating member:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update a member
router.put('/:memberId', async (req, res) => {
  try {
    console.log(`Updating member with ID: ${req.params.memberId}`);
    const { memberName, email, phone } = req.body;
    
    const updatedMember = await Member.findOneAndUpdate(
      { memberId: req.params.memberId },
      { 
        memberName, 
        email, 
        phone,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedMember) {
      console.log(`Member not found for update: ${req.params.memberId}`);
      return res.status(404).json({ message: 'Member not found' });
    }
    
    console.log(`Member updated: ${updatedMember.memberId}`);
    res.json(updatedMember);
  } catch (err) {
    console.error(`Error updating member ${req.params.memberId}:`, err);
    res.status(400).json({ error: err.message });
  }
});

// Delete a member
router.delete('/:memberId', async (req, res) => {
  try {
    console.log(`Deleting member with ID: ${req.params.memberId}`);
    const deletedMember = await Member.findOneAndDelete({ memberId: req.params.memberId });
    
    if (!deletedMember) {
      console.log(`Member not found for deletion: ${req.params.memberId}`);
      return res.status(404).json({ message: 'Member not found' });
    }
    
    console.log(`Member deleted: ${req.params.memberId}`);
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error(`Error deleting member ${req.params.memberId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;