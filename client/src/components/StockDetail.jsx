import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa";
import stockData from "../stocks.json"

export function StockDetail() {
  const { symbol } = useParams(); // Get stock symbol from URL
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0);
  const stocks = stockData.stocks;
  const stock = stocks.find((s) => s["Meta Data"]["2. Symbol"] === symbol);

  useEffect(() => {
    const timestamps = Object.keys(stock["Time Series (5min)"]).sort().reverse();
    const interval = setInterval(() => {
      setCurrentTimestampIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % timestamps.length;
        const newPrices = {};
        stocks.forEach((s) => {
          newPrices[s["Meta Data"]["2. Symbol"]] = s["Time Series (5min)"][timestamps[nextIndex]]["4. close"];
        });
        setCurrentPrices(newPrices);
        return nextIndex;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [stocks]);

  const getStockInfo = () => {
    if (!currentPrices[symbol]) return { price: "N/A", trend: null, change: "0.00" };
    const timestamps = Object.keys(stock["Time Series (5min)"]).sort().reverse();
    const currentPrice = parseFloat(currentPrices[symbol]);
    const prevPrice = parseFloat(
      stock["Time Series (5min)"][timestamps[currentTimestampIndex - 1] || timestamps[0]]["4. close"]
    );
    const trend = currentPrice > prevPrice ? "up" : currentPrice < prevPrice ? "down" : "neutral";
    const change = (currentPrice - prevPrice).toFixed(2);
    return { price: currentPrice.toFixed(2), trend, change };
  };

  const { price, trend, change } = getStockInfo();

  if (!stock) {
    return <div className="min-h-screen bg-gray-100 p-6 text-center text-gray-800">Stock not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6 font-sans">
      <header className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">{symbol}</h2>
        <p className="text-gray-600 mt-2 text-lg">Stock Details</p>
      </header>

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{price}</p>
            <p className="text-sm text-gray-600">Current Price</p>
          </div>
          <div className="flex items-center gap-2">
            {trend === "up" && <FaArrowUp className="text-green-600" />}
            {trend === "down" && <FaArrowDown className="text-red-600" />}
            <span
              className={`text-sm font-medium ${
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
              }`}
            >
              {change !== "0.00" ? `${change > 0 ? "+" : ""}${change}` : "Stable"}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-center">
          <FaChartLine className="h-16 w-16 text-indigo-300" />
          <p className="ml-4 text-gray-600">Chart placeholder - Add your chart library here (e.g., Chart.js)</p>
        </div>

        <Link
          to="/dashboard"
          className="mt-6 inline-block bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-200"
        >
          Back to Trade Panel
        </Link>
      </div>
    </div>
  );
}