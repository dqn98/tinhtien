import React from 'react';
import { useParams } from 'react-router-dom';
import './EventForm.css';

const EventForm = () => {
  const { eventId } = useParams();
  const isEditing = Boolean(eventId);
  
  return (
    <div className="event-form-container">
      <h2>{isEditing ? 'Edit Event' : 'Create New Event'}</h2>
      <p>This component will contain a form to {isEditing ? 'edit' : 'create'} an event.</p>
    </div>
  );
};

export default EventForm;