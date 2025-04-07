import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import './Calculate.css';

function Calculate() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  // Add this state variable with the other state declarations
  const [event, setEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [fees, setFees] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculationError, setCalculationError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // Add this line
  
  // Fetch event, members, and fees data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching data for event: ${eventId}`);
        
        // Get event details
        const eventResponse = await apiService.getEvent(eventId);
        console.log('Event data:', eventResponse.data);
        const eventData = eventResponse.data;
        setEvent(eventData);
        
        // Get all members
        const membersResponse = await apiService.getMembers();
        const membersData = membersResponse.data;
        setMembers(membersData);
        
        // Get fees for this event
        const feesResponse = await apiService.getEventFees(eventId);
        const feesData = feesResponse.data;
        setFees(feesData);
        
        setLoading(false);
        
        // If we have fees and event data, calculate expenses
        if (eventData && feesData && feesData.length > 0) {
          // Wait for state to be updated and then calculate
          setTimeout(() => {
            calculateExpenses(eventData, membersData, feesData);
          }, 100);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [eventId]);
  
  // Calculate expenses with optional parameters to use directly passed data
  const calculateExpenses = async (eventData = null, membersData = null, feesData = null) => {
    try {
      setCalculationError(null);
      
      // Use passed data or state data
      const currentEvent = eventData || event;
      const currentFees = feesData || fees;
      
      // Check if event exists and has members
      if (!currentEvent) {
        console.error('Cannot calculate expenses: Event is null');
        setCalculationError('Event data not available. Please try again.');
        return;
      }
      
      // Check if there are members in the event
      if (!currentEvent.memberIds || currentEvent.memberIds.length === 0) {
        setCalculationError('Please add members to this event first');
        return;
      }
      
      console.log(`Calculating expenses for event: ${eventId}`);
      const response = await apiService.calculateExpenses(eventId);
      
      // Update the calculateExpenses function to set debug info
      if (response.data && response.data.transactions) {
        setTransactions(response.data.transactions);
        // Set debug info if available in the response
        if (response.data.debug) {
          setDebugInfo(response.data.debug);
        }
        console.log('Calculation successful:', response.data.transactions);
      } else {
        // If server returns empty data, fall back to client-side calculation
        console.warn('Server returned empty calculation data, using client-side calculation');
        const clientCalculation = calculateClientSide(false, currentEvent, membersData, currentFees);
        setTransactions(clientCalculation);
      }
    } catch (err) {
      console.error('Calculation error:', err);
      
      // Handle specific error for no payer
      if (err.message && err.message.includes('No payer specified for fee')) {
        // Extract fee name from error message
        const feeNameMatch = err.message.match(/No payer specified for fee: (.+)/);
        const feeName = feeNameMatch ? feeNameMatch[1] : 'some fees';
        
        setCalculationError(`No payer specified for "${feeName}". Using all members as default payers.`);
        
        // Fall back to client-side calculation with auto-assignment of payers
        const clientCalculation = calculateClientSide(true);
        setTransactions(clientCalculation);
      } else {
        setCalculationError(err.message || 'Failed to calculate expenses');
        
        // Fall back to regular client-side calculation
        console.warn('Falling back to client-side calculation');
        const clientCalculation = calculateClientSide();
        setTransactions(clientCalculation);
      }
    }
  };
  
  // Client-side calculation as fallback
  const calculateClientSide = (autoAssignPayers = false, eventData = null, membersData = null, feesData = null) => {
    console.log('Performing client-side calculation', autoAssignPayers ? 'with auto-assigned payers' : '');
    
    // Use passed data or state data
    const currentEvent = eventData || event;
    const currentMembers = membersData || members;
    const currentFees = feesData || fees;
    
    // Create a map of member balances
    const balances = {};
    if (currentEvent && currentEvent.memberIds) {
      currentEvent.memberIds.forEach(memberId => {
        balances[memberId] = 0;
      });
    }
    
    // If no members, return empty transactions
    if (Object.keys(balances).length === 0) {
      console.warn('No members found for calculation');
      return [];
    }
    
    // Calculate what each person paid and what they owe
    currentFees.forEach(fee => {
      if (!fee || typeof fee.price !== 'number' || fee.price === 0) {
        return; // Skip invalid or zero-price fees
      }
      
      let paidBy = fee.paidBy;
      const sharedBy = fee.memberIds && fee.memberIds.length ? fee.memberIds : event.memberIds;
      
      if (!sharedBy || !sharedBy.length) {
        console.warn(`No members to share fee: ${fee.feeName}`);
        return;
      }
      
      // Auto-assign payer if needed and requested
      if ((!paidBy || !balances[paidBy]) && autoAssignPayers) {
        // Assign to first member in the shared list
        paidBy = sharedBy[0];
        console.log(`Auto-assigned payer for "${fee.feeName}": ${paidBy}`);
      }
      
      // Skip if still no valid payer
      if (!paidBy || !balances[paidBy]) {
        console.warn(`No valid payer for fee: ${fee.feeName}`);
        return;
      }
      
      const amountPerPerson = fee.price / sharedBy.length;
      
      // Add the full amount to the person who paid
      balances[paidBy] += fee.price;
      
      // Subtract the share from each person who owes
      sharedBy.forEach(memberId => {
        if (balances[memberId] !== undefined) {
          balances[memberId] -= amountPerPerson;
        }
      });
    });
    
    // Convert balances to an array of objects
    const balanceArray = Object.entries(balances).map(([memberId, balance]) => {
      const member = members.find(m => m.memberId === memberId);
      if (!member) {
        console.warn(`Member data not found for ID: ${memberId}`);
        return null;
      }
      return {
        memberId,
        memberName: member.memberName,
        balance: parseFloat(balance.toFixed(2)) // Fix floating point precision issues
      };
    }).filter(Boolean);
    
    // Calculate transactions
    return calculateTransactions(balanceArray);
  };
  
  // Calculate transactions from balances
  const calculateTransactions = (balances) => {
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
  };
  
  // Retry loading data
  const handleRetry = () => {
    window.location.reload();
  };
  
  // Retry calculation
  const handleRetryCalculation = () => {
    if (event) {
      calculateExpenses();
    } else {
      setCalculationError('Event data is still loading. Please wait a moment and try again.');
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="calculate-container">
        <h2>Calculating expenses...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="calculate-container error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }
  
  // Render no expenses state
  if (!fees || fees.length === 0) {
    return (
      <div className="calculate-container">
        <h2>No Expenses</h2>
        <p>There are no expenses to calculate. Please add expenses to this event first.</p>
        <button onClick={() => navigate(`/events/${eventId}/fees/new`)}>Add Expense</button>
      </div>
    );
  }
  
  if (!event) {
    return <div className="not-found">Event not found</div>;
  }
  
  // Check if we have any expenses to calculate
  const hasExpenses = fees.length > 0;

  return (
    <div className="calculate-container">
      <div className="calculate-header">
        <h2>Expense Calculation</h2>
        <div className="event-name">for {event.eventName}</div>
      </div>
      
      {calculationError && (
        <div className="calculation-error">
          <p>{calculationError}</p>
          <button onClick={handleRetryCalculation} className="retry-calculation-btn">
            Retry Calculation
          </button>
        </div>
      )}
      
      <div className="calculation-summary">
        <div className="summary-card">
          <div className="summary-item">
            <span className="summary-label">Total Expenses:</span>
            <span className="summary-value">
              ${fees.reduce((total, fee) => total + (fee.price || 0), 0).toFixed(2)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Number of Expenses:</span>
            <span className="summary-value">{fees.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Number of Members:</span>
            <span className="summary-value">
              {event.memberIds ? event.memberIds.length : 0}
            </span>
          </div>
        </div>
      </div>
      
      {!hasExpenses && (
        <div className="no-expenses-message">
          <p>There are no expenses to calculate. Please add expenses to this event first.</p>
          <Link to={`/events/${eventId}/fees/new`} className="add-expense-btn">
            Add an Expense
          </Link>
        </div>
      )}
      
      {hasExpenses && !calculationError && (
        <>
          <div className="expense-breakdown">
            <h3>Expense Breakdown</h3>
            <div className="expense-table">
              <table>
                <thead>
                  <tr>
                    <th>Expense</th>
                    <th>Amount</th>
                    <th>Paid By</th>
                    <th>Shared By</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map(fee => {
                    const paidByMember = members.find(m => m.memberId === fee.paidBy);
                    const sharedBy = fee.memberIds && fee.memberIds.length 
                      ? fee.memberIds.map(id => members.find(m => m.memberId === id)).filter(Boolean)
                      : members.filter(m => event.memberIds && event.memberIds.includes(m.memberId));
                    
                    return (
                      <tr key={fee.feeId}>
                        <td>{fee.feeName}</td>
                        <td className="amount-cell">${(fee.price || 0).toFixed(2)}</td>
                        <td>{paidByMember ? paidByMember.memberName : 'Unknown'}</td>
                        <td>
                          <div className="shared-by-list">
                            {sharedBy.length > 0 ? (
                              sharedBy.map(member => (
                                <span key={member.memberId} className="shared-by-item">
                                  {member.memberName}
                                </span>
                              ))
                            ) : (
                              <span>All members</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="settlement-plan">
            <h3>Settlement Plan</h3>
            {transactions.length > 0 ? (
              <div className="settlement-list">
                {transactions.map((transaction, index) => (
                  <div key={index} className="settlement-item">
                    <div className="settlement-members">
                      <span className="debtor">{transaction.fromName}</span>
                      <span className="settlement-arrow">→</span>
                      <span className="creditor">{transaction.toName}</span>
                    </div>
                    <div className="settlement-amount">${transaction.amount.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-settlements">
                <p>No settlements needed. Everyone is even!</p>
              </div>
            )}
          </div>
        </>
      )}
      
      <div className="calculate-actions">
        <Link to={`/events/${eventId}`} className="back-btn">
          Back to Event
        </Link>
        {hasExpenses && transactions.length > 0 && !calculationError && (
          <button className="share-btn">
            Share Results
          </button>
        )}
      </div>
    </div>
  );
}

export default Calculate;