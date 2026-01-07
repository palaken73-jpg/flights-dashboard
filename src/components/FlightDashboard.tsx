import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  FlightTakeoff as FlightTakeoffIcon,
  FlightLand as FlightLandIcon,
  PriceCheck as PriceCheckIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { fetchFlights, generatePriceHistory, Flight } from '../services/flightAPI';
import { format, subDays } from 'date-fns';

const FlightDashboard: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [priceAlerts, setPriceAlerts] = useState<
    Array<{ flightId: string; threshold: number; active: boolean }>
  >([]);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [airlineStats, setAirlineStats] = useState<any[]>([]);

  // Initial data load
  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setLoading(true);
    const data = await fetchFlights({});
    setFlights(data);
    setFilteredFlights(data);
    
    // Generate airline statistics
    const stats = calculateAirlineStats(data);
    setAirlineStats(stats);
    
    setLoading(false);
  };

  const calculateAirlineStats = (flightData: Flight[]) => {
    const stats: Record<string, { count: number; totalPrice: number }> = {};
    
    flightData.forEach(flight => {
      if (!stats[flight.airline]) {
        stats[flight.airline] = { count: 0, totalPrice: 0 };
      }
      stats[flight.airline].count++;
      stats[flight.airline].totalPrice += flight.price;
    });
    
    return Object.entries(stats).map(([airline, data]) => ({
      airline,
      flights: data.count,
      avgPrice: Math.round(data.totalPrice / data.count),
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    const data = await fetchFlights({
      origin: searchParams.origin || undefined,
      destination: searchParams.destination || undefined,
      date: searchParams.date || undefined,
    });
    setFilteredFlights(data);
    setLoading(false);
  };

  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    const history = generatePriceHistory(flight.id);
    setPriceHistory(history);
    
    // Check if any alerts would trigger
    checkPriceAlerts(flight, history);
  };

  const checkPriceAlerts = (flight: Flight, history: any[]) => {
    const latestPrice = history[history.length - 1]?.price;
    const relevantAlerts = priceAlerts.filter(
      alert => alert.flightId === flight.id && alert.active
    );
    
    relevantAlerts.forEach(alert => {
      if (latestPrice <= alert.threshold) {
        setShowAlert(true);
      }
    });
  };

  const addPriceAlert = (flightId: string, threshold: number) => {
    setPriceAlerts([...priceAlerts, { flightId, threshold, active: true }]);
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Price trend data for visualization
  const priceTrendData = [
    { day: 'Mon', price: 320 },
    { day: 'Tue', price: 310 },
    { day: 'Wed', price: 295 },
    { day: 'Thu', price: 285 },
    { day: 'Fri', price: 290 },
    { day: 'Sat', price: 315 },
    { day: 'Sun', price: 330 },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          ✈️ Flight Price Intelligence Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Real-time flight pricing, trends, and alert system
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Origin Airport"
              value={searchParams.origin}
              onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
              placeholder="e.g., JFK"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightTakeoffIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Destination Airport"
              value={searchParams.destination}
              onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
              placeholder="e.g., LAX"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightLandIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={searchParams.date}
              onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{ height: '56px' }}
            >
              {loading ? 'Searching...' : 'Search Flights'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Dashboard Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Flight List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Available Flights ({filteredFlights.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Flight</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Airline</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFlights.map((flight) => (
                    <TableRow
                      key={flight.id}
                      hover
                      selected={selectedFlight?.id === flight.id}
                      onClick={() => handleFlightSelect(flight)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography fontWeight="bold">
                          {flight.flight_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {flight.departure.airport} → {flight.arrival.airport}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(flight.departure.scheduled), 'MMM dd, HH:mm')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{flight.airline}</TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          ${flight.price}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {flight.currency}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            addPriceAlert(flight.id, flight.price * 0.9); // 10% drop alert
                          }}
                          title="Set price alert"
                        >
                          <NotificationsIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Right Column: Stats & Alerts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Price Trends
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
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
          </Paper>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              🏆 Airlines by Price
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={airlineStats.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="airline" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgPrice" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              🔔 Active Alerts ({priceAlerts.filter(a => a.active).length})
            </Typography>
            {priceAlerts.filter(a => a.active).length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center">
                No active alerts
              </Typography>
            ) : (
              priceAlerts
                .filter(a => a.active)
                .map((alert, index) => (
                  <Box key={index} sx={{ mb: 1, p: 1, bgcolor: '#fff8e1', borderRadius: 1 }}>
                    <Typography variant="body2">
                      Alert: Price below ${alert.threshold}
                    </Typography>
                  </Box>
                ))
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Selected Flight Details */}
      {selectedFlight && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            📈 Price History: {selectedFlight.airline} {selectedFlight.flight_number}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#ff6b6b"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Price Analysis
                  </Typography>
                  <Typography variant="h3" color="primary" gutterBottom>
                    ${selectedFlight.price}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingDownIcon color="success" />
                    <Typography color="success.main">
                      12% below 30-day average
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<PriceCheckIcon />}
                    onClick={() => addPriceAlert(selectedFlight.id, selectedFlight.price * 0.85)}
                  >
                    Alert at 15% Drop (${Math.round(selectedFlight.price * 0.85)})
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Alerts Snackbar */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity="success"
          icon={<NotificationsIcon />}
        >
          🎉 Price alert triggered! Flight price dropped below your threshold.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FlightDashboard;