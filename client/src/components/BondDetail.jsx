import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaChartLine, FaWallet } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import bondsData from "../bonds.json"; // Import the generated bonds.json

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export function BondDetail() {
  const { bondId } = useParams(); // Get bondId from URL (e.g., "Apple Inc. 2027")
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const bonds = bondsData; // Use imported bonds.json directly

  // Debug: Log bondId and bonds content
  console.log("bondId from URL:", bondId);
  console.log("Available bond symbols:", bonds.map(b => b["Meta Data"]["2. Symbol"]));

  const bond = bonds.find((b) => b["Meta Data"]["2. Symbol"].trim() === bondId.trim()); // Match by Symbol with trim
  console.log("Matched bond:", bond);

  const userId = localStorage.getItem("user_id");

  // Dynamic price updates
  useEffect(() => {
    if (!bond) return;

    const timestamps = Object.keys(bond["Time Series (5min)"]).sort().reverse();
    const initialPrices = {};
    bonds.forEach((b) => {
      const bondTimestamps = Object.keys(b["Time Series (5min)"]).sort().reverse();
      initialPrices[b["Meta Data"]["2. Symbol"]] = b["Time Series (5min)"][bondTimestamps[0]]["4. price"];
    });
    setCurrentPrices(initialPrices);

    const interval = setInterval(() => {
      setCurrentTimestampIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % timestamps.length;
        const newPrices = {};
        bonds.forEach((b) => {
          const bondTimestamps = Object.keys(b["Time Series (5min)"]).sort().reverse();
          newPrices[b["Meta Data"]["2. Symbol"]] = b["Time Series (5min)"][bondTimestamps[nextIndex]]["4. price"];
        });
        setCurrentPrices(newPrices);
        return nextIndex;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [bonds, bond]);

  // Get bond information
  const getBondInfo = () => {
    if (!bond || !currentPrices[bondId]) {
      return {
        price: "N/A",
        trend: null,
        change: "0.00",
        yield: "N/A",
        high: "N/A",
        low: "N/A",
        volume: "N/A",
        percentChange: "0.00",
      };
    }
    const timestamps = Object.keys(bond["Time Series (5min)"]).sort().reverse();
    const currentPrice = parseFloat(currentPrices[bondId]);
    const prevPrice = parseFloat(
      bond["Time Series (5min)"][timestamps[currentTimestampIndex - 1] || timestamps[0]]["4. price"]
    );
    const trend = currentPrice > prevPrice ? "up" : currentPrice < prevPrice ? "down" : "neutral";
    const change = (currentPrice - prevPrice).toFixed(2);
    const currentData = bond["Time Series (5min)"][timestamps[currentTimestampIndex]];
    const yieldRate = currentData["1. yield"];
    const high = parseFloat(currentData["2. high"]).toFixed(2);
    const low = parseFloat(currentData["3. low"]).toFixed(2);
    const volume = parseInt(currentData["5. volume"], 10);
    const percentChange = prevPrice ? ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2) : "0.00";

    return { price: currentPrice.toFixed(2), trend, change, yield: yieldRate, high, low, volume, percentChange };
  };

  const bondInfo = getBondInfo();

  // Chart Data
  const timestamps = bond ? Object.keys(bond["Time Series (5min)"]).sort().reverse() : [];
  const chartData = {
    labels: timestamps.map((ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
    datasets: [
      {
        label: `${bondId} Price (₹)`,
        data: timestamps.map((ts) => parseFloat(bond["Time Series (5min)"][ts]["4. price"])),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#4f46e5",
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        title: { display: true, text: "Time", font: { size: 14, weight: "600" } },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        title: { display: true, text: "Price (₹)", font: { size: 14, weight: "600" } },
        beginAtZero: false,
      },
    },
    plugins: {
      legend: { position: "top", labels: { font: { size: 12, weight: "500" } } },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
  };

  // Buy/Sell handler with asset_type
  const handleBuySell = async (action) => {
    if (!userId) {
      setMessage("Please log in to perform this action.");
      return;
    }
    if (!bondInfo.price || bondInfo.price === "N/A") {
      setMessage("Cannot perform transaction: Current price is unavailable.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/investment/transactions/",
        {
          user_id: userId,
          asset_symbol: bondId,
          asset_type: "bond", // Added to identify this as a bond transaction
          price: parseFloat(bondInfo.price),
          quantity: quantity,
          transaction_type: action,
        },
        { headers: { "User-Id": userId, "Content-Type": "application/json" } }
      );

      const successMsg = action === "buy"
        ? `Successfully bought ${quantity} unit${quantity > 1 ? "s" : ""} of ${bondId} at ₹${bondInfo.price}`
        : `Successfully sold ${quantity} unit${quantity > 1 ? "s" : ""} of ${bondId} at ₹${bondInfo.price}. Profit/Loss: ₹${response.data.profit_loss || "N/A"}`;
      setMessage(successMsg);
    } catch (error) {
      console.error(`${action} error:`, error);
      const errorMsg = error.response?.data?.error || error.message;
      setMessage(`Failed to ${action} ${bondId}: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
      setQuantity(1);
    }
  };

  if (!bond) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Bond Not Found</h2>
          <p className="text-gray-600 mb-4">The bond "{bondId || "Unknown"}" does not exist in our records.</p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{bondId}</h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">Real-Time Bond Insights</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-md text-sm font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Price Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-center justify-between transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <FaChartLine className="text-indigo-600 text-xl" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">₹{bondInfo.price}</p>
              <p className="text-sm text-gray-500">Current Price</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <span
              className={`text-base font-semibold flex items-center gap-1 px-3 py-1 rounded-full ${
                bondInfo.trend === "up"
                  ? "bg-green-100 text-green-700"
                  : bondInfo.trend === "down"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {bondInfo.trend === "up" && <FaArrowUp />}
              {bondInfo.trend === "down" && <FaArrowDown />}
              {bondInfo.change !== "0.00" ? `${bondInfo.change > 0 ? "+" : ""}${bondInfo.change} (${bondInfo.percentChange}%)` : "Stable"}
            </span>
          </div>
        </div>

        {/* Details and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bond Information */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bond Details</h3>
            <dl className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Symbol</dt>
                <dd>{bond["Meta Data"]["2. Symbol"]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Type</dt>
                <dd>{bond["Meta Data"]["1. Information"]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Last Refreshed</dt>
                <dd>{new Date(bond["Meta Data"]["3. Last Refreshed"]).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Interval</dt>
                <dd>{bond["Meta Data"]["4. Interval"]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Time Zone</dt>
                <dd>{bond["Meta Data"]["5. Time Zone"]}</dd>
              </div>
            </dl>
          </div>

          {/* Latest Metrics */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Metrics</h3>
            <dl className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Yield</dt>
                <dd>{bondInfo.yield}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">High</dt>
                <dd>{bondInfo.high}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Low</dt>
                <dd>{bondInfo.low}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Volume</dt>
                <dd>{bondInfo.volume.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Timestamp</dt>
                <dd>{new Date(timestamps[currentTimestampIndex]).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          {/* Trade Section */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Trade {bondId}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 py-2 px-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleBuySell("buy")}
                  disabled={isSubmitting || bondInfo.price === "N/A"}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <>
                      <FaWallet /> Buy
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleBuySell("sell")}
                  disabled={isSubmitting || bondInfo.price === "N/A"}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <>
                      <FaWallet /> Sell
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Total:{" "}
                <span className="font-medium text-gray-800">
                  ₹{bondInfo.price === "N/A" ? "N/A" : (bondInfo.price * quantity).toFixed(2)}
                </span>
              </p>
              {message && (
                <p className={`text-sm ${message.includes("Failed") ? "text-red-600" : "text-green-600"} font-medium`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-indigo-600" /> Price Trend
          </h3>
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}