import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout components
import Layout from './components/Layout';

// Simplified test component
import WeeklySummary from './pages/WeeklySummary';
import DailyTaskForm from './pages/DailyTaskForm';
import CalendarView from './pages/CalendarView';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<CalendarView />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/daily" element={<DailyTaskForm />} />
          <Route path="/weekly-summary" element={<WeeklySummary />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
