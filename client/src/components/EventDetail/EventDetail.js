import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../../services/api';
import AddMembersPopup from './AddMembersPopup';
import './EventDetail.css';

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [fees, setFees] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMembersPopup, setShowAddMembersPopup] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        // Fetch event details
        const eventResponse = await apiService.getEvent(eventId);
        setEvent(eventResponse.data);
        
        // Fetch fees associated with this event
        const feesResponse = await apiService.getFees();
        const eventFees = feesResponse.data.filter(fee => fee.eventId === eventId);
        setFees(eventFees);
        
        // Fetch members
        const membersResponse = await apiService.getMembers();
        setMembers(membersResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleMembersAdded = async (memberIds) => {
    try {
      // Refresh event data
      const eventResponse = await apiService.getEvent(eventId);
      setEvent(eventResponse.data);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading event details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!event) {
    return <div className="not-found">Event not found</div>;
  }

  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <h2>{event.eventName}</h2>
        <div className="event-actions">
          <Link to={`/events/${eventId}/edit`} className="edit-btn">Edit Event</Link>
          <Link to={`/events/${eventId}/fees/new`} className="add-fee-btn">Add Fee</Link>
        </div>
      </div>
      
      <div className="event-info-card">
        <div className="event-description">
          <h3>Description</h3>
          <p>{event.eventDescription || 'No description provided'}</p>
        </div>
        
        <div className="event-dates">
          <div className="date-item">
            <span className="date-label">Start Date:</span>
            <span className="date-value">{formatDate(event.eventStartDate) || 'Not specified'}</span>
          </div>
          <div className="date-item">
            <span className="date-label">End Date:</span>
            <span className="date-value">{formatDate(event.eventEndDate) || 'Not specified'}</span>
          </div>
        </div>
      </div>
      
      <div className="event-members">
        <h3>Members</h3>
        {event.memberIds && event.memberIds.length > 0 ? (
          <div className="member-list">
            {event.memberIds.map(memberId => {
              const member = members.find(m => m.memberId === memberId);
              return (
                <div key={memberId} className="member-item">
                  {member ? member.memberName : 'Unknown Member'}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data">No members added to this event</p>
        )}
        <button 
          className="add-member-btn"
          onClick={() => setShowAddMembersPopup(true)}
        >
          Add Members
        </button>
      </div>
      
      <div className="event-fees">
        <h3>Fees</h3>
        {fees.length > 0 ? (
          <div className="fee-list">
            {fees.map(fee => (
              <div key={fee.feeId} className="fee-card">
                <div className="fee-header">
                  <h4>{fee.feeName}</h4>
                  <span className="fee-amount">${fee.price.toFixed(2)}</span>
                </div>
                <div className="fee-members">
                  <span className="fee-members-label">Shared by:</span>
                  <div className="fee-members-list">
                    {fee.memberIds && fee.memberIds.length > 0 ? 
                      fee.memberIds.map(memberId => {
                        const member = members.find(m => m.memberId === memberId);
                        return (
                          <span key={memberId} className="fee-member-item">
                            {member ? member.memberName : 'Unknown Member'}
                          </span>
                        );
                      }) : 
                      <span>All members</span>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No fees added to this event</p>
        )}
      </div>
      
      <div className="event-summary">
        <h3>Expense Summary</h3>
        <div className="summary-card">
          <div className="summary-total">
            <span className="summary-label">Total Expenses:</span>
            <span className="summary-value">
              ${fees.reduce((total, fee) => total + fee.price, 0).toFixed(2)}
            </span>
          </div>
          <Link to={`/events/${eventId}/calculate`} className="calculate-btn">
            Calculate Split
          </Link>
        </div>
      </div>
      
      <div className="back-link">
        <Link to="/">← Back to Events</Link>
      </div>

      {showAddMembersPopup && (
        <AddMembersPopup
          eventId={eventId}
          currentMembers={event.memberIds || []}
          onClose={() => setShowAddMembersPopup(false)}
          onMembersAdded={handleMembersAdded}
        />
      )}
    </div>
  );
};

export default EventDetail;