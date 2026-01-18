import Amadeus from 'amadeus';

const AMADEUS_API_KEY = 'YOUR_API_KEY_HERE';
const AMADEUS_API_SECRET = 'YOUR_API_SECRET_HERE';

// Initialize Amadeus
const amadeus = new Amadeus({
  clientId: AMADEUS_API_KEY,
  clientSecret: AMADEUS_API_SECRET,
  hostname: 'test' // Use 'production' for live (but needs approval)
});

export interface RealFlight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    iataCode: string;
    scheduled: string;
    terminal?: string;
  };
  arrival: {
    airport: string;
    iataCode: string;
    scheduled: string;
    terminal?: string;
  };
  price: {
    total: number;
    currency: string;
  };
  itineraries: any[];
  numberOfBookableSeats: number;
  lastTicketingDate: string;
}

export const searchRealFlights = async (params: {
  origin: string;
  destination: string;
  departureDate: string;
  adults?: number;
}): Promise<RealFlight[]> => {
  try {
    console.log('🛫 Searching REAL flights with Amadeus:', params);
    
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.origin.toUpperCase(),
      destinationLocationCode: params.destination.toUpperCase(),
      departureDate: params.departureDate,
      adults: params.adults || 1,
      max: 10, // Max results (free tier limit)
      currencyCode: 'USD'
    });
    
    console.log('✅ Amadeus Response:', response.data.length, 'flights found');
    
    // Transform Amadeus response to our format
    return response.data.map((offer: any, index: number) => {
      const firstSegment = offer.itineraries[0].segments[0];
      const lastSegment = offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1];
      
      return {
        id: `amadeus-${offer.id || index}`,
        airline: firstSegment.carrierCode,
        flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
        departure: {
          airport: `${firstSegment.departure.iataCode} Airport`,
          iataCode: firstSegment.departure.iataCode,
          scheduled: firstSegment.departure.at,
          terminal: firstSegment.departure.terminal
        },
        arrival: {
          airport: `${lastSegment.arrival.iataCode} Airport`,
          iataCode: lastSegment.arrival.iataCode,
          scheduled: lastSegment.arrival.at,
          terminal: lastSegment.arrival.terminal
        },
        price: {
          total: parseFloat(offer.price.total),
          currency: offer.price.currency
        },
        itineraries: offer.itineraries,
        numberOfBookableSeats: offer.numberOfBookableSeats || 9,
        lastTicketingDate: offer.lastTicketingDate
      };
    });
    
  } catch (error: any) {
    console.error('❌ Amadeus API Error:', error.message);
    
    // Return mock data if API fails (for demo)
    return getFallbackFlights(params);
  }
};

// Airport autocomplete (FREE in Amadeus)
export const searchAirports = async (keyword: string) => {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: keyword,
      subType: 'AIRPORT',
      'page[limit]': 10
    });
    
    return response.data.map((airport: any) => ({
      name: airport.name,
      iataCode: airport.iataCode,
      city: airport.address.cityName,
      country: airport.address.countryName
    }));
  } catch (error) {
    console.error('Airport search error:', error);
    return [];
  }
};

// Fallback mock data
const getFallbackFlights = (params: any): RealFlight[] => {
  const airlines = ['AA', 'DL', 'UA', 'WN', 'B6'];
  const basePrice = 200 + Math.random() * 300;
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: `fallback-${i}`,
    airline: airlines[i % airlines.length],
    flightNumber: `${airlines[i % airlines.length]}${1000 + i}`,
    departure: {
      airport: `${params.origin.toUpperCase()} International Airport`,
      iataCode: params.origin.toUpperCase(),
      scheduled: `2024-01-15T${8 + i}:00:00`
    },
    arrival: {
      airport: `${params.destination.toUpperCase()} International Airport`,
      iataCode: params.destination.toUpperCase(),
      scheduled: `2024-01-15T${10 + i}:00:00`
    },
    price: {
      total: Math.round(basePrice + (i * 50)),
      currency: 'USD'
    },
    itineraries: [],
    numberOfBookableSeats: 9,
    lastTicketingDate: '2024-01-10'
  }));
};