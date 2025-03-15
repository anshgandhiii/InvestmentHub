import { useState, useEffect } from "react";
import { FaChartLine, FaDollarSign, FaArrowUp, FaArrowDown, FaChartBar, FaChartPie } from "react-icons/fa";
import axios from "axios";
import { TradePanel } from "./TradePanel";
import { InvestmentSuggestions } from "./InvestmentSuggessions";
import SipCalculator from "./SipCalculator";
import InsurancePurchase from "./InsurancePurchase";
import stockData from "../stocks.json"; // Import stocks.json for current prices

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [portfolioSummary, setPortfolioSummary] = useState([]);
  const [profile, setProfile] = useState({});
  const [portfolioData, setPortfolioData] = useState([]); // Store initial portfolio data
  const [loading, setLoading] = useState(true);
  const [currentPriceIndex, setCurrentPriceIndex] = useState(0); // Track current price timestamp
  const userId = localStorage.getItem("user_id");
  const stocks = stockData.stocks;

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        // Fetch portfolio and profile data from backend
        const portfolioResponse = await axios.get(`http://127.0.0.1:8000/investment/portfolio/${userId}/`, {
          headers: { "User-Id": userId },
        });
        const profileResponse = await axios.get(`http://127.0.0.1:8000/user/profile/${userId}`, {
          headers: { "User-Id": userId },
        });

        const fetchedPortfolioData = portfolioResponse.data;
        const profileData = profileResponse.data;

        setPortfolioData(fetchedPortfolioData);
        setProfile(profileData);
        updatePortfolioSummary(fetchedPortfolioData, profileData, 0); // Initial summary with first price index
        setLoading(false);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
        setLoading(false);
      }
    };

    if (userId) fetchPortfolioData();
  }, [userId]);

  // Function to update portfolio summary based on current price index
  const updatePortfolioSummary = (portfolio, profileData, priceIndex) => {
    // Get timestamps from the first stock (assuming all have same timestamps)
    const timestamps = stocks.length > 0 ? Object.keys(stocks[0]["Time Series (5min)"]).sort().reverse() : [];

    // Get current prices for all stocks at the given index
    const currentPrices = {};
    stocks.forEach((stock) => {
      const symbol = stock["Meta Data"]["2. Symbol"];
      currentPrices[symbol] = timestamps[priceIndex]
        ? parseFloat(stock["Time Series (5min)"][timestamps[priceIndex]]["4. close"])
        : 0;
    });

    // Calculate current portfolio value using current prices
    const totalPortfolio = portfolio.reduce((sum, item) => {
      const currentPrice = currentPrices[item.asset_symbol] || 0;
      return sum + currentPrice * item.quantity;
    }, 0);

    const stocksValue = parseFloat(profileData.stocks) || 0;
    const bondsValue = parseFloat(profileData.bonds) || 0;
    const insuranceValue = parseFloat(profileData.insurance) || 0;
    const boughtsum = parseFloat(profileData.boughtsum) || 0;

    // Calculate trend based on current portfolio value vs. boughtsum
    const calculateTrend = (currentValue, initialValue) => {
      if (initialValue === 0) return { percentage: "0.0%", direction: "neutral" };
      const change = ((currentValue - initialValue) / initialValue) * 100;
      return {
        percentage: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
        direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      };
    };

    const portfolioTrend = calculateTrend(totalPortfolio, boughtsum);

    // Update portfolio summary
    const summary = [
      {
        title: "Portfolio",
        value: `$${totalPortfolio.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: <FaDollarSign className="h-6 w-6 text-indigo-500" />,
        trend: portfolioTrend.percentage,
        trendIcon: portfolioTrend.direction === "up" ? (
          <FaArrowUp className="h-4 w-4 text-green-500" />
        ) : portfolioTrend.direction === "down" ? (
          <FaArrowDown className="h-4 w-4 text-red-500" />
        ) : null,
        trendColor: portfolioTrend.direction === "up" ? "bg-green-100 text-green-600" : portfolioTrend.direction === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
      },
      {
        title: "Stocks",
        value: `$${stocksValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: <FaChartLine className="h-6 w-6 text-indigo-500" />,
      },
      {
        title: "Bonds",
        value: `$${bondsValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: <FaChartBar className="h-6 w-6 text-indigo-500" />,
      },
      {
        title: "Insurance",
        value: `$${insuranceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: <FaChartPie className="h-6 w-6 text-indigo-500" />,
      },
    ];

    setPortfolioSummary(summary);
  };

  // Effect to simulate real-time price updates
  useEffect(() => {
    if (loading || !portfolioData.length) return;

    const timestamps = stocks.length > 0 ? Object.keys(stocks[0]["Time Series (5min)"]).sort().reverse() : [];
    if (!timestamps.length) return;

    const interval = setInterval(() => {
      setCurrentPriceIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % timestamps.length;
        updatePortfolioSummary(portfolioData, profile, nextIndex);
        return nextIndex;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [loading, portfolioData, profile]);

  if (loading) {
    return <div className="text-center p-6">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {portfolioSummary.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.icon}
                <h2 className="text-sm font-semibold text-gray-700">{item.title}</h2>
              </div>
              {item.trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.trendColor}`}>
                  {item.trendIcon} {item.trend}
                </span>
              )}
            </div>
            <div className="mt-4 text-2xl font-bold text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs bg-white rounded-xl shadow-md p-3 flex justify-start gap-3 mb-8 overflow-x-auto">
        {["overview", "trade", "suggestions", "SIP", "Insurance"].map((tab) => (
          <button
            key={tab}
            className={`tab px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-indigo-50"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in space-y-8">
        {activeTab === "overview" && (
          <>
            <div className="card bg-base-100 shadow-md p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Account Balance</h3>
                <button className="btn btn-sm btn-outline">Add Funds</button>
              </div>
              <p className="text-xl font-bold">
                ₹{profile.balance ? parseFloat(profile.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
              </p>
              <p className="text-gray-500 text-sm">Last deposit: ₹2,000 on Mar 10, 2025</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaChartLine className="text-indigo-500" /> Performance
                </h2>
                <div className="h-72 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg mt-4 flex items-center justify-center">
                  <FaChartLine className="h-16 w-16 text-indigo-300" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaChartPie className="text-indigo-500" /> Allocation
                </h2>
                <div className="h-72 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg mt-4 flex items-center justify-center">
                  <FaChartPie className="h-16 w-16 text-indigo-300" />
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === "trade" && <TradePanel />}
        {activeTab === "suggestions" && <InvestmentSuggestions />}
        {activeTab === "SIP" && <SipCalculator />}
        {activeTab === "Insurance" && <InsurancePurchase />}
      </div>
    </div>
  );
}