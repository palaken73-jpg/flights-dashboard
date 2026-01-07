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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchFlights, Flight } from '../services/flightAPI';
import { format } from 'date-fns';

const FlightDashboard: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    const data = await fetchFlights({});
    setFlights(data);
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
        ✈️ Flight Price Dashboard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField label="From" placeholder="JFK" />
          <TextField label="To" placeholder="LAX" />
          <Button variant="contained">Search</Button>
        </Box>
        
        <Box sx={{ height: 200, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Price Trends
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
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
                <TableCell>Route</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flights.map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell>{flight.flight_number}</TableCell>
                  <TableCell>
                    {flight.departure.airport} → {flight.arrival.airport}
                  </TableCell>
                  <TableCell>${flight.price}</TableCell>
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
