import axios from 'axios';

// Define the API base URL - can be changed based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} for ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle common errors here
    console.error('API Error:', error);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error message:', error.message);
    }
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Health check
  checkHealth: () => api.get('/api/health'),
  
  // Events
  getEvents: () => api.get('/api/events'),
  getEvent: (eventId) => api.get(`/api/events/${eventId}`),
  createEvent: (eventData) => api.post('/api/events', eventData),
  updateEvent: (eventId, eventData) => api.put(`/api/events/${eventId}`, eventData),
  deleteEvent: (eventId) => api.delete(`/api/events/${eventId}`),
  
  // Members
  getMembers: () => api.get('/api/members'),
  getMember: (memberId) => api.get(`/api/members/${memberId}`),
  createMember: (memberData) => api.post('/api/members', memberData),
  updateMember: (memberId, memberData) => api.put(`/api/members/${memberId}`, memberData),
  deleteMember: (memberId) => api.delete(`/api/members/${memberId}`),
  
  // Fees
  getFees: () => api.get('/api/fees'),
  getEventFees: (eventId) => api.get(`/api/fees/event/${eventId}`),
  getFee: (feeId) => api.get(`/api/fees/${feeId}`),
  createFee: (feeData) => api.post('/api/fees', feeData),
  updateFee: (feeId, feeData) => api.put(`/api/fees/${feeId}`, feeData),
  deleteFee: (feeId) => api.delete(`/api/fees/${feeId}`),
  
  // Calculate expenses
  calculateExpenses: async (eventId) => {
    try {
      console.log(`Requesting calculation for event: ${eventId}`);
      const response = await api.get(`/api/events/${eventId}/calculate`);
      
      // Check if the server returned an error
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }
      
      return response;
    } catch (error) {
      // If it's an axios error with a response from the server
      if (error.response && error.response.data) {
        console.error('Server error response:', error.response.data);
        throw new Error(error.response.data.message || 'Server calculation error');
      }
      
      // If it's a network error or other axios error
      if (error.request) {
        console.error('Network error during calculation:', error);
        throw new Error('Network error: Could not connect to calculation service');
      }
      
      // If it's a client-side error or the error we threw above
      console.error('Calculation error:', error);
      throw error;
    }
  }
};

export default apiService;