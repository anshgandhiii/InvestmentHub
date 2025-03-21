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
import insuranceData from "../insurance.json"; // Import the insurance.json

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export function VirtualInsuranceDetail() {
  const { insuranceId } = useParams(); // Get insuranceId from URL (e.g., "1")
  const [currentPrice, setCurrentPrice] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const insurances = insuranceData; // Use imported insurance.json directly
  const insurance = insurances.find((i) => i.id.toString() === insuranceId); // Match by id
  const userId = localStorage.getItem("user_id");

  // Debug: Log insuranceId and insurances content
  console.log("insuranceId from URL:", insuranceId);
  console.log("Available insurance IDs:", insurances.map(i => i.id));
  console.log("Matched insurance:", insurance);

  // Simulate price updates (mocked for insurance)
  useEffect(() => {
    if (!insurance) return;

    const basePrice = parseFloat(insurance.price);
    const mockPrices = Array.from({ length: 5 }, () => basePrice + (Math.random() * 10 - 5)); // ±5 variation
    setCurrentPrice(mockPrices[0]);

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % mockPrices.length;
        setCurrentPrice(mockPrices[nextIndex]);
        return nextIndex;
      });
    }, 10000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [insurance]);

  // Get insurance information
  const getInsuranceInfo = () => {
    if (!insurance || !currentPrice) {
      return { price: "N/A", trend: null, change: "0.00", percentChange: "0.00" };
    }
    const basePrice = parseFloat(insurance.price);
    const currentPriceValue = currentPrice;
    const prevPrice = currentIndex > 0 ? parseFloat(insurance.price) : currentPriceValue; // Simplified
    const trend = currentPriceValue > prevPrice ? "up" : currentPriceValue < prevPrice ? "down" : "neutral";
    const change = (currentPriceValue - prevPrice).toFixed(2);
    const percentChange = prevPrice ? ((currentPriceValue - prevPrice) / prevPrice * 100).toFixed(2) : "0.00";

    return { price: currentPriceValue.toFixed(2), trend, change, percentChange };
  };

  const insuranceInfo = getInsuranceInfo();

  // Mock chart data (since insurance doesn’t have time series)
  const timestamps = Array.from({ length: 5 }, (_, i) =>
    new Date(Date.now() - (4 - i) * 5 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const mockPrices = timestamps.map(() => parseFloat(insurance?.price || 0) + (Math.random() * 10 - 5));
  const chartData = {
    labels: timestamps,
    datasets: [
      {
        label: `${insurance?.id || "Insurance"} Premium (₹)`,
        data: mockPrices,
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
        title: { display: true, text: "Premium (₹)", font: { size: 14, weight: "600" } },
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

  // Purchase/Cancel handler
  const handlePurchaseCancel = async (action) => {
    if (!userId) {
      setMessage("Please log in to perform this action.");
      return;
    }
    if (!insuranceInfo.price || insuranceInfo.price === "N/A") {
      setMessage("Cannot perform transaction: Current premium is unavailable.");
      return;
    }
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/virtual/transactions/",
        {
          user_id: userId,
          virtual_asset_symbol: insurance.id,
          virtual_asset_type: "insurance", 
          virtual_price: parseFloat(insuranceInfo.price),
          virtual_quantity: quantity,
          virtual_transaction_type: action === "purchase" ? "buy" : "sell",
        },
        { headers: { "User-Id": userId, "Content-Type": "application/json" } }
      );

      const successMsg = action === "purchase"
        ? `Successfully purchased ${quantity} unit${quantity > 1 ? "s" : ""} of ${insurance.id} at ₹${insuranceInfo.price}`
        : `Successfully canceled ${quantity} unit${quantity > 1 ? "s" : ""} of ${insurance.id} at ₹${insuranceInfo.price}. Profit: ₹${response.data.profit_loss || "N/A"}`;
      setMessage(successMsg);
    } catch (error) {
      console.error(`${action} error:`, error);
      const errorMsg = error.response?.data?.error || error.message;
      setMessage(`Failed to ${action} ${insurance.id}: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
      setQuantity(1);
    }
  };

  if (!insurance) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Insurance Not Found</h2>
          <p className="text-gray-600 mb-4">The insurance with ID "{insuranceId || "Unknown"}" does not exist in our records.</p>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{insurance.id}</h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">Insurance Policy Details</p>
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
        {/* Premium Card */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-center justify-between transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <FaChartLine className="text-indigo-600 text-xl" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">₹{insuranceInfo.price}</p>
              <p className="text-sm text-gray-500">Current Premium ({insurance.premium_frequency})</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-4">
            <span
              className={`text-base font-semibold flex items-center gap-1 px-3 py-1 rounded-full ${
                insuranceInfo.trend === "up"
                  ? "bg-green-100 text-green-700"
                  : insuranceInfo.trend === "down"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {insuranceInfo.trend === "up" && <FaArrowUp />}
              {insuranceInfo.trend === "down" && <FaArrowDown />}
              {insuranceInfo.change !== "0.00" ? `${insuranceInfo.change > 0 ? "+" : ""}${insuranceInfo.change} (${insuranceInfo.percentChange}%)` : "Stable"}
            </span>
          </div>
        </div>

        {/* Details and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Insurance Information */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Policy Details</h3>
            <dl className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Name</dt>
                <dd>{insurance.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Type</dt>
                <dd>{insurance.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Category</dt>
                <dd>{insurance.category.charAt(0).toUpperCase() + insurance.category.slice(1)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Term</dt>
                <dd>{insurance.term_years} years</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Premium Frequency</dt>
                <dd>{insurance.premium_frequency.charAt(0).toUpperCase() + insurance.premium_frequency.slice(1)}</dd>
              </div>
            </dl>
          </div>

          {/* Coverage Metrics */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Coverage Details</h3>
            <dl className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Coverage Amount</dt>
                <dd>₹{parseFloat(insurance.coverage_amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Risk Level</dt>
                <dd>{insurance.risk_level.charAt(0).toUpperCase() + insurance.risk_level.slice(1)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-800">Base Premium</dt>
                <dd>₹{parseFloat(insurance.price).toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          {/* Trade Section */}
          <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Manage {insurance.id}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Units</label>
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
                  onClick={() => handlePurchaseCancel("purchase")}
                  disabled={isSubmitting || insuranceInfo.price === "N/A"}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <>
                      <FaWallet /> Purchase
                    </>
                  )}
                </button>
                <button
                  onClick={() => handlePurchaseCancel("cancel")}
                  disabled={isSubmitting || insuranceInfo.price === "N/A"}
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
                Total: <span className="font-medium text-gray-800">₹{insuranceInfo.price === "N/A" ? "N/A" : (insuranceInfo.price * quantity).toFixed(2)}</span>
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
            <FaChartLine className="text-indigo-600" /> Premium Trend (Simulated)
          </h3>
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}