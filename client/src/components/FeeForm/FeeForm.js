import React from 'react';
import { useParams } from 'react-router-dom';
import './FeeForm.css';

const FeeForm = () => {
  const { eventId } = useParams();
  
  return (
    <div className="fee-form-container">
      <h2>Add New Expense</h2>
      <p>This component will contain a form to add a new expense to event with ID: {eventId}</p>
    </div>
  );
};

export default FeeForm;