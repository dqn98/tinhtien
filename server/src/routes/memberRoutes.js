const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Get all members
router.get('/', memberController.getMembers);

// Create a new member
router.post('/', memberController.createMember);

// Get a single member
router.get('/:memberId', memberController.getMember);

// Update a member
router.put('/:memberId', memberController.updateMember);

// Delete a member
router.delete('/:memberId', memberController.deleteMember);

module.exports = router;