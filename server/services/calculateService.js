/**
 * Calculate expense splits for an event
 * @param {Object} event - The event object
 * @param {Array} members - Array of member objects
 * @param {Array} fees - Array of fee objects
 * @returns {Object} Object containing transactions array
 */
function calculateExpenses(event, members, fees) {
  if (!event || !event.memberIds || !event.memberIds.length) {
    throw new Error('Invalid event data');
  }

  if (!members || !members.length) {
    throw new Error('No members provided');
  }

  if (!fees || !fees.length) {
    return { transactions: [] };
  }

  try {
    // Create a map of member balances
    const balances = {};
    event.memberIds.forEach(memberId => {
      balances[memberId] = 0;
    });

    // Calculate what each person paid and what they owe
    fees.forEach(fee => {
      if (!fee || typeof fee.price !== 'number') {
        throw new Error(`Invalid fee data: ${JSON.stringify(fee)}`);
      }
      
      // Skip fees with zero price
      if (fee.price === 0) {
        return;
      }
      
      const paidBy = fee.paidBy;
      const sharedBy = fee.memberIds && fee.memberIds.length ? fee.memberIds : event.memberIds;
      
      if (!sharedBy || !sharedBy.length) {
        throw new Error(`No members to share fee: ${fee.feeName}`);
      }
      
      // Validate paidBy member
      if (!paidBy) {
        throw new Error(`No payer specified for fee: ${fee.feeName}`);
      }
      
      if (balances[paidBy] === undefined) {
        throw new Error(`Paid by member not found in event: ${paidBy}`);
      }
      
      const amountPerPerson = fee.price / sharedBy.length;
      
      // Add the full amount to the person who paid
      balances[paidBy] += fee.price;
      
      // Subtract the share from each person who owes
      sharedBy.forEach(memberId => {
        if (balances[memberId] === undefined) {
          throw new Error(`Member not found in event: ${memberId}`);
        }
        balances[memberId] -= amountPerPerson;
      });
    });

    // Convert balances to an array of objects
    const balanceArray = Object.entries(balances).map(([memberId, balance]) => {
      const member = members.find(m => m.memberId === memberId);
      if (!member) {
        throw new Error(`Member data not found for ID: ${memberId}`);
      }
      return {
        memberId,
        memberName: member.memberName,
        balance: parseFloat(balance.toFixed(2)) // Fix floating point precision issues
      };
    });

    // Calculate who owes whom
    const transactions = calculateTransactions(balanceArray);
    
    return {
      transactions,
      debug: {
        balances: balanceArray
      }
    };
  } catch (err) {
    throw new Error(`Failed to calculate expenses: ${err.message}`);
  }
}

/**
 * Calculate transactions to settle balances
 * @param {Array} balances - Array of balance objects
 * @returns {Array} Array of transaction objects
 */
function calculateTransactions(balances) {
  try {
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
  } catch (err) {
    throw new Error(`Failed to calculate transactions: ${err.message}`);
  }
}

module.exports = {
  calculateExpenses
};