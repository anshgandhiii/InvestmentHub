import { useState, useEffect } from "react";
import { FaSearch, FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";
import stockData from "../stocks.json"; // Ensure this path is correct

export function TradePanel() {
  const [orderType, setOrderType] = useState("market");
  const [tradeAction, setTradeAction] = useState("buy");
  const [quantity, setQuantity] = useState("1");
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("");
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0);
  const [stocks] = useState(stockData.stocks); // No need to update stocks dynamically

  // Dynamic price updates
  useEffect(() => {
    const timestamps = Object.keys(stocks[0]["Time Series (5min)"]).sort().reverse();
    const interval = setInterval(() => {
      setCurrentTimestampIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % timestamps.length;
        const newPrices = {};
        stocks.forEach((stock) => {
          newPrices[stock["Meta Data"]["2. Symbol"]] = stock["Time Series (5min)"][timestamps[nextIndex]]["4. close"];
        });
        setCurrentPrices(newPrices);
        return nextIndex;
      });
    }, 10000); // 10 seconds for a calmer demo pace

    return () => clearInterval(interval);
  }, [stocks]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const currentPrice = currentPrices[symbol] || "N/A";
    alert(
      `Order Submitted: ${tradeAction.toUpperCase()} ${quantity} shares of ${symbol} at ${
        orderType === "market" ? `market price (₹${currentPrice})` : `₹${price}`
      }`
    );
  };

  // Get current price and trend
  const getStockInfo = () => {
    if (!symbol || !currentPrices[symbol]) return { price: "N/A", trend: null };
    const timestamps = Object.keys(stocks[0]["Time Series (5min)"]).sort().reverse();
    const stock = stocks.find((s) => s["Meta Data"]["2. Symbol"] === symbol);
    const currentPrice = parseFloat(currentPrices[symbol]);
    const prevPrice = parseFloat(
      stock["Time Series (5min)"][timestamps[currentTimestampIndex - 1] || timestamps[0]]["4. close"]
    );
    const trend = currentPrice > prevPrice ? "up" : currentPrice < prevPrice ? "down" : "neutral";
    return { price: currentPrice.toFixed(2), trend };
  };

  const { price: currentPrice, trend } = getStockInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 font-sans">
      {/* Header */}
      <header className="mb-8">
        <h2 className="text-4xl font-extrabold tracking-tight">Trade Securities</h2>
        <p className="text-gray-400 mt-2">Real-time trading with precision and style</p>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Stock Ticker Card */}
        <div className="bg-gray-800/80 backdrop-blur-md shadow-2xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h3 className="text-2xl font-semibold mb-6 text-gray-100">Market Watch</h3>
          <div className="space-y-6">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <select
                className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              >
                <option value="" className="bg-gray-800">Select Stock</option>
                {stocks.map((stock) => (
                  <option
                    key={stock["Meta Data"]["2. Symbol"]}
                    value={stock["Meta Data"]["2. Symbol"]}
                    className="bg-gray-800"
                  >
                    {stock["Meta Data"]["2. Symbol"]}
                  </option>
                ))}
              </select>
            </div>

            {symbol && (
              <div className="flex items-center justify-between animate-fade-in">
                <div>
                  <p className="text-xl font-medium text-gray-300">{symbol}</p>
                  <p className="text-3xl font-bold text-white">₹{currentPrice}</p>
                </div>
                <div className="flex items-center gap-2">
                  {trend === "up" && <FaArrowUp className="text-green-400 animate-bounce" />}
                  {trend === "down" && <FaArrowDown className="text-red-400 animate-bounce" />}
                  <span
                    className={`text-sm font-semibold ${
                      trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-gray-400"
                    }`}
                  >
                    {trend === "neutral" ? "Stable" : trend === "up" ? "+Trend" : "-Trend"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trade Form Card */}
        <div className="bg-gray-800/80 backdrop-blur-md shadow-2xl rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
          <h3 className="text-2xl font-semibold mb-6 text-gray-100">Place Your Order</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Trade Action</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    tradeAction === "buy"
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setTradeAction("buy")}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    tradeAction === "sell"
                      ? "bg-red-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setTradeAction("sell")}
                >
                  Sell
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Order Type</label>
              <select
                className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="market" className="bg-gray-800">Market</option>
                <option value="limit" className="bg-gray-800">Limit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {orderType === "limit" && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Limit Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                tradeAction === "buy"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed`}
              disabled={!symbol}
            >
              <FaWallet />
              {tradeAction === "buy" ? "Buy" : "Sell"} {quantity} Shares
            </button>
          </form>
        </div>
      </div>

      {/* Footer Timestamp */}
      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Market Data Time:{" "}
          {stocks.length > 0 &&
            Object.keys(stocks[0]["Time Series (5min)"]).sort().reverse()[currentTimestampIndex]}
        </p>
      </footer>
    </div>
  );
}