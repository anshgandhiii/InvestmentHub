import { useState, useEffect } from "react";
import { FaChartLine, FaDollarSign, FaArrowUp, FaArrowDown, FaChartBar, FaChartPie, FaCoins } from "react-icons/fa";
import axios from "axios";
import { TradePanel } from "./VirtualTrade";
import stockData from "../stocks.json";
import bondsData from "../bonds.json";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function VirtualMarket() {
  const userId = localStorage.getItem("user_id") || "default_user";
  const [activeTab, setActiveTab] = useState("overview");
  const [portfolioSummary, setPortfolioSummary] = useState([]);
  const [profile, setProfile] = useState({});
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPriceIndex, setCurrentPriceIndex] = useState(0);
  const [performanceHistory, setPerformanceHistory] = useState(() => {
    const savedHistory = localStorage.getItem(`virtualPerformanceHistory_${userId}`);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [timeSlot, setTimeSlot] = useState("All");
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [message, setMessage] = useState(null); // For success/error messages
  const stocks = stockData.stocks || [];
  const bonds = bondsData || [];

  // Fetch initial data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const portfolioResponse = await axios.get(`http://127.0.0.1:8000/virtual/portfolio/${userId}/`, {
          headers: { "User-Id": userId },
        });
        const profileResponse = await axios.get(`http://127.0.0.1:8000/user/virtualprofile/${userId}/`, {
          headers: { "User-Id": userId },
        });

        const fetchedPortfolioData = portfolioResponse.data || [];
        const profileData = profileResponse.data || {};

        setPortfolioData(fetchedPortfolioData);
        setProfile(profileData);
        updatePortfolioSummary(fetchedPortfolioData, profileData, 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching virtual portfolio data:", error);
        setLoading(false);
      }
    };

    if (userId) fetchPortfolioData();
    else setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId && performanceHistory.length > 0) {
      localStorage.setItem(`virtualPerformanceHistory_${userId}`, JSON.stringify(performanceHistory));
    }
  }, [performanceHistory, userId]);

  const updatePortfolioSummary = (portfolio, profileData, priceIndex) => {
    const stockTimestamps =
      stocks.length > 0 && stocks[0] && stocks[0]["Time Series (60min)"]
        ? Object.keys(stocks[0]["Time Series (60min)"]).sort().reverse()
        : [];
    const bondTimestamps =
      bonds.length > 0 && bonds[0] && bonds[0]["Time Series (5min)"]
        ? Object.keys(bonds[0]["Time Series (5min)"]).sort().reverse()
        : [];

    const currentPrices = {};
    stocks.forEach((stock) => {
      if (stock && stock["Meta Data"]) {
        const symbol = stock["Meta Data"]["2. Symbol"];
        currentPrices[symbol] = stockTimestamps[priceIndex]
          ? parseFloat(stock["Time Series (60min)"][stockTimestamps[priceIndex]]["4. close"])
          : 0;
      }
    });
    bonds.forEach((bond) => {
      if (bond && bond["Meta Data"]) {
        const symbol = bond["Meta Data"]["2. Symbol"];
        currentPrices[symbol] = bondTimestamps[priceIndex]
          ? parseFloat(bond["Time Series (5min)"][bondTimestamps[priceIndex]]["4. price"])
          : 0;
      }
    });

    const virtualStocksValue = portfolio
      ? portfolio
          .filter((item) => stocks.some((s) => s && s["Meta Data"] && s["Meta Data"]["2. Symbol"] === item.virtual_asset_symbol))
          .reduce((sum, item) => sum + (currentPrices[item.virtual_asset_symbol] || 0) * item.virtual_quantity, 0)
      : 0;

    const virtualBondsValue = portfolio
      ? portfolio
          .filter((item) => bonds.some((b) => b && b["Meta Data"] && b["Meta Data"]["2. Symbol"] === item.virtual_asset_symbol))
          .reduce((sum, item) => sum + (currentPrices[item.virtual_asset_symbol] || 0) * item.virtual_quantity, 0)
      : 0;

    const virtualInsuranceValue = parseFloat(profileData?.virtualinsurance) || 0;
    const virtualBoughtsum = parseFloat(profileData?.virtualboughtsum) || 0; // Default virtual starting amount
    const totalVirtualPortfolio = virtualStocksValue + virtualBondsValue + virtualInsuranceValue;

    setPerformanceHistory((prev) => {
      const now = Date.now();
      const lastTimestamp = prev.length > 0 ? prev[prev.length - 1].timestamp : now - 5000;
      const gap = now - lastTimestamp;
      const minGap = 1000;
      if (gap >= minGap) {
        return [...prev, { timestamp: now, value: totalVirtualPortfolio }];
      }
      return prev;
    });

    const calculateTrend = (currentValue, initialValue) => {
      if (initialValue === 0) return { percentage: "0.0%", direction: "neutral" };
      const change = ((currentValue - initialValue) / initialValue) * 100;
      return {
        percentage: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
        direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      };
    };

    const portfolioTrend = calculateTrend(totalVirtualPortfolio, virtualBoughtsum);
    const stocksTrend = calculateTrend(virtualStocksValue, profileData?.virtualstocks_initial || profileData?.virtualstocks || virtualStocksValue);
    const bondsTrend = calculateTrend(virtualBondsValue, profileData?.virtualbonds_initial || profileData?.virtualbonds || virtualBondsValue);
    const insuranceTrend = { percentage: "0.0%", direction: "neutral" };

    const summary = [
      {
        title: "Virtual Portfolio",
        value: `$${totalVirtualPortfolio.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
        title: "Virtual Stocks",
        value: `$${virtualStocksValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: <FaChartLine className="h-6 w-6 text-indigo-500" />,
        trend: stocksTrend.percentage,
        trendIcon: stocksTrend.direction === "up" ? (
          <FaArrowUp className="h-4 w-4 text-green-500" />
        ) : stocksTrend.direction === "down" ? (
          <FaArrowDown className="h-4 w-4 text-red-500" />
        ) : null,
        trendColor: stocksTrend.direction === "up" ? "bg-green-100 text-green-600" : stocksTrend.direction === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
      },
      {
        title: "Virtual Bonds",
        value: `$${virtualBondsValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: <FaChartBar className="h-6 w-6 text-indigo-500" />,
        trend: bondsTrend.percentage,
        trendIcon: bondsTrend.direction === "up" ? (
          <FaArrowUp className="h-4 w-4 text-green-500" />
        ) : bondsTrend.direction === "down" ? (
          <FaArrowDown className="h-4 w-4 text-red-500" />
        ) : null,
        trendColor: bondsTrend.direction === "up" ? "bg-green-100 text-green-600" : bondsTrend.direction === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
      },
      {
        title: "Virtual Insurance",
        value: `$${virtualInsuranceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: <FaChartPie className="h-6 w-6 text-indigo-500" />,
        trend: insuranceTrend.percentage,
        trendIcon: null,
        trendColor: "bg-gray-100 text-gray-600",
      },
    ];

    setPortfolioSummary(summary);
  };

  useEffect(() => {
    if (loading || !portfolioData.length) return;

    const timestamps =
      stocks.length > 0 && stocks[0] && stocks[0]["Time Series (60min)"]
        ? Object.keys(stocks[0]["Time Series (60min)"]).sort().reverse()
        : [];
    if (!timestamps.length) return;

    const interval = setInterval(() => {
      setCurrentPriceIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % timestamps.length;
        updatePortfolioSummary(portfolioData, profile, nextIndex);
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [loading, portfolioData, profile]);

  const resetPerformanceHistory = () => {
    if (userId) {
      localStorage.removeItem(`virtualPerformanceHistory_${userId}`);
      setPerformanceHistory([]);
    }
  };

  const handleAddFunds = async () => {
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount." });
      return;
    }

    setIsAddingFunds(true);
    setMessage(null); // Clear previous message
    try {
      const currentBalance = parseFloat(profile.virtualbalance || 0);
      const amountToAdd = parseFloat(addFundsAmount);
      const newBalance = currentBalance + amountToAdd;

      const response = await axios.put(
        `http://127.0.0.1:8000/user/virtualprofile/${userId}/`,
        { virtualbalance: newBalance.toFixed(2) }, // Ensure string format for backend
        { headers: { "User-Id": userId } }
      );

      if (response.status === 200) {
        setProfile(response.data);
        setAddFundsAmount("");
        setMessage({
          type: "success",
          text: `Successfully added $${amountToAdd.toLocaleString("en-US")} to your virtual account.`,
        });
        setTimeout(() => {
          document.getElementById("addFundsModal").close();
          setMessage(null);
        }, 2000); // Close modal after 2 seconds
      }
    } catch (error) {
      console.error("Error adding virtual funds:", error);
      setMessage({ type: "error", text: "Failed to add virtual funds. Please try again." });
    } finally {
      setIsAddingFunds(false);
    }
  };

  const filterPerformanceData = () => {
    const now = Date.now();
    let filteredHistory = performanceHistory;

    switch (timeSlot) {
      case "1H":
        filteredHistory = performanceHistory.filter((entry) => now - entry.timestamp <= 60 * 60 * 1000);
        break;
      case "1D":
        filteredHistory = performanceHistory.filter((entry) => now - entry.timestamp <= 24 * 60 * 60 * 1000);
        break;
      case "1W":
        filteredHistory = performanceHistory.filter((entry) => now - entry.timestamp <= 7 * 24 * 60 * 60 * 1000);
        break;
      case "1M":
        filteredHistory = performanceHistory.filter((entry) => now - entry.timestamp <= 30 * 24 * 60 * 60 * 1000);
        break;
      case "All":
      default:
        filteredHistory = performanceHistory;
        break;
    }

    return {
      labels: filteredHistory.map((entry) =>
        new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      ),
      datasets: [
        {
          label: "Virtual Portfolio Value",
          data: filteredHistory.map((entry) => entry.value),
          fill: true,
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    };
  };

  const performanceData = filterPerformanceData();
  const virtualStocksValue = portfolioSummary.find((item) => item.title === "Virtual Stocks")?.value.replace("$", "").replace(/,/g, "") || "0";
  const virtualBondsValue = portfolioSummary.find((item) => item.title === "Virtual Bonds")?.value.replace("$", "").replace(/,/g, "") || "0";
  const virtualInsuranceValue = portfolioSummary.find((item) => item.title === "Virtual Insurance")?.value.replace("$", "").replace(/,/g, "") || "0";
  const totalVirtualPortfolio = parseFloat(virtualStocksValue) || 0 + parseFloat(virtualBondsValue) || 0 + parseFloat(virtualInsuranceValue) || 0;

  const allocationData = {
    labels: ["Virtual Stocks", "Virtual Bonds", "Virtual Insurance"],
    datasets: [
      {
        data: [
          totalVirtualPortfolio ? (parseFloat(virtualStocksValue) / totalVirtualPortfolio) * 100 : 0,
          totalVirtualPortfolio ? (parseFloat(virtualBondsValue) / totalVirtualPortfolio) * 100 : 0,
          totalVirtualPortfolio ? (parseFloat(virtualInsuranceValue) / totalVirtualPortfolio) * 100 : 0,
        ],
        backgroundColor: ["#6366F1", "#10B981", "#F59E0B"],
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  };

  const performanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        callbacks: { label: (context) => `$${context.parsed.y.toLocaleString("en-US")}` },
      },
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { 
          maxTicksLimit: 8, 
          font: { size: 12, family: "'Inter', sans-serif" },
          color: "#6B7280",
        } 
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { 
          callback: (value) => `$${value.toLocaleString("en-US")}`, 
          font: { size: 12, family: "'Inter', sans-serif" },
          color: "#6B7280",
        },
      },
    },
  };

  const allocationOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 12, family: "'Inter', sans-serif" },
          color: "#374151",
          padding: 15,
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label}: ${data.datasets[0].data[i].toFixed(1)}%`,
              fillStyle: data.datasets[0].backgroundColor[i],
            }));
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600 text-lg font-medium">Loading Virtual Market...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {portfolioSummary.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.icon}
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{item.title}</h2>
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
      <div className="bg-white rounded-xl shadow-md p-3 flex justify-start gap-3 mb-8 overflow-x-auto">
        {["overview", "trade"].map((tab) => (
          <button
            key={tab}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-indigo-50"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {activeTab === "overview" && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <FaCoins className="mr-2 text-indigo-500" />
                  Virtual InvestHub Money
                </h3>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
                  onClick={() => document.getElementById("addFundsModal").showModal()}
                >
                  Add Funds
                </button>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                ${profile.virtualbalance
                  ? parseFloat(profile.virtualbalance).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "10,000.00"}
              </p>
              <p className="mt-1 text-sm text-gray-500">Last deposit: $2,000 on Mar 10, 2025</p>
            </div>

            {/* Add Funds Modal */}
            <dialog id="addFundsModal" className="modal modal-middle">
              <div className="modal-box bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">Add Virtual Funds</h3>
                <p className="text-gray-600 text-center mb-6">Enter the amount to deposit into your virtual account</p>
                
                {/* Message Banner */}
                {message && (
                  <div
                    className={`p-3 rounded-md mb-4 text-sm font-medium text-center transition-all duration-300 ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-center"
                    min="0"
                    step="0.01"
                    disabled={isAddingFunds}
                  />
                </div>

                <div className="mt-6 flex justify-center gap-4">
                  <button
                    className={`px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors ${
                      isAddingFunds ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleAddFunds}
                    disabled={isAddingFunds}
                  >
                    {isAddingFunds ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Add Funds"
                    )}
                  </button>
                  <button
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
                    onClick={() => {
                      document.getElementById("addFundsModal").close();
                      setMessage(null); // Clear message on close
                    }}
                    disabled={isAddingFunds}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </dialog>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaChartLine className="text-indigo-500" /> Virtual Portfolio Performance
                  </h2>
                  <button
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                    onClick={resetPerformanceHistory}
                  >
                    Reset
                  </button>
                </div>
                <div className="h-80">
                  <Line data={performanceData} options={performanceOptions} />
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  {["1H", "1D", "1W", "1M", "All"].map((slot) => (
                    <button
                      key={slot}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        timeSlot === slot
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setTimeSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <FaChartPie className="text-indigo-500" /> Virtual Asset Allocation
                </h2>
                <div className="h-80">
                  <Pie data={allocationData} options={allocationOptions} />
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === "trade" && <TradePanel />}
      </div>
    </div>
  );
}