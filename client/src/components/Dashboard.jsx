import { useState, useEffect } from "react";
import { FaChartLine, FaDollarSign, FaArrowUp, FaArrowDown, FaChartBar, FaChartPie } from "react-icons/fa";
import axios from "axios";
import { TradePanel } from "./TradePanel";
import {InvestmentSuggestions} from "./InvestmentSuggessions";
import SipCalculator from "./SipCalculator";
import InsurancePurchase from "./InsurancePurchase";
import stockData from "../stocks.json"; // Import stocks.json
import bondsData from "../bonds.json"; // Import bonds.json
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

export default function Dashboard() {
  const userId = localStorage.getItem("user_id");
  const [activeTab, setActiveTab] = useState("overview");
  const [portfolioSummary, setPortfolioSummary] = useState([]);
  const [profile, setProfile] = useState({});
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPriceIndex, setCurrentPriceIndex] = useState(0);
  const [performanceHistory, setPerformanceHistory] = useState(() => {
    const savedHistory = localStorage.getItem(`performanceHistory_${userId}`);
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [timeSlot, setTimeSlot] = useState("All");
  const stocks = stockData.stocks || [];
  const bonds = bondsData || [];

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const portfolioResponse = await axios.get(`http://127.0.0.1:8000/investment/portfolio/${userId}/`, {
          headers: { "User-Id": userId },
        });
        const profileResponse = await axios.get(`http://127.0.0.1:8000/user/profile/${userId}`, {
          headers: { "User-Id": userId },
        });

        const fetchedPortfolioData = portfolioResponse.data || [];
        const profileData = profileResponse.data || {};

        setPortfolioData(fetchedPortfolioData);
        setProfile(profileData);
        updatePortfolioSummary(fetchedPortfolioData, profileData, 0);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
        setLoading(false);
      }
    };

    if (userId) fetchPortfolioData();
    else setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId && performanceHistory.length > 0) {
      localStorage.setItem(`performanceHistory_${userId}`, JSON.stringify(performanceHistory));
    }
  }, [performanceHistory, userId]);

  const updatePortfolioSummary = (portfolio, profileData, priceIndex) => {
    const stockTimestamps =
      stocks.length > 0 && stocks[0] && stocks[0]["Time Series (5min)"]
        ? Object.keys(stocks[0]["Time Series (5min)"]).sort().reverse()
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
          ? parseFloat(stock["Time Series (5min)"][stockTimestamps[priceIndex]]["4. close"])
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

    const stocksValue = portfolio
      ? portfolio
          .filter((item) => stocks.some((s) => s && s["Meta Data"] && s["Meta Data"]["2. Symbol"] === item.asset_symbol))
          .reduce((sum, item) => sum + (currentPrices[item.asset_symbol] || 0) * item.quantity, 0)
      : 0;

    const bondsValue = portfolio
      ? portfolio
          .filter((item) => bonds.some((b) => b && b["Meta Data"] && b["Meta Data"]["2. Symbol"] === item.asset_symbol))
          .reduce((sum, item) => sum + (currentPrices[item.asset_symbol] || 0) * item.quantity, 0)
      : 0;

    const insuranceValue = parseFloat(profileData?.insurance) || 0;
    const boughtsum = parseFloat(profileData?.boughtsum) || 0;
    const totalPortfolio = stocksValue + bondsValue + insuranceValue;

    setPerformanceHistory((prev) => {
      const now = Date.now();
      const lastTimestamp = prev.length > 0 ? prev[prev.length - 1].timestamp : now - 5000;
      const gap = now - lastTimestamp;
      const minGap = 1000;
      if (gap >= minGap) {
        return [...prev, { timestamp: now, value: totalPortfolio }];
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

    const portfolioTrend = calculateTrend(totalPortfolio, boughtsum);
    const stocksTrend = calculateTrend(stocksValue, profileData?.stocks_initial || profileData?.stocks || stocksValue);
    const bondsTrend = calculateTrend(bondsValue, profileData?.bonds_initial || profileData?.bonds || bondsValue);
    const insuranceTrend = { percentage: "0.0%", direction: "neutral" };

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
        trend: stocksTrend.percentage,
        trendIcon: stocksTrend.direction === "up" ? (
          <FaArrowUp className="h-4 w-4 text-green-500" />
        ) : stocksTrend.direction === "down" ? (
          <FaArrowDown className="h-4 w-4 text-red-500" />
        ) : null,
        trendColor: stocksTrend.direction === "up" ? "bg-green-100 text-green-600" : stocksTrend.direction === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
      },
      {
        title: "Bonds",
        value: `$${bondsValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
        title: "Insurance",
        value: `$${insuranceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
      stocks.length > 0 && stocks[0] && stocks[0]["Time Series (5min)"]
        ? Object.keys(stocks[0]["Time Series (5min)"]).sort().reverse()
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

  // Function to reset performance history
  const resetPerformanceHistory = () => {
    if (userId) {
         // Clear from localStorage
      setPerformanceHistory([]); // Reset state to empty array
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
          label: "Portfolio Value",
          data: filteredHistory.map((entry) => entry.value),
          fill: true,
          backgroundColor: "rgba(79, 70, 229, 0.2)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 2,
          tension: 0,
          pointRadius: 3,
        },
      ],
    };
  };

  const performanceData = filterPerformanceData();

  const stocksValue = portfolioSummary.find((item) => item.title === "Stocks")?.value.replace("$", "").replace(/,/g, "") || 0;
  const bondsValue = portfolioSummary.find((item) => item.title === "Bonds")?.value.replace("$", "").replace(/,/g, "") || 0;
  const insuranceValue = portfolioSummary.find((item) => item.title === "Insurance")?.value.replace("$", "").replace(/,/g, "") || 0;
  const totalPortfolio = parseFloat(stocksValue) + parseFloat(bondsValue) + parseFloat(insuranceValue);

  const allocationData = {
    labels: ["Stocks", "Bonds", "Insurance"],
    datasets: [
      {
        data: [
          totalPortfolio ? (parseFloat(stocksValue) / totalPortfolio) * 100 : 0,
          totalPortfolio ? (parseFloat(bondsValue) / totalPortfolio) * 100 : 0,
          totalPortfolio ? (parseFloat(insuranceValue) / totalPortfolio) * 100 : 0,
        ],
        backgroundColor: ["#4F46E5", "#10B981", "#F59E0B"],
        borderWidth: 1,
        borderColor: "#fff",
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
        callbacks: { label: (context) => `$${context.parsed.y.toLocaleString("en-US")}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { callback: (value) => `$${value.toLocaleString("en-US")}` },
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

  const handleAddFunds = () => {
    alert("Redirecting to payment gateway to add funds...");
  };

  if (loading) {
    return <div className="text-center p-6">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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

      <div className="animate-fade-in space-y-8">
        {activeTab === "overview" && (
          <>
            <div className="card bg-base-100 shadow-md p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Account Balance</h3>
                <button className="btn btn-sm btn-outline btn-primary" onClick={handleAddFunds}>
                  Add Funds
                </button>
              </div>
              <p className="text-xl font-bold">
                ${profile.balance
                  ? parseFloat(profile.balance).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "0.00"}
              </p>
              <p className="text-gray-500 text-sm">Last deposit: $2,000 on Mar 10, 2025</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FaChartLine className="text-indigo-500" /> Performance
                  </h2>
                  <button
                    className="btn btn-sm btn-outline btn-warning"
                    onClick={resetPerformanceHistory}
                  >
                    Reset Graph
                  </button>
                </div>
                <div className="h-72 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg mt-4">
                  <Line data={performanceData} options={performanceOptions} />
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  {["1H", "1D", "1W", "1M", "All"].map((slot) => (
                    <button
                      key={slot}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        timeSlot === slot ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-indigo-100"
                      }`}
                      onClick={() => setTimeSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaChartPie className="text-indigo-500" /> Allocation
                </h2>
                <div className="h-72 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg mt-4">
                  <Pie data={allocationData} options={allocationOptions} />
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