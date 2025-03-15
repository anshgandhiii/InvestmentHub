
// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortfolioSummary from './portfolio/PortfolioSummary';
import RecentTransactions from './transactions/RecentTransactions';
import MarketOverview from './market/MarketOverview';
import TopRecommendations from './recommendations/TopRecommendations';
import AccountBalance from './account/AccountBalance';
import InvestmentService from '../services/InvestmentService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [portfolio, transactions, market, recs] = await Promise.all([
          InvestmentService.getPortfolioSummary(),
          InvestmentService.getRecentTransactions(5),
          InvestmentService.getMarketOverview(),
          InvestmentService.getPersonalizedRecommendations(3)
        ]);
        
        setPortfolioData(portfolio);
        setRecentTransactions(transactions);
        setMarketData(market);
        setRecommendations(recs);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Investment Dashboard</h1>
      
      <div className="dashboard-row">
        <div className="dashboard-widget wide">
          <PortfolioSummary data={portfolioData} />
        </div>
        <div className="dashboard-widget">
          <AccountBalance />
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="dashboard-widget">
          <MarketOverview data={marketData} />
        </div>
        <div className="dashboard-widget">
          <TopRecommendations recommendations={recommendations} />
        </div>
      </div>
      
      <div className="dashboard-row">
        <div className="dashboard-widget wide">
          <RecentTransactions transactions={recentTransactions} />
          <div className="view-all">
            <Link to="/transactions">View All Transactions</Link>
          </div>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <Link to="/profit-calculator" className="action-button">
          <span className="icon">📈</span>
          <span>Estimate Profits</span>
        </Link>
        <Link to="/recommendations" className="action-button">
          <span className="icon">💡</span>
          <span>Get Investment Suggestions</span>
        </Link>
        <Link to="/stocks" className="action-button">
          <span className="icon">💰</span>
          <span>Buy/Sell Assets</span>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

// components/recommendations/Recommendations.js
import React, { useState, useEffect } from 'react';
import RecommendationFilters from './RecommendationFilters';
import RecommendationList from './RecommendationList';
import InvestmentService from '../../services/InvestmentService';
import '../../styles/Recommendations.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    assetType: 'all',
    timeHorizon: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [filters]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await InvestmentService.getRecommendations(filters);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="recommendations-container">
      <h1>Investment Recommendations</h1>
      <p className="description">
        Get personalized investment suggestions based on your risk profile, 
        investment goals, and market conditions.
      </p>
      
      <RecommendationFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {loading ? (
        <div className="loading">Loading recommendations...</div>
      ) : (
        <RecommendationList recommendations={recommendations} />
      )}
    </div>
  );
};

export default Recommendations;

// components/tools/ProfitCalculator.js
import React, { useState } from 'react';
import InvestmentService from '../../services/InvestmentService';
import '../../styles/ProfitCalculator.css';

const ProfitCalculator = () => {
  const [formData, setFormData] = useState({
    investmentType: 'stock',
    amount: 1000,
    duration: 5,
    riskLevel: 'medium',
    reinvestDividends: false
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const calculationResults = await InvestmentService.calculatePotentialReturns(formData);
      setResults(calculationResults);
    } catch (error) {
      console.error('Error calculating profits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profit-calculator">
      <h1>Investment Profit Calculator</h1>
      <p className="description">
        Estimate potential returns on your investments based on historical data 
        and market projections.
      </p>
      
      <div className="calculator-container">
        <form onSubmit={handleSubmit} className="calculator-form">
          <div className="form-group">
            <label htmlFor="investmentType">Investment Type</label>
            <select 
              id="investmentType" 
              name="investmentType" 
              value={formData.investmentType}
              onChange={handleInputChange}
            >
              <option value="stock">Stocks</option>
              <option value="bond">Bonds</option>
              <option value="etf">ETFs</option>
              <option value="mutual">Mutual Funds</option>
              <option value="insurance">Insurance Products</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Investment Amount ($)</label>
            <input 
              type="number" 
              id="amount" 
              name="amount" 
              value={formData.amount}
              onChange={handleInputChange}
              min="100"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="duration">Investment Duration (years)</label>
            <input 
              type="number" 
              id="duration" 
              name="duration" 
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              max="30"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="riskLevel">Risk Level</label>
            <select 
              id="riskLevel" 
              name="riskLevel" 
              value={formData.riskLevel}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="form-group checkbox">
            <input 
              type="checkbox" 
              id="reinvestDividends" 
              name="reinvestDividends" 
              checked={formData.reinvestDividends}
              onChange={handleInputChange}
            />
            <label htmlFor="reinvestDividends">Reinvest Dividends/Interest</label>
          </div>
          
          <button type="submit" className="calculator-button" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Potential Returns'}
          </button>
        </form>
        
        {results && (
          <div className="calculator-results">
            <h2>Projected Returns</h2>
            
            <div className="result-item">
              <span>Initial Investment:</span>
              <span>${formData.amount.toLocaleString()}</span>
            </div>
            
            <div className="result-item">
              <span>Projected Value:</span>
              <span>${results.projectedValue.toLocaleString()}</span>
            </div>
            
            <div className="result-item">
              <span>Total Return:</span>
              <span>${results.totalReturn.toLocaleString()} ({results.returnPercentage}%)</span>
            </div>
            
            <div className="result-item">
              <span>Annual Return Rate:</span>
              <span>{results.annualReturnRate}%</span>
            </div>
            
            <div className="result-charts">
              {/* Charts would be rendered here using a library like Chart.js or Recharts */}
              <div className="chart-placeholder">Growth Projection Chart</div>
            </div>
            
            <div className="result-disclaimer">
              <p>
                Note: These projections are based on historical data and market assumptions. 
                Actual returns may vary. Past performance is not indicative of future results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfitCalculator;

// components/stocks/StockMarket.js
import React, { useState, useEffect } from 'react';
import StockList from './StockList';
import StockSearch from './StockSearch';
import StockFilters from './StockFilters';
import StockOrderForm from './StockOrderForm';
import InvestmentService from '../../services/InvestmentService';
import '../../styles/StockMarket.css';

const StockMarket = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [filters, setFilters] = useState({
    sector: 'all',
    priceRange: [0, 5000],
    marketCap: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await InvestmentService.getStocks();
        setStocks(data);
        setFilteredStocks(data);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let results = [...stocks];
    
    // Apply search term
    if (searchTerm) {
      results = results.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sector filter
    if (filters.sector !== 'all') {
      results = results.filter(stock => stock.sector === filters.sector);
    }
    
    // Apply price range filter
    results = results.filter(stock => 
      stock.price >= filters.priceRange[0