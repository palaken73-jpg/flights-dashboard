// SIMPLE FALLBACK - No merge conflicts
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

const MOCK_FLIGHTS: Flight[] = [
  { id: '1', flight_number: 'AA123', airline: 'American Airlines', departure: { airport: 'JFK', scheduled: '2024-01-15T08:00:00' }, arrival: { airport: 'LAX', scheduled: '2024-01-15T11:00:00' }, price: 299, currency: 'USD', date: '2024-01-15' },
  { id: '2', flight_number: 'DL456', airline: 'Delta Airlines', departure: { airport: 'LAX', scheduled: '2024-01-15T14:00:00' }, arrival: { airport: 'JFK', scheduled: '2024-01-15T22:00:00' }, price: 345, currency: 'USD', date: '2024-01-15' },
  { id: '3', flight_number: 'UA789', airline: 'United Airlines', departure: { airport: 'SFO', scheduled: '2024-01-16T09:00:00' }, arrival: { airport: 'ORD', scheduled: '2024-01-16T15:00:00' }, price: 289, currency: 'USD', date: '2024-01-16' },
  { id: '4', flight_number: 'BA101', airline: 'British Airways', departure: { airport: 'LHR', scheduled: '2024-01-16T18:00:00' }, arrival: { airport: 'CDG', scheduled: '2024-01-16T20:00:00' }, price: 199, currency: 'USD', date: '2024-01-16' },
  { id: '5', flight_number: 'EK202', airline: 'Emirates', departure: { airport: 'DXB', scheduled: '2024-01-17T01:00:00' }, arrival: { airport: 'SIN', scheduled: '2024-01-17T08:00:00' }, price: 850, currency: 'USD', date: '2024-01-17' },
];

export const fetchFlights = async (params: {
  origin?: string;
  destination?: string;
  date?: string;
}): Promise<Flight[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let results = MOCK_FLIGHTS.filter(flight => {
    let match = true;
    
    if (params.origin) {
      match = match && flight.departure.airport.toLowerCase().includes(params.origin.toLowerCase());
    }
    
    if (params.destination) {
      match = match && flight.arrival.airport.toLowerCase().includes(params.destination.toLowerCase());
    }
    
    return match;
  });
  
  return results.length > 0 ? results : MOCK_FLIGHTS;
};

export const generatePriceHistory = () => {
  return [
    { day: 'Mon', price: 320 },
    { day: 'Tue', price: 310 },
    { day: 'Wed', price: 295 },
    { day: 'Thu', price: 285 },
    { day: 'Fri', price: 290 },
    { day: 'Sat', price: 315 },
    { day: 'Sun', price: 330 },
  ];
};

export {};