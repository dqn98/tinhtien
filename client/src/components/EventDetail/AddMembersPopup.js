import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import './AddMembersPopup.css';

const AddMembersPopup = ({ eventId, currentMembers, onClose, onMembersAdded }) => {
  const [allMembers, setAllMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMembers();
        setAllMembers(response.data);
        
        // Pre-select current members
        if (currentMembers && currentMembers.length > 0) {
          setSelectedMembers(currentMembers);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentMembers]);

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSaveMembers = async () => {
    try {
      // Get the current event
      const eventResponse = await apiService.getEvent(eventId);
      const event = eventResponse.data;
      
      // Update the event with the selected members
      const updatedEvent = {
        ...event,
        memberIds: selectedMembers
      };
      
      await apiService.updateEvent(eventId, updatedEvent);
      
      // Notify parent component
      onMembersAdded(selectedMembers);
      onClose();
    } catch (err) {
      console.error('Error updating event members:', err);
      alert('Failed to update members. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="add-members-popup">
        <div className="popup-content">
          <h3>Add Members</h3>
          <div className="loading">Loading members...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="add-members-popup">
        <div className="popup-content">
          <h3>Add Members</h3>
          <div className="error-message">{error}</div>
          <div className="popup-actions">
            <button onClick={onClose} className="cancel-btn">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-members-popup-overlay" onClick={onClose}>
      <div className="add-members-popup" onClick={e => e.stopPropagation()}>
        <h3>Add Members to Event</h3>
        
        {allMembers.length === 0 ? (
          <div className="no-members-message">
            <p>No members available. Please add members first.</p>
          </div>
        ) : (
          <div className="members-selection">
            {allMembers.map(member => (
              <div 
                key={member.memberId} 
                className={`member-selection-item ${selectedMembers.includes(member.memberId) ? 'selected' : ''}`}
                onClick={() => toggleMemberSelection(member.memberId)}
              >
                <div className="member-info">
                  <span className="member-name">{member.memberName}</span>
                  {member.memberEmail && <span className="member-email">{member.memberEmail}</span>}
                </div>
                <div className="member-checkbox">
                  {selectedMembers.includes(member.memberId) && <span className="checkmark">✓</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="popup-actions">
          <button onClick={onClose} className="cancel-btn">Cancel</button>
          <button 
            onClick={handleSaveMembers} 
            className="save-btn"
            disabled={allMembers.length === 0}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembersPopup;