import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';

const FlightDashboard = () => {
  const [flights, setFlights] = useState([
    { id: 1, flight: 'AA123', airline: 'American', from: 'JFK', to: 'LAX', price: 299, source: 'demo' },
    { id: 2, flight: 'DL456', airline: 'Delta', from: 'LAX', to: 'JFK', price: 345, source: 'demo' },
  ]);
  const [search, setSearch] = useState({ origin: '', destination: '' });
  const [apiStatus, setApiStatus] = useState('');

  const handleSearch = () => {
    setFlights([
      { id: 1, flight: 'AA123', airline: 'American', from: search.origin || 'JFK', to: search.destination || 'LAX', price: 299, source: 'demo' },
      { id: 2, flight: 'DL456', airline: 'Delta', from: search.origin || 'JFK', to: search.destination || 'LAX', price: 345, source: 'demo' },
    ]);
  };

  const testAmadeus = async () => {
    setApiStatus('Loading...');
    
    // @ts-ignore - AmadeusAPI is in public/amadeus.js
    const result = await window.AmadeusAPI?.getFlights('JFK', 'LAX');
    
    if(!result || result.demo) {
      setApiStatus('Demo mode - Add API key in public/amadeus.js');
      setFlights(prev => [...prev, {
        id: prev.length + 1,
        flight: 'AM123',
        airline: 'Amadeus API',
        from: 'JFK',
        to: 'LAX', 
        price: 399,
        source: 'api-demo'
      }]);
    } else if(result.data) {
      setApiStatus(`✅ Got ${result.data.length} real flights!`);
      result.data.forEach((offer: any, i: number) => {
        const segment = offer.itineraries[0]?.segments[0];
        setFlights(prev => [...prev, {
          id: prev.length + 1,
          flight: `${segment?.carrierCode}${segment?.number}`,
          airline: segment?.carrierCode || 'Airline',
          from: segment?.departure?.iataCode || 'JFK',
          to: segment?.arrival?.iataCode || 'LAX',
          price: offer.price?.total || 399,
          source: 'api-real'
        }]);
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ✈️ Flight Dashboard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <TextField 
            label="From" 
            value={search.origin}
            onChange={(e) => setSearch({...search, origin: e.target.value})}
            placeholder="JFK"
          />
          <TextField 
            label="To" 
            value={search.destination}
            onChange={(e) => setSearch({...search, destination: e.target.value})}
            placeholder="LAX"
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
          
          <Button 
            variant="contained" 
            color="success"
            onClick={testAmadeus}
          >
            Test Amadeus API
          </Button>
        </Box>
        
        {apiStatus && (
          <Typography color="primary" sx={{ mb: 2 }}>
            {apiStatus}
          </Typography>
        )}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flight</TableCell>
                <TableCell>Airline</TableCell>
                <TableCell>Route</TableCell>
                <TableCell>Price</TableCell>
                <TableCell align="center">Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flights.map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell>
                    <Typography fontWeight="bold">{flight.flight}</Typography>
                  </TableCell>
                  <TableCell>{flight.airline}</TableCell>
                  <TableCell>
                    {flight.from} → {flight.to}
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6" color="primary">
                      ${flight.price}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={flight.source} 
                      color={
                        flight.source === 'api-real' ? 'success' : 
                        flight.source === 'api-demo' ? 'warning' : 'default'
                      } 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<FlightDashboard />);