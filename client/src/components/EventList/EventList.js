import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newEvent, setNewEvent] = useState({
    eventName: '',
    eventDescription: '',
    eventStartDate: '',
    eventEndDate: ''
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiService.getEvents();
        setEvents(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.createEvent(newEvent);
      setEvents(prev => [response.data, ...prev]);
      setNewEvent({
        eventName: '',
        eventDescription: '',
        eventStartDate: '',
        eventEndDate: ''
      });
      setShowPopup(false);
    } catch (err) {
      console.error('Error creating event:', err);
      alert('Failed to create event. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <h2>Your Events</h2>
        <button onClick={() => setShowPopup(true)} className="create-event-btn">Create Event</button>
      </div>
      
      {showPopup && (
        <div className="event-popup-overlay">
          <div className="event-popup">
            <h3>Create New Event</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="eventName">Event Name</label>
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  value={newEvent.eventName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="eventDescription">Description</label>
                <textarea
                  id="eventDescription"
                  name="eventDescription"
                  value={newEvent.eventDescription}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="eventStartDate">Start Date</label>
                <input
                  type="date"
                  id="eventStartDate"
                  name="eventStartDate"
                  value={newEvent.eventStartDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="eventEndDate">End Date</label>
                <input
                  type="date"
                  id="eventEndDate"
                  name="eventEndDate"
                  value={newEvent.eventEndDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="popup-actions">
                <button type="button" onClick={() => setShowPopup(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {events.length === 0 ? (
        <div className="no-events">
          <p>You don't have any events yet. Create your first event to get started!</p>
        </div>
      ) : (
        <div className="event-list">
          {events.map(event => (
            <div key={event.eventId} className="event-card">
              <h3>{event.eventName}</h3>
              <p>{event.eventDescription}</p>
              {event.eventStartDate && (
                <p className="event-date">
                  {new Date(event.eventStartDate).toLocaleDateString()}
                  {event.eventEndDate && ` - ${new Date(event.eventEndDate).toLocaleDateString()}`}
                </p>
              )}
              <div className="event-actions">
                <Link to={`/events/${event.eventId}`} className="view-btn">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;