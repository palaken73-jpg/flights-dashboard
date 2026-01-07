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
    // If no API key or we want to use mock for development
    if (!AVIATIONSTACK_API_KEY || AVIATIONSTACK_API_KEY === 'f8259de386dd26e25e0c595ef4ecbb82') {
      console.log('Using mock flight data');
      return MOCK_FLIGHTS;
    }

    const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
      params: {
        access_key: AVIATIONSTACK_API_KEY,
        dep_iata: params.origin,
        arr_iata: params.destination,
        flight_date: params.date,
        limit: 10
      }
    });

    // Transform API response to our format
    return response.data.data.map((flight: any) => ({
      id: flight.flight.iata,
      flight_number: flight.flight.number,
      airline: flight.airline.name,
      departure: {
        airport: flight.departure.airport,
        scheduled: flight.departure.scheduled
      },
      arrival: {
        airport: flight.arrival.airport,
        scheduled: flight.arrival.scheduled
      },
      price: Math.floor(Math.random() * 500) + 150, // Mock price since API doesn't provide
      currency: 'USD',
      date: flight.flight_date
    }));
  } catch (error) {
    console.error('Error fetching flights:', error);
    return MOCK_FLIGHTS; // Fallback to mock data
  }
};

// Simulate price history for charts
export const generatePriceHistory = (flightId: string, days: number = 30) => {
  const basePrice = Math.floor(Math.random() * 300) + 200;
  const history = [];
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
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