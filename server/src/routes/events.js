const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { v4: uuidv4 } = require('uuid');

// Get all events
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all events');
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a specific event
router.get('/:eventId', async (req, res) => {
  try {
    console.log(`Fetching event with ID: ${req.params.eventId}`);
    const event = await Event.findOne({ eventId: req.params.eventId });
    if (!event) {
      console.log(`Event not found: ${req.params.eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    console.error(`Error fetching event ${req.params.eventId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { eventName, description, memberIds } = req.body;
    console.log('Creating new event:', eventName);
    
    const newEvent = new Event({
      eventId: uuidv4(),
      eventName,
      description,
      memberIds: memberIds || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedEvent = await newEvent.save();
    console.log(`Event created with ID: ${savedEvent.eventId}`);
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update an event
router.put('/:eventId', async (req, res) => {
  try {
    console.log(`Updating event with ID: ${req.params.eventId}`);
    const { eventName, description, memberIds } = req.body;
    
    const updatedEvent = await Event.findOneAndUpdate(
      { eventId: req.params.eventId },
      { 
        eventName, 
        description, 
        memberIds,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedEvent) {
      console.log(`Event not found for update: ${req.params.eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log(`Event updated: ${updatedEvent.eventId}`);
    res.json(updatedEvent);
  } catch (err) {
    console.error(`Error updating event ${req.params.eventId}:`, err);
    res.status(400).json({ error: err.message });
  }
});

// Delete an event
router.delete('/:eventId', async (req, res) => {
  try {
    console.log(`Deleting event with ID: ${req.params.eventId}`);
    const deletedEvent = await Event.findOneAndDelete({ eventId: req.params.eventId });
    
    if (!deletedEvent) {
      console.log(`Event not found for deletion: ${req.params.eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log(`Event deleted: ${req.params.eventId}`);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(`Error deleting event ${req.params.eventId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Add this route for expense calculation
router.get('/:eventId/calculate', async (req, res) => {
  try {
    console.log(`Calculating expenses for event ID: ${req.params.eventId}`);
    const event = await Event.findOne({ eventId: req.params.eventId });
    
    if (!event) {
      console.log(`Event not found for calculation: ${req.params.eventId}`);
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get all members
    const Member = require('../models/Member');
    const members = await Member.find();
    
    // Get fees for this event
    const Fee = require('../models/Fee');
    const fees = await Fee.find({ eventId: req.params.eventId });
    
    if (!fees || fees.length === 0) {
      console.log(`No fees found for event: ${req.params.eventId}`);
      return res.json({ transactions: [] });
    }
    
    // Create a map of member balances
    const balances = {};
    if (event.memberIds && event.memberIds.length > 0) {
      event.memberIds.forEach(memberId => {
        balances[memberId] = 0;
      });
    } else {
      console.log(`No members found for event: ${req.params.eventId}`);
      return res.status(400).json({ error: 'No members in this event' });
    }
    
    // Process each fee
    for (const fee of fees) {
      if (!fee.price || fee.price === 0) {
        continue; // Skip fees with no price
      }
      
      // Handle case where no payer is specified
      if (!fee.paidBy) {
        console.log(`No payer specified for fee: ${fee.feeName}. Assigning first member as payer.`);
        
        // Assign the first member as the payer
        fee.paidBy = event.memberIds[0];
        
        // Update the fee in the database
        await Fee.findOneAndUpdate(
          { feeId: fee.feeId },
          { paidBy: fee.paidBy },
          { new: true }
        );
        
        console.log(`Updated fee ${fee.feeName} with payer: ${fee.paidBy}`);
      }
      
      // Determine who shares this expense
      let sharedBy = fee.memberIds && fee.memberIds.length > 0 
        ? fee.memberIds 
        : event.memberIds;
      
      // If no members are specified to share the fee, use all event members
      if (!sharedBy || sharedBy.length === 0) {
        sharedBy = event.memberIds;
        
        // Update the fee with all members
        await Fee.findOneAndUpdate(
          { feeId: fee.feeId },
          { memberIds: event.memberIds },
          { new: true }
        );
        
        console.log(`Updated fee ${fee.feeName} with all members`);
      }
      
      // Calculate per-person amount
      const amountPerPerson = fee.price / sharedBy.length;
      
      // Add the full amount to the person who paid
      if (balances[fee.paidBy] !== undefined) {
        balances[fee.paidBy] += fee.price;
      } else {
        console.log(`Invalid payer ID for fee ${fee.feeName}: ${fee.paidBy}`);
        return res.status(400).json({ 
          error: `Invalid payer ID for fee: ${fee.feeName}` 
        });
      }
      
      // Subtract the share from each person who owes
      sharedBy.forEach(memberId => {
        if (balances[memberId] !== undefined) {
          balances[memberId] -= amountPerPerson;
        }
      });
    }
    
    // Convert balances to an array of objects with member names
    const balanceArray = [];
    for (const [memberId, balance] of Object.entries(balances)) {
      const member = members.find(m => m.memberId === memberId);
      if (member) {
        balanceArray.push({
          memberId,
          memberName: member.memberName,
          balance: parseFloat(balance.toFixed(2)) // Fix floating point precision issues
        });
      }
    }
    
    // Calculate transactions
    const transactions = calculateTransactions(balanceArray);
    
    console.log(`Calculation complete for event: ${req.params.eventId}`);
    res.json({ transactions });
  } catch (err) {
    console.error(`Error calculating expenses for event ${req.params.eventId}:`, err);
    res.status(500).json({ error: `Failed to calculate expenses: ${err.message}` });
  }
});

// Helper function to calculate transactions from balances
function calculateTransactions(balances) {
  // Sort balances by amount (negative = owes money, positive = is owed money)
  const sortedBalances = [...balances].sort((a, b) => a.balance - b.balance);
  
  const transactions = [];
  let i = 0; // index of person who owes money (negative balance)
  let j = sortedBalances.length - 1; // index of person who is owed money (positive balance)
  
  while (i < j) {
    const debtor = sortedBalances[i];
    const creditor = sortedBalances[j];
    
    // Skip people with zero balance
    if (Math.abs(debtor.balance) < 0.01) {
      i++;
      continue;
    }
    
    if (Math.abs(creditor.balance) < 0.01) {
      j--;
      continue;
    }
    
    // Calculate the amount to transfer
    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
    
    if (amount > 0.01) { // Only create transactions for non-trivial amounts
      transactions.push({
        from: debtor.memberId,
        fromName: debtor.memberName,
        to: creditor.memberId,
        toName: creditor.memberName,
        amount: parseFloat(amount.toFixed(2))
      });
      
      // Update balances
      debtor.balance = parseFloat((debtor.balance + amount).toFixed(2));
      creditor.balance = parseFloat((creditor.balance - amount).toFixed(2));
    }
    
    // Move to next person if balance is settled
    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j--;
  }
  
  return transactions;
}

module.exports = router;