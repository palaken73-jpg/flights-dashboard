// public/amadeus.js
window.AmadeusAPI = {
  async getFlights(origin, destination) {
    const key = 'ELgladm0pbqUzY8ke0TdkS9SHM0kXEDJ';
    const secret = 'h1kjA9WxcehHGh54';
    // Use a future date (at least tomorrow)
    const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
// Use formattedDate in your request
    
    if(key.includes('YOUR_')) {
      return { demo: true, flights: [] };
    }
const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=JFK&destinationLocationCode=LAX&departureDate=2025-01-20&adults=1&max=5`;

// Add Authorization header (if making direct fetch)
const options = {
  headers: {
    'Authorization': `Bearer YOUR_ACCESS_TOKEN`,
    'Content-Type': 'application/json'
  }
};
    try {
      const tokenRes = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${key}&client_secret=${secret}`
      });
      const tokenData = await tokenRes.json();
      
      const flightRes = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=2024-01-20`,
        {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        }
      );
      
      return await flightRes.json();
    } catch(e) {
      return { error: e.message, demo: true };
    }
  }
};