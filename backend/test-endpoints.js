// Test script to verify endpoints are working
// Run with: node test-endpoints.js

const testEndpoint = async (url) => {
  try {
    const response = await fetch(url);
    console.log(`\n${url}`);
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text.substring(0, 200)}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
};

(async () => {
  console.log("Testing backend endpoints...\n");
  
  // Test if server is running
  await testEndpoint("http://localhost:5000/api/test");
  
  // Test protected endpoints (should return 401 Unauthorized)
  await testEndpoint("http://localhost:5000/api/services/my-services");
  await testEndpoint("http://localhost:5000/api/vehicles/my-vehicles");
})();
