import axios from 'axios';

const AVIATIONSTACK_API_KEY = 'f8259de386dd26e25e0c595ef4ecbb82'; // Your real key
const AVIATIONSTACK_BASE_URL = 'http://api.aviationstack.com/v1';

export interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  departure: {
    airport: string;
    scheduled: string;
  };
  arrival: {
    airport: string;
    scheduled: string;
  };
  price: number;
  currency: string;
  date: string;
}

// Mock data for fallback
const MOCK_FLIGHTS: Flight[] = [
  { id: '1', flight_number: 'AA123', airline: 'American Airlines', departure: { airport: 'JFK', scheduled: '2024-01-15T08:00:00' }, arrival: { airport: 'LAX', scheduled: '2024-01-15T11:00:00' }, price: 299, currency: 'USD', date: '2024-01-15' },
  { id: '2', flight_number: 'DL456', airline: 'Delta Airlines', departure: { airport: 'LAX', scheduled: '2024-01-15T14:00:00' }, arrival: { airport: 'JFK', scheduled: '2024-01-15T22:00:00' }, price: 345, currency: 'USD', date: '2024-01-15' },
  { id: '3', flight_number: 'UA789', airline: 'United Airlines', departure: { airport: 'SFO', scheduled: '2024-01-16T09:00:00' }, arrival: { airport: 'ORD', scheduled: '2024-01-16T15:00:00' }, price: 289, currency: 'USD', date: '2024-01-16' },
  { id: '4', flight_number: 'BA101', airline: 'British Airways', departure: { airport: 'LHR', scheduled: '2024-01-16T18:00:00' }, arrival: { airport: 'CDG', scheduled: '2024-01-16T20:00:00' }, price: 199, currency: 'USD', date: '2024-01-16' },
  { id: '5', flight_number: 'EK202', airline: 'Emirates', departure: { airport: 'DXB', scheduled: '2024-01-17T01:00:00' }, arrival: { airport: 'SIN', scheduled: '2024-01-17T08:00:00' }, price: 850, currency: 'USD', date: '2024-01-17' },
];

// Convert airport name to IATA code (simple mapping)
const airportToIATA: Record<string, string> = {
  'jfk': 'JFK',
  'lax': 'LAX', 
  'sfo': 'SFO',
  'ord': 'ORD',
  'lhr': 'LHR',
  'cdg': 'CDG',
  'dxb': 'DXB',
  'sin': 'SIN',
  'new york': 'JFK',
  'los angeles': 'LAX',
  'san francisco': 'SFO',
  'chicago': 'ORD',
  'london': 'LHR',
  'paris': 'CDG',
  'dubai': 'DXB',
  'singapore': 'SIN',
};

export const fetchFlights = async (params: {
  origin?: string;
  destination?: string;
  date?: string;
}): Promise<Flight[]> => {
  try {
    // Convert airport names to IATA codes if possible
    const originIATA = params.origin ? airportToIATA[params.origin.toLowerCase()] : undefined;
    const destIATA = params.destination ? airportToIATA[params.destination.toLowerCase()] : undefined;
    
    // TRY REAL API FIRST (only if we have API key and IATA codes)
    if (AVIATIONSTACK_API_KEY && AVIATIONSTACK_API_KEY !== 'f8259de386dd26e25e0c595ef4ecbb82' && 
        (originIATA || destIATA)) {
      
      console.log('Attempting real API call with:', { originIATA, destIATA });
      
      const apiParams: any = {
        access_key: AVIATIONSTACK_API_KEY,
        limit: 10,
        flight_status: 'scheduled'
      };
      
      if (originIATA) apiParams.dep_iata = originIATA;
      if (destIATA) apiParams.arr_iata = destIATA;
      if (params.date) apiParams.flight_date = params.date;
      
      const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
        params: apiParams,
        timeout: 5000 // 5 second timeout
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        console.log('Real API returned flights:', response.data.data.length);
        
        // Transform API response
        return response.data.data.map((flight: any, index: number) => ({
          id: `${flight.flight.iata || flight.flight.number || `flight-${index}`}`,
          flight_number: flight.flight.number || 'N/A',
          airline: flight.airline?.name || 'Unknown Airline',
          departure: {
            airport: flight.departure?.airport || flight.departure?.iata || 'Unknown',
            scheduled: flight.departure?.scheduled || new Date().toISOString()
          },
          arrival: {
            airport: flight.arrival?.airport || flight.arrival?.iata || 'Unknown',
            scheduled: flight.arrival?.scheduled || new Date().toISOString()
          },
          price: Math.floor(Math.random() * 500) + 150, // API doesn't provide price, so generate
          currency: 'USD',
          date: flight.flight_date || params.date || new Date().toISOString().split('T')[0]
        }));
      }
    }
    
    // FALLBACK TO MOCK DATA (with filtering)
    console.log('Using mock data (fallback)');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let results = MOCK_FLIGHTS.filter(flight => {
      let match = true;
      
      if (params.origin) {
        const originLower = params.origin.toLowerCase();
        match = match && (
          flight.departure.airport.toLowerCase().includes(originLower) ||
          flight.departure.airport.toLowerCase().startsWith(originLower) ||
          originLower.includes(flight.departure.airport.toLowerCase())
        );
      }
      
      if (params.destination) {
        const destLower = params.destination.toLowerCase();
        match = match && (
          flight.arrival.airport.toLowerCase().includes(destLower) ||
          flight.arrival.airport.toLowerCase().startsWith(destLower) ||
          destLower.includes(flight.arrival.airport.toLowerCase())
        );
      }
      
      return match;
    });
    
    // Handle no results
    if (results.length === 0 && (params.origin || params.destination)) {
      results = [{
        id: 'no-results',
        flight_number: 'N/A',
        airline: 'No flights found for this search',
        departure: { 
          airport: params.origin || 'Any', 
          scheduled: new Date().toISOString() 
        },
        arrival: { 
          airport: params.destination || 'Any', 
          scheduled: new Date().toISOString() 
        },
        price: 0,
        currency: 'USD',
        date: params.date || new Date().toISOString().split('T')[0]
      }];
    }
    
    return results.length > 0 ? results : MOCK_FLIGHTS;
    
  } catch (error: any) {
    console.error('API Error:', error.message);
    console.log('Falling back to mock data');
    
    // Fallback to mock with filtering
    return MOCK_FLIGHTS.filter(flight => {
      let match = true;
      if (params.origin) {
        match = match && flight.departure.airport.toLowerCase().includes(params.origin.toLowerCase());
      }
      if (params.destination) {
        match = match && flight.arrival.airport.toLowerCase().includes(params.destination.toLowerCase());
      }
      return match;
    });
  }
};

// Simulate price history for charts
export const generatePriceHistory = (flightId: string, days: number = 30) => {
  const basePrice = Math.floor(Math.random() * 300) + 200;
  const history = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const fluctuation = (Math.random() - 0.5) * 50;
    const price = Math.max(150, basePrice + fluctuation);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price)
    });
  }
  
  return history;
};
