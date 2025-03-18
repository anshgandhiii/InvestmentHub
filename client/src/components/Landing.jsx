import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaDollarSign,
  FaChartBar,
  FaChartPie,
  FaBars,
  FaArrowRight,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import myImage from "../assets/bse-fotor-ai-art-effects-20250316045844.jpeg.jpg";
import stockData from "../stocks.json"; // Import the stock data

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Simulated market indices data with historical data for charts
const marketIndices = [
  // India
  {
    name: "NIFTY 50",
    value: 24293.55,
    changePercent: 15.29,
    changeValue: 13009.25,
    timeFrame: "5Y",
    lastUpdated: "Jul 25, 10:09:58 AM UTC+5:30",
    historicalData: {
      "1D": Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 24000 + Math.random() * 300 - 150,
      })), // 24 hours
      "5D": Array.from({ length: 5 }, (_, i) => ({
        date: `Mar ${11 + i}`,
        value: 24100 + Math.random() * 500 - 250,
      })), // 5 days
      "1M": Array.from({ length: 30 }, (_, i) => ({
        date: `Feb ${i + 1}`,
        value: 23800 + Math.random() * 800 - 400,
      })), // 30 days
      "1Y": Array.from({ length: 12 }, (_, i) => ({
        month: `Apr ${2024 + Math.floor(i / 12)}`,
        value: 22000 + (i + 1) * 200 + Math.random() * 300,
      })), // 12 months
      "5Y": Array.from({ length: 5 }, (_, i) => ({
        year: 2020 + i,
        value: 11000 + (i + 1) * 2600 + Math.random() * 500,
      })), // 5 years
    },
  },
  {
    name: "SENSEX",
    value: 80000.00,
    changePercent: 10.50,
    changeValue: 7500.00,
    timeFrame: "5Y",
    lastUpdated: "Jul 25, 10:10:00 AM UTC+5:30",
    historicalData: {
      "1D": Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 79800 + Math.random() * 400 - 200,
      })),
      "5D": Array.from({ length: 5 }, (_, i) => ({
        date: `Mar ${11 + i}`,
        value: 79900 + Math.random() * 600 - 300,
      })),
      "1M": Array.from({ length: 30 }, (_, i) => ({
        date: `Feb ${i + 1}`,
        value: 79500 + Math.random() * 1000 - 500,
      })),
      "1Y": Array.from({ length: 12 }, (_, i) => ({
        month: `Apr ${2024 + Math.floor(i / 12)}`,
        value: 72500 + (i + 1) * 600 + Math.random() * 400,
      })),
      "5Y": Array.from({ length: 5 }, (_, i) => ({
        year: 2020 + i,
        value: 55000 + (i + 1) * 5000 + Math.random() * 800,
      })),
    },
  },
  {
    name: "NIFTY Bank",
    value: 50000.00,
    changePercent: 8.75,
    changeValue: 4000.00,
    timeFrame: "5Y",
    lastUpdated: "Jul 25, 10:09:55 AM UTC+5:30",
    historicalData: {
      "1D": Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 49800 + Math.random() * 300 - 150,
      })),
      "5D": Array.from({ length: 5 }, (_, i) => ({
        date: `Mar ${11 + i}`,
        value: 49900 + Math.random() * 400 - 200,
      })),
      "1M": Array.from({ length: 30 }, (_, i) => ({
        date: `Feb ${i + 1}`,
        value: 49500 + Math.random() * 700 - 350,
      })),
      "1Y": Array.from({ length: 12 }, (_, i) => ({
        month: `Apr ${2024 + Math.floor(i / 12)}`,
        value: 46000 + (i + 1) * 300 + Math.random() * 300,
      })),
      "5Y": Array.from({ length: 5 }, (_, i) => ({
        year: 2020 + i,
        value: 42000 + (i + 1) * 1600 + Math.random() * 400,
      })),
    },
  },
  // US Indices
  {
    name: "S&P 500",
    value: 5100.00,
    changePercent: -4.13,
    changeValue: -243.00,
    timeFrame: "YTD",
    lastUpdated: "Mar 15, 01:30 PM PDT",
    historicalData: {
      "1D": Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 5150 - (i + 1) * 2 + Math.random() * 10,
      })),
      "5D": Array.from({ length: 5 }, (_, i) => ({
        date: `Mar ${11 + i}`,
        value: 5140 - (i + 1) * 10 + Math.random() * 20,
      })),
      "1M": Array.from({ length: 30 }, (_, i) => ({
        date: `Feb ${i + 1}`,
        value: 5200 - (i + 1) * 5 + Math.random() * 30,
      })),
      "1Y": Array.from({ length: 12 }, (_, i) => ({
        month: `Apr ${2024 + Math.floor(i / 12)}`,
        value: 5340 - (i + 1) * 20 + Math.random() * 50,
      })),
      "5Y": Array.from({ length: 5 }, (_, i) => ({
        year: 2020 + i,
        value: 4000 + (i + 1) * 220 + Math.random() * 100,
      })),
    },
  },
  {
    name: "NASDAQ 100",
    value: 18000.00,
    changePercent: 3.50,
    changeValue: 600.00,
    timeFrame: "YTD",
    lastUpdated: "Mar 15, 01:32 PM PDT",
    historicalData: {
      "1D": Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 17950 + (i + 1) * 2 + Math.random() * 10,
      })),
      "5D": Array.from({ length: 5 }, (_, i) => ({
        date: `Mar ${11 + i}`,
        value: 17960 + (i + 1) * 10 + Math.random() * 20,
      })),
      "1M": Array.from({ length: 30 }, (_, i) => ({
        date: `Feb ${i + 1}`,
        value: 17800 + (i + 1) * 5 + Math.random() * 30,
      })),
      "1Y": Array.from({ length: 12 }, (_, i) => ({
        month: `Apr ${2024 + Math.floor(i / 12)}`,
        value: 17400 + (i + 1) * 50 + Math.random() * 50,
      })),
      "5Y": Array.from({ length: 5 }, (_, i) => ({
        year: 2020 + i,
        value: 12000 + (i + 1) * 1200 + Math.random() * 200,
      })),
    },
  },
  // Europe Indices
  {
    name: "FTSE 100",
    value: 8200.00,
    changePercent: 10.52,
    changeValue: 515.00,
    timeFrame: "YTD",
    lastUpdated: "Mar 15, 01:35 PM PDT",
    historicalData: {
      "1D": Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 8180 + (i + 1) * 1 + Math.random() * 5,
      })),
      "5D": Array.from({ length: 5 }, (_, i) => ({
        date: `Mar ${11 + i}`,
        value: 8190 + (i + 1) * 5 + Math.random() * 10,
      })),
      "1M": Array.from({ length: 30 }, (_, i) => ({
        date: `Feb ${i + 1}`,
        value: 8100 + (i + 1) * 3 + Math.random() * 15,
      })),
      "1Y": Array.from({ length: 12 }, (_, i) => ({
        month: `Apr ${2024 + Math.floor(i / 12)}`,
        value: 7680 + (i + 1) * 40 + Math.random() * 30,
      })),
      "5Y": Array.from({ length: 5 }, (_, i) => ({
        year: 2020 + i,
        value: 6500 + (i + 1) * 340 + Math.random() * 80,
      })),
    },
  },
  {
    name: "DAX",
    value: 18500.00,
    changePercent: 9.80,
    changeValue: 1500.00,
    timeFrame: "YTD",
    lastUpdated: "Mar 15, 01:34 PM PDT",
    historicalData: {
      "1D": Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 18480 + (i + 1) * 1 + Math.random() * 5,
      })),
      "5D": Array.from({ length: 5 }, (_, i) => ({
        date: `Mar ${11 + i}`,
        value: 18490 + (i + 1) * 5 + Math.random() * 10,
      })),
      "1M": Array.from({ length: 30 }, (_, i) => ({
        date: `Feb ${i + 1}`,
        value: 18300 + (i + 1) * 6 + Math.random() * 15,
      })),
      "1Y": Array.from({ length: 12 }, (_, i) => ({
        month: `Apr ${2024 + Math.floor(i / 12)}`,
        value: 17000 + (i + 1) * 120 + Math.random() * 50,
      })),
      "5Y": Array.from({ length: 5 }, (_, i) => ({
        year: 2020 + i,
        value: 13000 + (i + 1) * 1100 + Math.random() * 100,
      })),
    },
  },
  {
    name: "CAC 40",
    value: 7800.00,
    changePercent: 7.25,
    changeValue: 500.00,
    timeFrame: "YTD",
    lastUpdated: "Mar 15, 01:33 PM PDT",
    historicalData: {
      "1D": Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: 7780 + (i + 1) * 1 + Math.random() * 5,
      })),
      "5D": Array.from({ length: 5 }, (_, i) => ({
        date: `Mar ${11 + i}`,
        value: 7790 + (i + 1) * 4 + Math.random() * 10,
      })),
      "1M": Array.from({ length: 30 }, (_, i) => ({
        date: `Feb ${i + 1}`,
        value: 7700 + (i + 1) * 3 + Math.random() * 15,
      })),
      "1Y": Array.from({ length: 12 }, (_, i) => ({
        month: `Apr ${2024 + Math.floor(i / 12)}`,
        value: 7300 + (i + 1) * 40 + Math.random() * 30,
      })),
      "5Y": Array.from({ length: 5 }, (_, i) => ({
        year: 2020 + i,
        value: 6000 + (i + 1) * 360 + Math.random() * 80,
      })),
    },
  },
];

export default function LandingPage() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedTimeFrames, setSelectedTimeFrames] = useState(
    marketIndices.reduce((acc, index) => {
      acc[index.name] = "5Y"; // Default to 5Y
      return acc;
    }, {})
  );
  const [tickerText, setTickerText] = useState(""); // State for the ticker text
  const navigate = useNavigate();

  // Load user session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("userId");
    if (storedUser) {
      setUserId(storedUser);
    }
  }, []);

  // Process stock data for the ticker
  // Process stock data for the ticker
  // Process stock data for the ticker
useEffect(() => {
  // Check if stockData and stockData.stocks exist
  if (!stockData || !stockData.stocks || !Array.isArray(stockData.stocks)) {
    console.error("Stock data not available or in unexpected format");
    return;
  }

  const latestPrices = stockData.stocks.map((stock) => {
    try {
      const symbol = stock["Meta Data"]["2. Symbol"];
      // Use the correct time series key that matches your data
      const timeSeriesKey = Object.keys(stock).find(key => key.includes("Time Series"));
      
      if (!timeSeriesKey) {
        console.error(`No time series data found for ${symbol}`);
        return { symbol, price: "N/A", change: 0 };
      }
      
      const timeSeries = stock[timeSeriesKey];
      const sortedTimes = Object.keys(timeSeries).sort().reverse(); // Sort times in descending order
      
      if (sortedTimes.length === 0) {
        console.error(`No time entries found for ${symbol}`);
        return { symbol, price: "N/A", change: 0 };
      }
      
      const latestTime = sortedTimes[0]; // Latest time
      const previousTime = sortedTimes.length > 1 ? sortedTimes[1] : null; // Previous time if available
      
      const latestPrice = parseFloat(timeSeries[latestTime]["4. close"]).toFixed(2);
      const previousPrice = previousTime ? parseFloat(timeSeries[previousTime]["4. close"]).toFixed(2) : latestPrice;
      const priceChange = previousTime ? (parseFloat(latestPrice) - parseFloat(previousPrice)) : 0;
      
      return {
        symbol,
        price: latestPrice,
        change: priceChange, // Positive for increase, negative for decrease, 0 if no previous data
      };
    } catch (error) {
      console.error(`Error processing stock data:`, error);
      return { symbol: "ERROR", price: "N/A", change: 0 };
    }
  });

  // Filter out any error entries
  const validPrices = latestPrices.filter(item => item.symbol !== "ERROR");
  
  if (validPrices.length === 0) {
    setTickerText("No stock data available");
    return;
  }

  // Create the ticker text with arrows (repeated for seamless scrolling)
  const tickerElements = validPrices.map(({ symbol, price, change }) => {
    const arrow = change > 0 ? "▲" : change < 0 ? "▼" : ""; // Add arrow based on price change
    
    // Match the exact colors in your screenshot:
    // Green for positive changes, red for negative, gray/white for neutral
    let color;
    if (change > 0) {
      color = "#2ecc71"; // Brighter green to match image
    } else if (change < 0) {
      color = "#e74c3c"; // Brighter red to match image
    } else {
      color = "#ffffff"; // White/gray for neutral
    }
    
    return `<span style="color: ${color}">${symbol} $${price} ${arrow}</span>`;
  });
  
  const tickerString = `${tickerElements.join(" &nbsp;&nbsp;&nbsp; ")} &nbsp;&nbsp;&nbsp; `;
  setTickerText(tickerString.repeat(2)); // Repeat for smooth looping
}, []);

  // Simulated login
  const handleLogin = () => {
    const sampleUserId = "user123"; // Example user ID
    localStorage.setItem("userId", sampleUserId);
    setUserId(sampleUserId);
    navigate("/dashboard"); // Redirect after login
  };

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
    navigate("/"); // Redirect after logout
  };

  const navItems = [
    { label: "Home", path: "/landing", active: true },
  ];

  // Handle time frame selection for each index
  const handleTimeFrameChange = (indexName, timeFrame) => {
    setSelectedTimeFrames((prev) => ({
      ...prev,
      [indexName]: timeFrame,
    }));
  };

  // Chart configuration for each index and time frame
  const getChartData = (index, timeFrame) => {
    const dataPoints = index.historicalData[timeFrame];
    const labels = dataPoints.map((point) =>
      timeFrame === "1D"
        ? point.time
        : timeFrame === "5D" || timeFrame === "1M"
        ? point.date
        : timeFrame === "1Y"
        ? point.month
        : point.year
    );
    const values = dataPoints.map((point) => point.value);

    return {
      labels,
      datasets: [
        {
          label: index.name,
          data: values,
          fill: true,
          backgroundColor: "rgba(34, 197, 94, 0.2)", // Green fill like NIFTY 50 chart
          borderColor: "rgba(34, 197, 94, 1)", // Green line
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 5,
        },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (value) => value.toLocaleString("en-IN"),
        },
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Inline CSS for the ticker and image */}
      <style>
        {`
          .image-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            margin-bottom: 20px;
            position: relative;
          }

          .building-image {
            width: 100%;
            height: auto;
            display: block;
          }

          .ticker-band {
            position: absolute;
            top: 50%; /* Align with the horizontal patch */
            width: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            padding: 10px 0;
            overflow: hidden;
          }

          .ticker {
            display: inline-block;
            white-space: nowrap;
            color: white;
            font-family: Arial, sans-serif;
            font-size: 20px;
            animation: scroll 15s linear infinite;
          }

          @keyframes scroll {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}
      </style>

      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg px-4 py-3 sticky top-0 z-20 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden btn btn-ghost p-2"
              onClick={() => setIsNavbarOpen(!isNavbarOpen)}
            >
              <FaBars className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <FaChartLine className="h-6 w-6" />
              InvestmentHub
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.path}
                className={`text-sm font-medium ${
                  item.active ? "underline" : "hover:text-indigo-200"
                } transition-colors`}
              >
                {item.label}
              </a>
            ))}

            {userId ? (
              <>
                <button
                  onClick={handleLogout}
                  className="btn bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="btn bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100"
                >
                  Login
                </button>
                <Link
                  to="/signup"
                  className="btn bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-800"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          {isNavbarOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-indigo-600 shadow-lg p-4 flex flex-col gap-4 z-10">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.path}
                  className={`text-sm font-medium ${
                    item.active ? "underline" : "hover:text-indigo-200"
                  }`}
                  onClick={() => setIsNavbarOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {userId ? (
                <>
                  <span className="text-sm font-medium text-white">
                    User ID: {userId}
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsNavbarOpen(false);
                    }}
                    className="btn bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsNavbarOpen(false);
                    }}
                    className="btn bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100"
                  >
                    Login
                  </button>
                  <Link
                    to="/signup"
                    className="btn bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-800"
                    onClick={() => setIsNavbarOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Stock Ticker and Hero Section with Background Image */}
<section className="w-full relative">
  {/* Image as background */}
  <div className="w-full relative" style={{ height: "600px" }}>
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `url(${myImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
    
    {/* Hero Text positioned in sky area */}
    <div className="hero-content">
    <h1 className="hero-title">
      Take Control of Your Investments
    </h1>
    <p className="hero-subtitle">
      Manage your portfolio, track performance, and explore opportunities with InvestmentHub
    </p>
    <div className="hero-buttons">
      <Link
        to="/signup"
        className="btn primary-btn"
      >
        Get Started <FaArrowRight />
      </Link>
      <Link
        to="/dashboard"
        className="btn secondary-btn"
      >
        View Demo
      </Link>
    </div>
  </div>
  
  {/* Ticker band positioned at the bottom of the building */}
  <div className="ticker-container">
    <div className="ticker-band">
      <div
        className="ticker"
        dangerouslySetInnerHTML={{ __html: tickerText }}
      />
    </div>
  </div>
  </div>
</section>

      {/* Market Indices Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Market Indices
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketIndices.map((index) => (
              <div
                key={index.name}
                className="bg-gradient-to-br from-gray-50 to-indigo-50 p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{index.name}</h3>
                  <span className="text-xs text-gray-500">{index.lastUpdated}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {index.value.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-sm font-medium ${
                      index.changePercent >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {index.changePercent >= 0 ? "+" : ""}
                    {index.changePercent}%{" "}
                    {index.changeValue.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {index.timeFrame}
                  </span>
                  <button className="text-blue-500 text-xs hover:underline">
                    Key Events
                  </button>
                </div>
                {/* Time Frame Tabs */}
                <div className="flex justify-around mb-4">
                  {["1D", "5D", "1M", "1Y", "5Y"].map((timeFrame) => (
                    <button
                      key={timeFrame}
                      onClick={() => handleTimeFrameChange(index.name, timeFrame)}
                      className={`text-xs font-medium px-2 py-1 rounded-md ${
                        selectedTimeFrames[index.name] === timeFrame
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } transition-colors duration-200`}
                    >
                      {timeFrame}
                    </button>
                  ))}
                </div>
                {/* Chart */}
                <div className="w-full h-40">
                  <Line
                    data={getChartData(index, selectedTimeFrames[index.name])}
                    options={chartOptions}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}