const AMADEUS_API_KEY = 'ELgladm0pbqUzY8ke0TdkS9SHM0kXEDJ';
const AMADEUS_API_SECRET = 'h1kjA9WxcehHGh54';

let ACCESS_TOKEN = '';
let TOKEN_EXPIRY = 0;

// Get access token
const getAccessToken = async (): Promise<string> => {
  // If token is still valid, return it
  if (ACCESS_TOKEN && Date.now() < TOKEN_EXPIRY) {
    return ACCESS_TOKEN;
  }
  
  console.log('🔐 Getting new Amadeus access token...');
  
  try {
    const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(AMADEUS_API_KEY)}&client_secret=${encodeURIComponent(AMADEUS_API_SECRET)}`
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      ACCESS_TOKEN = data.access_token;
      TOKEN_EXPIRY = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer
      console.log('✅ Got new token');
      return ACCESS_TOKEN;
    } else {
      console.error('❌ Token error:', data);
      throw new Error('Failed to get access token');
    }
  } catch (error) {
    console.error('❌ Token fetch error:', error);
    throw error;
  }
};

export interface AmadeusFlight {
  id: string;
  type: string;
  flightNumber: string;
  airline: string;
  departure: {
    airport: string;
    iataCode: string;
    terminal?: string;
    scheduled: string;
  };
  arrival: {
    airport: string;
    iataCode: string;
    terminal?: string;
    scheduled: string;
  };
  price: {
    total: number;
    currency: string;
  };
  itineraries: any[];
}

export const searchAmadeusFlights = async (params: {
  origin: string;
  destination: string;
  departureDate: string;
  adults?: number;
  currency?: string;
}): Promise<AmadeusFlight[]> => {
  try {
    console.log('🛫 Searching Amadeus flights directly:', params);
    
    // If no API key, return demo data immediately
    if (AMADEUS_API_KEY === 'ELgladm0pbqUzY8ke0TdkS9SHM0kXEDJ') {
      console.log('🔑 No API key, using demo data');
      return generateDemoFlights(params);
    }
    
    const token = await getAccessToken();
    
    const url = new URL('https://test.api.amadeus.com/v2/shopping/flight-offers');
    url.searchParams.append('originLocationCode', params.origin.toUpperCase().slice(0, 3));
    url.searchParams.append('destinationLocationCode', params.destination.toUpperCase().slice(0, 3));
    url.searchParams.append('departureDate', params.departureDate);
    url.searchParams.append('adults', (params.adults || 1).toString());
    url.searchParams.append('max', '10');
    url.searchParams.append('currencyCode', params.currency || 'USD');
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.amadeus+json'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ API Error ${response.status}:`, await response.text());
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Amadeus response:', data.data?.length || 0, 'flights');
    
    if (!data.data || data.data.length === 0) {
      console.log('⚠️ No flights found in API response');
      return generateDemoFlights(params);
    }
    
    // Transform response
    return data.data.map((offer: any, index: number) => {
      const firstSegment = offer.itineraries[0]?.segments[0] || {};
      const lastSegment = offer.itineraries[0]?.segments[offer.itineraries[0]?.segments?.length - 1] || {};
      
      return {
        id: offer.id || `amadeus-${index}`,
        type: offer.type,
        flightNumber: `${firstSegment.carrierCode || 'AA'}${firstSegment.number || '100'}`,
        airline: getAirlineName(firstSegment.carrierCode),
        departure: {
          airport: firstSegment.departure?.iataCode || params.origin,
          iataCode: firstSegment.departure?.iataCode || params.origin.toUpperCase().slice(0, 3),
          terminal: firstSegment.departure?.terminal,
          scheduled: firstSegment.departure?.at || new Date().toISOString()
        },
        arrival: {
          airport: lastSegment.arrival?.iataCode || params.destination,
          iataCode: lastSegment.arrival?.iataCode || params.destination.toUpperCase().slice(0, 3),
          terminal: lastSegment.arrival?.terminal,
          scheduled: lastSegment.arrival?.at || new Date().toISOString()
        },
        price: {
          total: parseFloat(offer.price?.total) || 299.99,
          currency: offer.price?.currency || 'USD'
        },
        itineraries: offer.itineraries || []
      };
    });
    
  } catch (error: any) {
    console.error('❌ Amadeus API Error:', error.message);
    console.log('🔄 Falling back to demo flights');
    return generateDemoFlights(params);
  }
};

// Airport search (direct API)
export const searchAmadeusAirports = async (keyword: string) => {
  try {
    if (!AMADEUS_API_KEY || AMADEUS_API_KEY === 'ELgladm0pbqUzY8ke0TdkS9SHM0kXEDJ') {
      return getMockAirports(keyword);
    }
    
    const token = await getAccessToken();
    
    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(keyword)}&page[limit]=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.amadeus+json'
        }
      }
    );
    
    if (!response.ok) {
      console.error('Airport API error:', response.status);
      return getMockAirports(keyword);
    }
    
    const data = await response.json();
    
    return data.data.map((location: any) => ({
      name: location.name,
      iataCode: location.iataCode,
      type: location.subType,
      city: location.address?.cityName,
      country: location.address?.countryName
    }));
    
  } catch (error) {
    console.log('Using mock airport data');
    return getMockAirports(keyword);
  }
};

// Helper functions
const getAirlineName = (code: string): string => {
  const airlines: Record<string, string> = {
    'AA': 'American Airlines', 'DL': 'Delta', 'UA': 'United', 
    'WN': 'Southwest', 'B6': 'JetBlue', 'AS': 'Alaska',
    'NK': 'Spirit', 'F9': 'Frontier', 'BA': 'British Airways',
    'LH': 'Lufthansa', 'AF': 'Air France', 'EK': 'Emirates',
    'SQ': 'Singapore Airlines', 'JL': 'Japan Airlines'
  };
  return airlines[code] || `${code} Airlines`;
};

const generateDemoFlights = (params: any): AmadeusFlight[] => {
  const airlines = ['AA', 'DL', 'UA', 'WN', 'B6'];
  const basePrice = 199 + Math.random() * 300;
  
  return Array.from({ length: 5 }, (_, i) => {
    const airline = airlines[i % airlines.length];
    const price = Math.round(basePrice + (i * 50));
    const departureTime = new Date(Date.now() + (i * 3600000));
    const arrivalTime = new Date(departureTime.getTime() + 7200000);
    
    return {
      id: `demo-${i}`,
      type: 'flight-offer',
      flightNumber: `${airline}${1000 + i}`,
      airline: getAirlineName(airline),
      departure: {
        airport: `${params.origin.toUpperCase()} Airport`,
        iataCode: params.origin.toUpperCase().slice(0, 3),
        scheduled: departureTime.toISOString()
      },
      arrival: {
        airport: `${params.destination.toUpperCase()} Airport`,
        iataCode: params.destination.toUpperCase().slice(0, 3),
        scheduled: arrivalTime.toISOString()
      },
      price: {
        total: price,
        currency: 'USD'
      },
      itineraries: []
    };
  });
};

const getMockAirports = (keyword: string) => {
  const airports = [
    { name: 'John F Kennedy International', iataCode: 'JFK', type: 'AIRPORT', city: 'New York', country: 'United States' },
    { name: 'Los Angeles International', iataCode: 'LAX', type: 'AIRPORT', city: 'Los Angeles', country: 'United States' },
    { name: 'Chicago O\'Hare International', iataCode: 'ORD', type: 'AIRPORT', city: 'Chicago', country: 'United States' },
    { name: 'Atlanta International', iataCode: 'ATL', type: 'AIRPORT', city: 'Atlanta', country: 'United States' },
    { name: 'Dallas/Fort Worth International', iataCode: 'DFW', type: 'AIRPORT', city: 'Dallas', country: 'United States' },
    { name: 'Denver International', iataCode: 'DEN', type: 'AIRPORT', city: 'Denver', country: 'United States' },
    { name: 'San Francisco International', iataCode: 'SFO', type: 'AIRPORT', city: 'San Francisco', country: 'United States' },
    { name: 'Seattle-Tacoma International', iataCode: 'SEA', type: 'AIRPORT', city: 'Seattle', country: 'United States' },
    { name: 'Miami International', iataCode: 'MIA', type: 'AIRPORT', city: 'Miami', country: 'United States' },
    { name: 'London Heathrow', iataCode: 'LHR', type: 'AIRPORT', city: 'London', country: 'United Kingdom' },
    { name: 'Paris Charles de Gaulle', iataCode: 'CDG', type: 'AIRPORT', city: 'Paris', country: 'France' },
    { name: 'Dubai International', iataCode: 'DXB', type: 'AIRPORT', city: 'Dubai', country: 'UAE' },
    { name: 'Singapore Changi', iataCode: 'SIN', type: 'AIRPORT', city: 'Singapore', country: 'Singapore' },
  ];
  
  const keywordLower = keyword.toLowerCase();
  return airports.filter(airport => 
    airport.name.toLowerCase().includes(keywordLower) ||
    airport.iataCode.toLowerCase().includes(keywordLower) ||
    airport.city.toLowerCase().includes(keywordLower)
  ).slice(0, 10);
};