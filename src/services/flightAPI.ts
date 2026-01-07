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
    iata?: string;
  };
  arrival: {
    airport: string;
    scheduled: string;
    iata?: string;
  };
  price: number;
  currency: string;
  date: string;
  live_status?: string;
  data_source: 'api' | 'mock' | 'synthetic';
  flight_status?: string;
  last_updated?: string;
}

// Mock data for fallback
const MOCK_FLIGHTS: Flight[] = [
  { 
    id: '1', 
    flight_number: 'AA123', 
    airline: 'American Airlines', 
    departure: { airport: 'JFK', scheduled: '2024-01-15T08:00:00' }, 
    arrival: { airport: 'LAX', scheduled: '2024-01-15T11:00:00' }, 
    price: 299, 
    currency: 'USD', 
    date: '2024-01-15',
    live_status: '🟡 Demo',
    data_source: 'mock',
    flight_status: 'scheduled',
    last_updated: 'Static'
  },
  { 
    id: '2', 
    flight_number: 'DL456', 
    airline: 'Delta Airlines', 
    departure: { airport: 'LAX', scheduled: '2024-01-15T14:00:00' }, 
    arrival: { airport: 'JFK', scheduled: '2024-01-15T22:00:00' }, 
    price: 345, 
    currency: 'USD', 
    date: '2024-01-15',
    live_status: '🟡 Demo',
    data_source: 'mock',
    flight_status: 'scheduled',
    last_updated: 'Static'
  },
  { 
    id: '3', 
    flight_number: 'UA789', 
    airline: 'United Airlines', 
    departure: { airport: 'SFO', scheduled: '2024-01-16T09:00:00' }, 
    arrival: { airport: 'ORD', scheduled: '2024-01-16T15:00:00' }, 
    price: 289, 
    currency: 'USD', 
    date: '2024-01-16',
    live_status: '🟡 Demo',
    data_source: 'mock',
    flight_status: 'scheduled',
    last_updated: 'Static'
  },
  { 
    id: '4', 
    flight_number: 'BA101', 
    airline: 'British Airways', 
    departure: { airport: 'LHR', scheduled: '2024-01-16T18:00:00' }, 
    arrival: { airport: 'CDG', scheduled: '2024-01-16T20:00:00' }, 
    price: 199, 
    currency: 'USD', 
    date: '2024-01-16',
    live_status: '🟡 Demo',
    data_source: 'mock',
    flight_status: 'scheduled',
    last_updated: 'Static'
  },
  { 
    id: '5', 
    flight_number: 'EK202', 
    airline: 'Emirates', 
    departure: { airport: 'DXB', scheduled: '2024-01-17T01:00:00' }, 
    arrival: { airport: 'SIN', scheduled: '2024-01-17T08:00:00' }, 
    price: 850, 
    currency: 'USD', 
    date: '2024-01-17',
    live_status: '🟡 Demo',
    data_source: 'mock',
    flight_status: 'scheduled',
    last_updated: 'Static'
  },
];

// Airport name to IATA code mapping
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
  'atl': 'ATL',
  'dfw': 'DFW',
  'den': 'DEN',
  'mia': 'MIA',
};

// Get realistic base price for route
const getBasePriceForRoute = (origin: string, destination: string): number => {
  const routeKey = `${origin}-${destination}`.toUpperCase();
  
  const routePrices: Record<string, number> = {
    'JFK-LAX': 299,
    'LAX-JFK': 345,
    'SFO-ORD': 289,
    'ORD-SFO': 310,
    'LHR-CDG': 199,
    'CDG-LHR': 210,
    'DXB-SIN': 850,
    'SIN-DXB': 820,
    'JFK-LHR': 650,
    'LHR-JFK': 680,
    'LAX-SFO': 129,
    'SFO-LAX': 135,
    'ATL-LAX': 279,
    'DFW-DEN': 189,
    'MIA-JFK': 229,
  };
  
  return routePrices[routeKey] || Math.floor(Math.random() * 400) + 150;
};

// Create synthetic flights for searched routes
const createSyntheticFlights = (
  originName: string,
  destName: string,
  originIATA?: string,
  destIATA?: string
): Flight[] => {
  const airlines = ['Delta', 'American', 'United', 'JetBlue', 'Southwest', 'Spirit', 'Frontier'];
  const basePrice = getBasePriceForRoute(originIATA || originName, destIATA || destName);
  
  return Array.from({ length: 3 }, (_, i) => {
    const airline = airlines[i % airlines.length];
    const flightNum = `${airline.substring(0, 2).toUpperCase()}${100 + i}`;
    const price = basePrice + (i * 50);
    const now = new Date();
    
    return {
      id: `synth-${i}`,
      flight_number: flightNum,
      airline: `${airline} Airlines`,
      departure: {
        airport: originIATA || originName.toUpperCase(),
        iata: originIATA,
        scheduled: new Date(now.getTime() + (i * 3600000)).toISOString()
      },
      arrival: {
        airport: destIATA || destName.toUpperCase(),
        iata: destIATA,
        scheduled: new Date(now.getTime() + (i * 3600000) + 1800000).toISOString()
      },
      price: price,
      currency: 'USD',
      date: now.toISOString().split('T')[0],
      live_status: '🟡 Synthetic',
      data_source: 'synthetic',
      flight_status: 'scheduled',
      last_updated: now.toLocaleTimeString()
    };
  });
};

// Main API function
export const fetchFlights = async (params: {
  origin?: string;
  destination?: string;
  date?: string;
}): Promise<Flight[]> => {
  try {
    // Convert airport names to IATA codes
    const originIATA = params.origin ? airportToIATA[params.origin.toLowerCase()] : undefined;
    const destIATA = params.destination ? airportToIATA[params.destination.toLowerCase()] : undefined;
    
    let realFlights: any[] = [];
    let usedRealAPI = false;
    
    // TRY REAL API
    if (AVIATIONSTACK_API_KEY && AVIATIONSTACK_API_KEY !== 'f8259de386dd26e25e0c595ef4ecbb82' && 
        (originIATA || destIATA)) {
      
      console.log('Calling AviationStack API');
      
      try {
        const apiParams: any = {
          access_key: AVIATIONSTACK_API_KEY,
          limit: 8,
          flight_status: 'scheduled'
        };
        
        if (originIATA) apiParams.dep_iata = originIATA;
        if (destIATA) apiParams.arr_iata = destIATA;
        if (params.date) apiParams.flight_date = params.date;
        
        const response = await axios.get(`${AVIATIONSTACK_BASE_URL}/flights`, {
          params: apiParams,
          timeout: 3000
        });
        
        if (response.data?.data?.length > 0) {
          realFlights = response.data.data;
          usedRealAPI = true;
          console.log(`returned ${realFlights.length} flights`);
        }
      } catch (apiError: any) {
        console.log('⚠️ API call failed:', apiError.message);
      }
    }
    
    // If we got real flights, transform them
    if (usedRealAPI && realFlights.length > 0) {
      console.log('🔄 Transforming real flight data');
      const now = new Date();
      
      return realFlights.map((flight: any, index: number) => {
        const basePrice = getBasePriceForRoute(
          flight.departure?.iata || flight.departure?.airport,
          flight.arrival?.iata || flight.arrival?.airport
        );
        
        const priceVariation = (Math.random() - 0.3) * 100;
        const finalPrice = Math.max(99, Math.round(basePrice + priceVariation));
        
        return {
          id: `${flight.flight?.iata || flight.flight?.number || `real-${index}`}`,
          flight_number: flight.flight?.number || `FL${index + 100}`,
          airline: flight.airline?.name || 'Airline',
          departure: {
            airport: flight.departure?.airport || flight.departure?.iata || 'Unknown',
            iata: flight.departure?.iata,
            scheduled: flight.departure?.scheduled || new Date().toISOString()
          },
          arrival: {
            airport: flight.arrival?.airport || flight.arrival?.iata || 'Unknown',
            iata: flight.arrival?.iata,
            scheduled: flight.arrival?.scheduled || new Date().toISOString()
          },
          price: finalPrice,
          currency: 'USD',
          date: flight.flight_date || params.date || new Date().toISOString().split('T')[0],
          live_status: '🟢 Live',
          data_source: 'api',
          flight_status: flight.flight_status || 'scheduled',
          last_updated: now.toLocaleTimeString()
        };
      });
    }
    
    // FALLBACK TO ENHANCED DATA
    console.log('Using enhanced data system');
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let results: Flight[] = [];
    
    // If we have IATA codes but no API results, create synthetic flights
    if ((originIATA || destIATA) && !usedRealAPI) {
      console.log('🎭 Creating synthetic flight results');
      results = createSyntheticFlights(
        params.origin || 'Airport',
        params.destination || 'Airport',
        originIATA,
        destIATA
      );
    } else {
      // Filter mock data
      results = MOCK_FLIGHTS.filter(flight => {
        let match = true;
        
        if (params.origin) {
          const originLower = params.origin.toLowerCase();
          match = match && flight.departure.airport.toLowerCase().includes(originLower);
        }
        
        if (params.destination) {
          const destLower = params.destination.toLowerCase();
          match = match && flight.arrival.airport.toLowerCase().includes(destLower);
        }
        
        return match;
      });
    }
    
    // Handle no results
    if (results.length === 0 && (params.origin || params.destination)) {
      results = [{
        id: 'no-results',
        flight_number: 'N/A',
        airline: 'Try: JFK, LAX, SFO, LHR, DXB',
        departure: { 
          airport: params.origin || 'Try:', 
          scheduled: new Date().toISOString() 
        },
        arrival: { 
          airport: params.destination || 'JFK, LAX, etc.', 
          scheduled: new Date().toISOString() 
        },
        price: 0,
        currency: 'USD',
        date: params.date || new Date().toISOString().split('T')[0],
        live_status: '🔍 No Results',
        data_source: 'mock',
        flight_status: 'unknown',
        last_updated: new Date().toLocaleTimeString()
      }];
    }
    
    return results.length > 0 ? results : MOCK_FLIGHTS;
    
  } catch (error: any) {
    console.error('Final Error:', error.message);
    return MOCK_FLIGHTS;
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
