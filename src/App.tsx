import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import FlightDashboard from './components/FlightDashboard';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <FlightDashboard />
      </Box>
    </ThemeProvider>
  );
}

export default App;