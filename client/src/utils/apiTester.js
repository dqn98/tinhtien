import apiService from '../services/api';

// Function to test all API endpoints
export async function testAllEndpoints() {
  console.log('Starting API endpoint tests...');
  const results = {
    success: [],
    failure: []
  };

  // Test health endpoint
  try {
    console.log('Testing health endpoint...');
    await apiService.checkHealth();
    results.success.push('Health Check');
  } catch (error) {
    results.failure.push({ name: 'Health Check', error });
  }

  // Test events endpoints
  try {
    console.log('Testing get events endpoint...');
    await apiService.getEvents();
    results.success.push('Get Events');
  } catch (error) {
    results.failure.push({ name: 'Get Events', error });
  }

  // Test members endpoints
  try {
    console.log('Testing get members endpoint...');
    await apiService.getMembers();
    results.success.push('Get Members');
  } catch (error) {
    results.failure.push({ name: 'Get Members', error });
  }

  // Test fees endpoints
  try {
    console.log('Testing get fees endpoint...');
    await apiService.getFees();
    results.success.push('Get Fees');
  } catch (error) {
    results.failure.push({ name: 'Get Fees', error });
  }

  // Log results
  console.log('API Tests Complete');
  console.log('Successful endpoints:', results.success.join(', '));
  
  if (results.failure.length > 0) {
    console.error('Failed endpoints:');
    results.failure.forEach(failure => {
      console.error(`- ${failure.name}: ${failure.error.message}`);
    });
  }

  return results;
}

// You can call this function from your app's initialization or a debug component