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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';

const FlightDashboard: React.FC = () => {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({ origin: '', destination: '' });

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFlights([
      { id: '1', flight: 'AA123', airline: 'American', from: 'JFK', to: 'LAX', price: 299 },
      { id: '2', flight: 'DL456', airline: 'Delta', from: 'LAX', to: 'JFK', price: 345 },
      { id: '3', flight: 'UA789', airline: 'United', from: 'SFO', to: 'ORD', price: 289 },
    ]);
    setLoading(false);
  };

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setFlights([
        { id: '1', flight: 'AA123', airline: 'American', from: search.origin || 'JFK', to: search.destination || 'LAX', price: 299 },
        { id: '2', flight: 'DL456', airline: 'Delta', from: search.origin || 'JFK', to: search.destination || 'LAX', price: 345 },
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Flight Dashboard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>
          Available Flights ({flights.length})
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Flight</TableCell>
                <TableCell>Airline</TableCell>
                <TableCell>Route</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Status</TableCell>
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
                  <TableCell align="right">
                    <Typography variant="h6" color="primary">
                      ${flight.price}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label="Available" color="success" size="small" />
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

export default FlightDashboard;