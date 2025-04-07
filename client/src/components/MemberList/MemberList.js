import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import './MemberList.css';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [newMember, setNewMember] = useState({ memberName: '', memberEmail: '' });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMembers();
      setMembers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditForm) {
      setCurrentMember(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewMember(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.createMember(newMember);
      setMembers(prev => [...prev, response.data]);
      setNewMember({ memberName: '', memberEmail: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding member:', err);
      alert('Failed to add member. Please try again.');
    }
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.updateMember(currentMember.memberId, currentMember);
      setMembers(prev => 
        prev.map(member => 
          member.memberId === currentMember.memberId ? response.data : member
        )
      );
      setCurrentMember(null);
      setShowEditForm(false);
    } catch (err) {
      console.error('Error updating member:', err);
      alert('Failed to update member. Please try again.');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await apiService.deleteMember(memberId);
        setMembers(prev => prev.filter(member => member.memberId !== memberId));
      } catch (err) {
        console.error('Error deleting member:', err);
        alert('Failed to delete member. Please try again.');
      }
    }
  };

  const openEditForm = (member) => {
    setCurrentMember(member);
    setShowEditForm(true);
  };

  if (loading) {
    return <div className="loading">Loading members...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="member-list-container">
      <div className="member-list-header">
        <h2>Members</h2>
        <button 
          className="add-member-btn" 
          onClick={() => setShowAddForm(true)}
        >
          Add Member
        </button>
      </div>

      {showAddForm && (
        <div className="member-form-overlay" onClick={() => setShowAddForm(false)}>
          <div className="member-form" onClick={e => e.stopPropagation()}>
            <h3>Add New Member</h3>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label htmlFor="memberName">Name*</label>
                <input
                  type="text"
                  id="memberName"
                  name="memberName"
                  value={newMember.memberName}
                  onChange={handleInputChange}
                  placeholder="Enter member name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="memberEmail">Email</label>
                <input
                  type="email"
                  id="memberEmail"
                  name="memberEmail"
                  value={newMember.memberEmail}
                  onChange={handleInputChange}
                  placeholder="Enter member email"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && currentMember && (
        <div className="member-form-overlay" onClick={() => setShowEditForm(false)}>
          <div className="member-form" onClick={e => e.stopPropagation()}>
            <h3>Edit Member</h3>
            <form onSubmit={handleEditMember}>
              <div className="form-group">
                <label htmlFor="editMemberName">Name*</label>
                <input
                  type="text"
                  id="editMemberName"
                  name="memberName"
                  value={currentMember.memberName}
                  onChange={handleInputChange}
                  placeholder="Enter member name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="editMemberEmail">Email</label>
                <input
                  type="email"
                  id="editMemberEmail"
                  name="memberEmail"
                  value={currentMember.memberEmail || ''}
                  onChange={handleInputChange}
                  placeholder="Enter member email"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowEditForm(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Update Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="no-members">
          <p>No members found. Add your first member to get started!</p>
        </div>
      ) : (
        <div className="members-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.memberId}>
                  <td>{member.memberName}</td>
                  <td>{member.memberEmail || '-'}</td>
                  <td className="member-actions">
                    <button 
                      className="edit-btn" 
                      onClick={() => openEditForm(member)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteMember(member.memberId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MemberList;