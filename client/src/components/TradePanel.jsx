import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArrowUp, FaArrowDown, FaInfoCircle } from "react-icons/fa";
import stockData from "../../public/stocks.json"; // Ensure path is correct

export function TradePanel() {
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0);
  const [stocks] = useState(stockData.stocks);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
    }, 10000);

    return () => clearInterval(interval);
  }, [stocks]);

  // Get detailed stock info
  const getStockInfo = (stock) => {
    const symbol = stock["Meta Data"]["2. Symbol"];
    if (!symbol || !currentPrices[symbol]) {
      return { price: "N/A", trend: null, change: "0.00", volume: "N/A", high: "N/A", low: "N/A", open: "N/A", percentChange: "0.00" };
    }
    const timestamps = Object.keys(stock["Time Series (5min)"]).sort().reverse();
    const currentPrice = parseFloat(currentPrices[symbol]);
    const prevPrice = parseFloat(
      stock["Time Series (5min)"][timestamps[currentTimestampIndex - 1] || timestamps[0]]["4. close"]
    );
    const trend = currentPrice > prevPrice ? "up" : currentPrice < prevPrice ? "down" : "neutral";
    const change = (currentPrice - prevPrice).toFixed(2);
    const currentData = stock["Time Series (5min)"][timestamps[currentTimestampIndex]];
    const volume = currentData["5. volume"];
    const high = parseFloat(currentData["2. high"]).toFixed(2);
    const low = parseFloat(currentData["3. low"]).toFixed(2);
    const open = parseFloat(currentData["1. open"]).toFixed(2);
    const percentChange = ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2);

    return { price: currentPrice.toFixed(2), trend, change, volume, high, low, open, percentChange };
  };

  // Filter stocks based on search query
  const filteredStocks = stocks.filter((stock) =>
    stock["Meta Data"]["2. Symbol"].toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle stock click
  const handleStockClick = (stockSymbol) => {
    navigate(`/stock/${stockSymbol}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6 font-sans">
      {/* Header */}
      <header className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Market Overview</h2>
        <p className="text-gray-600 mt-2 text-lg">Explore real-time stock data</p>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              Stock List <FaInfoCircle title="Real-time stock prices" />
            </h3>
            <div className="relative w-full max-w-sm">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stock Table */}
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Symbol</th>
                  <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Price (₹)</th>
                  <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Change</th>
                  <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Change (%)</th>
                  <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Open (₹)</th>
                  <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">High (₹)</th>
                  <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Low (₹)</th>
                  <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Volume</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map((stock, index) => {
                  const { price, trend, change, volume, high, low, open, percentChange } = getStockInfo(stock);
                  return (
                    <tr
                      key={stock["Meta Data"]["2. Symbol"]}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-indigo-100 cursor-pointer transition-all duration-200`}
                      onClick={() => handleStockClick(stock["Meta Data"]["2. Symbol"])}
                    >
                      <td className="py-4 px-6 font-medium text-gray-800">{stock["Meta Data"]["2. Symbol"]}</td>
                      <td className="py-4 px-6 font-semibold text-gray-900">₹{price}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          {trend === "up" && <FaArrowUp />}
                          {trend === "down" && <FaArrowDown />}
                          {change !== "0.00" ? `${change > 0 ? "+" : ""}${change}` : "Stable"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        <span
                          className={`${
                            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
                          }`}
                        >
                          {percentChange !== "0.00" ? `${percentChange > 0 ? "+" : ""}${percentChange}%` : "0.00%"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">₹{open}</td>
                      <td className="py-4 px-6 text-gray-700">₹{high}</td>
                      <td className="py-4 px-6 text-gray-700">₹{low}</td>
                      <td className="py-4 px-6 text-gray-700">{volume}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer Timestamp */}
      <footer className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Last Updated:{" "}
          {stocks.length > 0 &&
            Object.keys(stocks[0]["Time Series (5min)"]).sort().reverse()[currentTimestampIndex]}
        </p>
      </footer>
    </div>
  );
}