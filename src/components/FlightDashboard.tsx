import React, { useState, useEffect } from 'react';
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
import SearchIcon from '@mui/icons-material/Search';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchFlights, Flight } from '../services/flightAPI';

const FlightDashboard: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
  });

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    const data = await fetchFlights({});
    setFlights(data);
    setFilteredFlights(data);
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    
    const data = await fetchFlights({
      origin: searchParams.origin || undefined,
      destination: searchParams.destination || undefined,
    });
    
    setFilteredFlights(data);
    setLoading(false);
  };

  const priceData = [
    { day: 'Mon', price: 320 },
    { day: 'Tue', price: 310 },
    { day: 'Wed', price: 295 },
    { day: 'Thu', price: 285 },
    { day: 'Fri', price: 290 },
    { day: 'Sat', price: 315 },
    { day: 'Sun', price: 330 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ✈️ Flight Prices Dashboard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField 
            label="From" 
            placeholder="JFK"
            value={searchParams.origin}
            onChange={(e) => setSearchParams({...searchParams, origin: e.target.value})}
            disabled={loading}
          />
          <TextField 
            label="To" 
            placeholder="LAX"
            value={searchParams.destination}
            onChange={(e) => setSearchParams({...searchParams, destination: e.target.value})}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={<SearchIcon />}
            sx={{ minWidth: '120px' }}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {filteredFlights.length} flights found
          {searchParams.origin && ` from ${searchParams.origin}`}
          {searchParams.destination && ` to ${searchParams.destination}`}
        </Typography>
        
        <Box sx={{ height: 200, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Weekly Price Trends
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Available Flights
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flight</TableCell>
                <TableCell>Airline</TableCell>
                <TableCell>Route</TableCell>
                <TableCell align="right">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFlights.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No flights found. Try a different search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFlights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {flight.flight_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{flight.airline}</TableCell>
                    <TableCell>
                      {flight.departure.airport} → {flight.arrival.airport}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        ${flight.price}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default FlightDashboard;
