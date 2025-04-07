const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

const endpoints = [
  { method: 'GET', url: '/api/health', name: 'Health Check' },
  { method: 'GET', url: '/api/events', name: 'Get All Events' },
  { method: 'GET', url: '/api/members', name: 'Get All Members' },
  { method: 'GET', url: '/api/fees', name: 'Get All Fees' }
];

async function validateEndpoints() {
  console.log('Starting API endpoint validation...');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}: ${endpoint.method} ${endpoint.url}`);
      
      const response = await axios({
        method: endpoint.method.toLowerCase(),
        url: `${API_BASE_URL}${endpoint.url}`,
        timeout: 5000
      });
      
      console.log(`✅ ${endpoint.name}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error(`❌ ${endpoint.name} failed:`);
      
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('   No response received from server');
      } else {
        console.error(`   Error: ${error.message}`);
      }
    }
  }
  
  console.log('Endpoint validation complete');
}

validateEndpoints();