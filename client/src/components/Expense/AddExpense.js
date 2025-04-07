import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiService from '../../services/api';
import './AddExpense.css';

const AddExpense = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState({
    feeName: '',
    price: '',
    description: '',
    paidBy: '',
    memberIds: [],
    eventId: eventId
  });
  const [members, setMembers] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventResponse = await apiService.getEvent(eventId);
        setEvent(eventResponse.data);
        
        // Fetch members
        const membersResponse = await apiService.getMembers();
        const eventMembers = membersResponse.data.filter(
          member => eventResponse.data.memberIds && 
          eventResponse.data.memberIds.includes(member.memberId)
        );
        setMembers(eventMembers);
        
        // By default, select all members
        setExpense(prev => ({
          ...prev,
          memberIds: eventMembers.map(member => member.memberId)
        }));
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Only allow numbers and decimal point
      const regex = /^[0-9]*\.?[0-9]*$/;
      if (value === '' || regex.test(value)) {
        setExpense(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setExpense(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleMemberSelection = (memberId) => {
    setExpense(prev => {
      const memberIds = [...prev.memberIds];
      
      if (memberIds.includes(memberId)) {
        return { ...prev, memberIds: memberIds.filter(id => id !== memberId) };
      } else {
        return { ...prev, memberIds: [...memberIds, memberId] };
      }
    });
  };

  const selectAllMembers = () => {
    setExpense(prev => ({
      ...prev,
      memberIds: members.map(member => member.memberId)
    }));
  };

  const deselectAllMembers = () => {
    setExpense(prev => ({
      ...prev,
      memberIds: []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!expense.feeName.trim()) {
      alert('Please enter an expense name');
      return;
    }
    
    if (!expense.price || parseFloat(expense.price) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (!expense.paidBy) {
      alert('Please select who paid for this expense');
      return;
    }
    
    if (expense.memberIds.length === 0) {
      alert('Please select at least one member to share this expense');
      return;
    }
    
    try {
      // Format the expense data for API
      const expenseData = {
        ...expense,
        price: parseFloat(expense.price),
        eventId: eventId
      };
      
      await apiService.createFee(expenseData);
      navigate(`/events/${eventId}`);
    } catch (err) {
      console.error('Error creating expense:', err);
      alert('Failed to create expense. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!event) {
    return <div className="not-found">Event not found</div>;
  }

  return (
    <div className="add-expense-container">
      <div className="add-expense-header">
        <h2>Add New Expense</h2>
        <div className="event-name">for {event.eventName}</div>
      </div>
      
      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label htmlFor="feeName">Expense Name*</label>
          <input
            type="text"
            id="feeName"
            name="feeName"
            value={expense.feeName}
            onChange={handleInputChange}
            placeholder="e.g., Dinner, Tickets, Hotel"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Amount*</label>
          <div className="price-input">
            <span className="currency-symbol">$</span>
            <input
              type="text"
              id="price"
              name="price"
              value={expense.price}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={expense.description}
            onChange={handleInputChange}
            placeholder="Add details about this expense"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="paidBy">Paid By*</label>
          <select
            id="paidBy"
            name="paidBy"
            value={expense.paidBy}
            onChange={handleInputChange}
            required
          >
            <option value="">Select who paid</option>
            {members.map(member => (
              <option key={member.memberId} value={member.memberId}>
                {member.memberName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Split Between*</label>
          <div className="member-selection-actions">
            <button type="button" onClick={selectAllMembers} className="select-all-btn">
              Select All
            </button>
            <button type="button" onClick={deselectAllMembers} className="deselect-all-btn">
              Deselect All
            </button>
          </div>
          
          <div className="members-selection">
            {members.length === 0 ? (
              <div className="no-members-message">
                No members in this event. Please add members first.
              </div>
            ) : (
              members.map(member => (
                <div 
                  key={member.memberId} 
                  className={`member-selection-item ${expense.memberIds.includes(member.memberId) ? 'selected' : ''}`}
                  onClick={() => toggleMemberSelection(member.memberId)}
                >
                  <div className="member-info">
                    <span className="member-name">{member.memberName}</span>
                  </div>
                  <div className="member-checkbox">
                    {expense.memberIds.includes(member.memberId) && <span className="checkmark">✓</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="form-actions">
          <Link to={`/events/${eventId}`} className="cancel-btn">Cancel</Link>
          <button type="submit" className="save-btn">Save Expense</button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;