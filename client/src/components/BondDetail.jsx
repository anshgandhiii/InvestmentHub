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

// Simulated bonds data (from TradePanel)
const bondsData = {
  bonds: [
    {
      "Meta Data": {
        "1. Information": "Bond Data",
        "2. Symbol": "BOND1",
        "3. Last Refreshed": "2025-03-15 16:00:00",
        "4. Interval": "5min",
        "5. Time Zone": "US/Eastern",
      },
      "Time Series (5min)": {
        "2025-03-15 16:00:00": { "1. yield": "3.50", "2. high": "3.55", "3. low": "3.45", "4. price": "100.50", "5. volume": "5000" },
        "2025-03-15 15:55:00": { "1. yield": "3.48", "2. high": "3.50", "3. low": "3.40", "4. price": "100.30", "5. volume": "4800" },
      },
    },
    {
      "Meta Data": {
        "1. Information": "Bond Data",
        "2. Symbol": "BOND2",
        "3. Last Refreshed": "2025-03-15 16:00:00",
        "4. Interval": "5min",
        "5. Time Zone": "US/Eastern",
      },
      "Time Series (5min)": {
        "2025-03-15 16:00:00": { "1. yield": "4.20", "2. high": "4.25", "3. low": "4.15", "4. price": "99.80", "5. volume": "7000" },
        "2025-03-15 15:55:00": { "1. yield": "4.18", "2. high": "4.20", "3. low": "4.10", "4. price": "99.60", "5. volume": "6800" },
      },
    },
  ],
};

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export function BondDetail() {
  const { bondId } = useParams(); // Using bondId from the URL parameter
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const bonds = bondsData.bonds; // Use the simulated bondsData directly
  const bond = bonds.find((b) => b["Meta Data"]["2. Symbol"] === bondId); // Match by Symbol
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!bond) return;

    const timestamps = Object.keys(bond["Time Series (5min)"]).sort().reverse();
    const initialPrices = {};
    bonds.forEach((b) => {
      initialPrices[b["Meta Data"]["2. Symbol"]] = b["Time Series (5min)"][timestamps[0]]["4. price"];
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
    }, 2000); // Update every 2 seconds to match TradePanel's interval

    return () => clearInterval(interval);
  }, [bonds, bond]);

  const getBondInfo = () => {
    if (!currentPrices[bondId]) return { price: "N/A", trend: null, change: "0.00", yield: "N/A", high: "N/A", low: "N/A", volume: "N/A", percentChange: "0.00" };
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
    const volume = currentData["5. volume"];
    const percentChange = prevPrice ? ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2) : "0.00";

    return { price: currentPrice.toFixed(2), trend, change, yield: yieldRate, high, low, volume, percentChange };
  };

  const bondInfo = getBondInfo();

  // Chart Data
  const timestamps = bond ? Object.keys(bond["Time Series (5min)"]).sort().reverse() : [];
  const chartData = {
    labels: timestamps.slice(0, 20).map((ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })),
    datasets: [
      {
        label: `${bondId} Price (₹)`,
        data: timestamps.slice(0, 20).map((ts) => parseFloat(bond["Time Series (5min)"][ts]["4. price"])),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#4f46e5",
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, title: { display: true, text: "Time", font: { size: 14, weight: "bold" } } },
      y: { grid: { color: "rgba(0, 0, 0, 0.05)" }, title: { display: true, text: "Price (₹)", font: { size: 14, weight: "bold" } } },
    },
    plugins: {
      legend: { display: true, position: "top", labels: { font: { size: 12 } } },
      tooltip: { mode: "index", intersect: false, backgroundColor: "rgba(0, 0, 0, 0.8)" },
    },
  };

  const handleBuySell = async (action) => {
    if (!userId) {
      setMessage("Please log in to perform this action.");
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
          price: bondInfo.price, // Send current price
          quantity: quantity,
          transaction_type: action,
        },
        { headers: { "User-Id": userId, "Content-Type": "application/json" } }
      );

      const successMsg = action === "buy"
        ? `Successfully bought ${quantity} units of ${bondId} at ₹${bondInfo.price}`
        : `Successfully sold ${quantity} units of ${bondId} at ₹${bondInfo.price}. Profit/Loss: ₹${response.data.profit_loss}`;
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center text-gray-800">Bond not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      {/* Header */}
      <header className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{bondId}</h2>
        <p className="text-gray-500 mt-1 text-lg">Bond Market Insights</p>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Price Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition-all duration-300">
          <div>
            <p className="text-3xl font-bold text-gray-900">₹{bondInfo.price}</p>
            <p className="text-sm text-gray-500">Current Price</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-lg font-semibold flex items-center gap-1 px-3 py-1 rounded-full ${
                bondInfo.trend === "up" ? "bg-green-100 text-green-700" : bondInfo.trend === "down" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
              }`}
            >
              {bondInfo.trend === "up" && <FaArrowUp />}
              {bondInfo.trend === "down" && <FaArrowDown />}
              {bondInfo.change !== "0.00" ? `${bondInfo.change > 0 ? "+" : ""}${bondInfo.change}` : "Stable"}
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Bond Information</h3>
            <ul className="text-gray-600 space-y-3">
              <li><span className="font-medium text-gray-800">Symbol:</span> {bond["Meta Data"]["2. Symbol"]}</li>
              <li><span className="font-medium text-gray-800">Information:</span> {bond["Meta Data"]["1. Information"]}</li>
              <li><span className="font-medium text-gray-800">Last Refreshed:</span> {bond["Meta Data"]["3. Last Refreshed"]}</li>
              <li><span className="font-medium text-gray-800">Interval:</span> {bond["Meta Data"]["4. Interval"]}</li>
              <li><span className="font-medium text-gray-800">Time Zone:</span> {bond["Meta Data"]["5. Time Zone"]}</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Latest Metrics</h3>
            <ul className="text-gray-600 space-y-3">
              <li><span className="font-medium text-gray-800">Yield:</span> {bondInfo.yield}%</li>
              <li><span className="font-medium text-gray-800">High:</span> {bondInfo.high}%</li>
              <li><span className="font-medium text-gray-800">Low:</span> {bondInfo.low}%</li>
              <li><span className="font-medium text-gray-800">Volume:</span> {bondInfo.volume.toLocaleString()}</li>
              <li><span className="font-medium text-gray-800">Timestamp:</span> {new Date(timestamps[currentTimestampIndex]).toLocaleString()}</li>
            </ul>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine className="text-indigo-600" /> Price Trend
          </h3>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Trade Section */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Trade {bondId}</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-32">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Qty"
              />
            </div>
            <button
              onClick={() => handleBuySell("buy")}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex-1 py-2.5 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
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
              disabled={isSubmitting}
              className="w-full sm:w-auto flex-1 py-2.5 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
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
          <p className="mt-3 text-sm text-gray-500">
            Total Cost/Value: <span className="font-medium text-gray-800">₹{(bondInfo.price * quantity).toFixed(2)}</span>
          </p>
          {message && (
            <p className={`mt-3 text-sm ${message.includes("Failed") ? "text-red-600" : "text-green-600"} font-medium`}>
              {message}
            </p>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-block py-2.5 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}