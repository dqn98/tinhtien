const Event = require('../models/eventModel');
const Fee = require('../models/feeModel');
const Member = require('../models/memberModel');

exports.calculateExpenses = async (eventId) => {
  try {
    // Get event details
    const event = await Event.findOne({ eventId });
    if (!event) {
      throw new Error('Event not found');
    }

    // Get all fees for the event
    const fees = await Fee.find({ eventId });
    
    // Get all members in the event
    const members = await Member.find({ memberId: { $in: event.memberIds } });
    
    // Initialize result object
    const result = {
      eventDetails: event,
      totalExpense: 0,
      memberShares: {}
    };
    
    // Initialize member shares
    members.forEach(member => {
      result.memberShares[member.memberId] = {
        memberId: member.memberId,
        memberName: member.memberName,
        share: 0,
        feeBreakdown: []
      };
    });
    
    // Calculate shares for each fee
    fees.forEach(fee => {
      result.totalExpense += fee.price;
      
      // Determine which members are subject to this fee
      const applicableMembers = fee.memberIds.length > 0 
        ? fee.memberIds 
        : event.memberIds;
      
      const sharePerMember = fee.price / applicableMembers.length;
      
      // Add share to each applicable member
      applicableMembers.forEach(memberId => {
        if (result.memberShares[memberId]) {
          result.memberShares[memberId].share += sharePerMember;
          result.memberShares[memberId].feeBreakdown.push({
            feeId: fee.feeId,
            feeName: fee.feeName,
            amount: sharePerMember
          });
        }
      });
    });
    
    // Convert to array and round to 2 decimal places
    result.memberShares = Object.values(result.memberShares).map(member => {
      member.share = parseFloat(member.share.toFixed(2));
      member.feeBreakdown.forEach(fee => {
        fee.amount = parseFloat(fee.amount.toFixed(2));
      });
      return member;
    });
    
    return result;
  } catch (error) {
    throw error;
  }
};