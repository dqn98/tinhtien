import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import EventList from './components/EventList/EventList';
import EventDetail from './components/EventDetail/EventDetail';
import EventForm from './components/EventForm/EventForm';
import MemberList from './components/MemberList/MemberList';
import FeeForm from './components/FeeForm/FeeForm';
import './App.css';
import AddExpense from './components/Expense/AddExpense';
import Calculate from './components/Calculate/Calculate';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/new" element={<EventForm />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route path="/events/:eventId/edit" element={<EventForm />} />
            <Route path="/events/:eventId/fees/new" element={<AddExpense />} />
            <Route path="/events/:eventId/calculate" element={<Calculate />} />
            <Route path="/members" element={<MemberList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;