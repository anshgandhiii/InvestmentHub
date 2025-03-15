// App.js - Main component
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/Dashboard';
import StockMarket from './components/stocks/StockMarket';
import BondMarket from './components/bonds/BondMarket';
import InsuranceProducts from './components/insurance/InsuranceProducts';
import Portfolio from './components/portfolio/Portfolio';
import Recommendations from './components/recommendations/Recommendations';
import ProfitCalculator from './components/tools/ProfitCalculator';
import TransactionHistory from './components/transactions/TransactionHistory';
import AccountSettings from './components/settings/AccountSettings';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AuthService from './services/AuthService';
import UserContext from './context/UserContext';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = async () => {
      try {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <UserContext.Provider value={{ user, setUser }}>
        <div className="app">
          {user ? (
            <>
              <Header />
              <div className="main-container">
                <Sidebar />
                <main className="content">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/stocks" element={<StockMarket />} />
                    <Route path="/bonds" element={<BondMarket />} />
                    <Route path="/insurance" element={<InsuranceProducts />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/profit-calculator" element={<ProfitCalculator />} />
                    <Route path="/transactions" element={<TransactionHistory />} />
                    <Route path="/settings" element={<AccountSettings />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </>
          ) : (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </div>
      </UserContext.Provider>
    </Router>
  );
}

export default App;