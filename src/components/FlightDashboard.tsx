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
import Chip from '@mui/material/Chip';

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
        <TableCell align="center">API Status</TableCell> {/* ✅ NEW COLUMN */}
        <TableCell align="center">Source</TableCell> {/* ✅ NEW COLUMN */}
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredFlights.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} align="center"> {/* Updated colSpan */}
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
              {flight.flight_status && (
                <Typography variant="caption" color="text.secondary">
                  {flight.flight_status}
                </Typography>
              )}
            </TableCell>
            <TableCell>{flight.airline}</TableCell>
            <TableCell>
              <Box>
                <Typography>
                  {flight.departure.airport} → {flight.arrival.airport}
                </Typography>
                {flight.departure.iata && flight.arrival.iata && (
                  <Typography variant="caption" color="primary">
                    {flight.departure.iata}-{flight.arrival.iata}
                  </Typography>
                )}
              </Box>
            </TableCell>
            <TableCell align="right">
              <Typography variant="h6" color="primary">
                ${flight.price}
              </Typography>
            </TableCell>
            <TableCell align="center">
              <Box sx={{ 
                display: 'inline-block',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: flight.live_status?.includes('Live') ? '#e8f5e9' : 
                         flight.live_status?.includes('Demo') ? '#fff8e1' : '#f5f5f5',
                color: flight.live_status?.includes('Live') ? '#2e7d32' : '#666'
              }}>
                {flight.live_status || 'N/A'}
              </Box>
              {flight.last_updated && flight.last_updated !== 'Static' && (
                <Typography variant="caption" display="block" color="text.secondary">
                  Updated: {flight.last_updated}
                </Typography>
              )}
            </TableCell>
            <TableCell align="center">
              <Chip 
                label={flight.data_source || 'mock'}
                size="small"
                color={flight.data_source === 'api' ? 'success' : 
                       flight.data_source === 'synthetic' ? 'warning' : 'default'}
                variant="outlined"
              />
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
