const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', eventController.getEvents);

// Create a new event
router.post('/', eventController.createEvent);

// Get a single event
router.get('/:eventId', eventController.getEvent);

// Update an event
router.put('/:eventId', eventController.updateEvent);

// Delete an event
router.delete('/:eventId', eventController.deleteEvent);

// Calculate expenses for an event
router.get('/:eventId/calculate', eventController.calculateExpenses);

module.exports = router;