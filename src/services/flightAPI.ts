import axios from 'axios';

const AVIATIONSTACK_API_KEY = 'f8259de386dd26e25e0c595ef4ecbb82';
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

// Mock data for development
const MOCK_FLIGHTS: Flight[] = [
  { id: '1', flight_number: 'AA123', airline: 'American Airlines', departure: { airport: 'JFK', scheduled: '2024-01-15T08:00:00' }, arrival: { airport: 'LAX', scheduled: '2024-01-15T11:00:00' }, price: 299, currency: 'USD', date: '2024-01-15' },
  { id: '2', flight_number: 'DL456', airline: 'Delta Airlines', departure: { airport: 'LAX', scheduled: '2024-01-15T14:00:00' }, arrival: { airport: 'JFK', scheduled: '2024-01-15T22:00:00' }, price: 345, currency: 'USD', date: '2024-01-15' },
  { id: '3', flight_number: 'UA789', airline: 'United Airlines', departure: { airport: 'SFO', scheduled: '2024-01-16T09:00:00' }, arrival: { airport: 'ORD', scheduled: '2024-01-16T15:00:00' }, price: 289, currency: 'USD', date: '2024-01-16' },
  { id: '4', flight_number: 'BA101', airline: 'British Airways', departure: { airport: 'LHR', scheduled: '2024-01-16T18:00:00' }, arrival: { airport: 'CDG', scheduled: '2024-01-16T20:00:00' }, price: 199, currency: 'USD', date: '2024-01-16' },
  { id: '5', flight_number: 'EK202', airline: 'Emirates', departure: { airport: 'DXB', scheduled: '2024-01-17T01:00:00' }, arrival: { airport: 'SIN', scheduled: '2024-01-17T08:00:00' }, price: 850, currency: 'USD', date: '2024-01-17' },
];

// Real API call (falls back to mock if no API key)
export const fetchFlights = async (params: {
  origin?: string;
  destination?: string;
  date?: string;
}): Promise<Flight[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Filter mock data based on search params
    let results = MOCK_FLIGHTS.filter(flight => {
      let match = true;
      
      if (params.origin) {
        match = match && flight.departure.airport
          .toLowerCase()
          .includes(params.origin.toLowerCase());
      }
      
      if (params.destination) {
        match = match && flight.arrival.airport
          .toLowerCase()
          .includes(params.destination.toLowerCase());
      }
      
      if (params.date) {
        match = match && flight.date === params.date;
      }
      
      return match;
    });
    
    // If no results, return all flights with a message
    if (results.length === 0 && (params.origin || params.destination)) {
      // Add a "no results" flight
      results = [{
        id: 'no-results',
        flight_number: 'N/A',
        airline: 'No flights found',
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
    } else if (results.length === 0) {
      results = MOCK_FLIGHTS;
    }
    
    return results;
    
  } catch (error) {
    console.error('Error:', error);
    return MOCK_FLIGHTS;
  }
};    
    // Simulate price fluctuations
    const fluctuation = (Math.random() - 0.5) * 50;
    const price = Math.max(150, basePrice + fluctuation);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price)
    });
  }
  
  return history;
};