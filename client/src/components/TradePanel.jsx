import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArrowUp, FaArrowDown, FaInfoCircle } from "react-icons/fa";

// Simulated data for Stocks, Bonds, and Insurances
import stockData from "../stocks.json"; // Ensure path is correct

// Placeholder Bonds data
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

// Updated Insurances data (static, no time series)
const insurancesData = {
  insurances: [
    {
      "Meta Data": {
        "1. Information": "Insurance Policy Data",
        "2. Symbol": "INS1",
        "3. Last Refreshed": "2025-03-15 16:00:00",
        "4. Time Zone": "US/Eastern",
      },
      "Policy Details": {
        "category": "Property",
        "price": "2496.17", // Premium price
        "risk_level": "Medium",
        "term": "29 years",
        "premium": "Annually",
        "coverage": "507217.44",
      },
    },
    {
      "Meta Data": {
        "1. Information": "Insurance Policy Data",
        "2. Symbol": "INS2",
        "3. Last Refreshed": "2025-03-15 16:00:00",
        "4. Time Zone": "US/Eastern",
      },
      "Policy Details": {
        "category": "Property",
        "price": "3000.00",
        "risk_level": "High",
        "term": "25 years",
        "premium": "Annually",
        "coverage": "600000.00",
      },
    },
  ],
};

export function TradePanel() {
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0);
  const [stocks] = useState(stockData.stocks);
  const [bonds] = useState(bondsData.bonds);
  const [insurances] = useState(insurancesData.insurances);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("stocks");
  const [filterCategory, setFilterCategory] = useState("");
  const navigate = useNavigate();

  // Dynamic price updates for Stocks and Bonds (excluding Insurances)
  useEffect(() => {
    const stockTimestamps = stocks[0] ? Object.keys(stocks[0]["Time Series (5min)"]).sort().reverse() : [];
    const bondTimestamps = bonds[0] ? Object.keys(bonds[0]["Time Series (5min)"]).sort().reverse() : [];

    const initialPrices = {};
    stocks.forEach((stock) => {
      if (stockTimestamps[0]) {
        initialPrices[stock["Meta Data"]["2. Symbol"]] = stock["Time Series (5min)"][stockTimestamps[0]]["4. close"];
      }
    });
    bonds.forEach((bond) => {
      if (bondTimestamps[0]) {
        initialPrices[bond["Meta Data"]["2. Symbol"]] = bond["Time Series (5min)"][bondTimestamps[0]]["4. price"];
      }
    });
    // Insurances are static, so just set their price once
    insurances.forEach((insurance) => {
      initialPrices[insurance["Meta Data"]["2. Symbol"]] = insurance["Policy Details"]["price"];
    });
    setCurrentPrices(initialPrices);

    const interval = setInterval(() => {
      setCurrentTimestampIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        const newPrices = {};

        // Update Stocks prices
        stocks.forEach((stock) => {
          const timestamps = Object.keys(stock["Time Series (5min)"]).sort().reverse();
          const timestamp = timestamps[nextIndex % timestamps.length] || timestamps[0];
          newPrices[stock["Meta Data"]["2. Symbol"]] = stock["Time Series (5min)"][timestamp]["4. close"];
        });

        // Update Bonds prices
        bonds.forEach((bond) => {
          const timestamps = Object.keys(bond["Time Series (5min)"]).sort().reverse();
          const timestamp = timestamps[nextIndex % timestamps.length] || timestamps[0];
          newPrices[bond["Meta Data"]["2. Symbol"]] = bond["Time Series (5min)"][timestamp]["4. price"];
        });

        // Insurances remain static, so copy their current price
        insurances.forEach((insurance) => {
          newPrices[insurance["Meta Data"]["2. Symbol"]] = insurance["Policy Details"]["price"];
        });

        setCurrentPrices(newPrices);
        return nextIndex;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [stocks, bonds, insurances]);

  // Get detailed info for each asset type
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
    const currentData = stock["Time Series (5min)"][timestamps[currentTimestampIndex] || timestamps[0]];
    const volume = currentData["5. volume"];
    const high = parseFloat(currentData["2. high"]).toFixed(2);
    const low = parseFloat(currentData["3. low"]).toFixed(2);
    const open = parseFloat(currentData["1. open"]).toFixed(2);
    const percentChange = prevPrice ? ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2) : "0.00";

    return { price: currentPrice.toFixed(2), trend, change, volume, high, low, open, percentChange };
  };

  const getBondInfo = (bond) => {
    const symbol = bond["Meta Data"]["2. Symbol"];
    if (!symbol || !currentPrices[symbol]) {
      return { price: "N/A", trend: null, change: "0.00", yield: "N/A", high: "N/A", low: "N/A", percentChange: "0.00" };
    }
    const timestamps = Object.keys(bond["Time Series (5min)"]).sort().reverse();
    const currentPrice = parseFloat(currentPrices[symbol]);
    const prevPrice = parseFloat(
      bond["Time Series (5min)"][timestamps[currentTimestampIndex - 1] || timestamps[0]]["4. price"]
    );
    const trend = currentPrice > prevPrice ? "up" : currentPrice < prevPrice ? "down" : "neutral";
    const change = (currentPrice - prevPrice).toFixed(2);
    const currentData = bond["Time Series (5min)"][timestamps[currentTimestampIndex] || timestamps[0]];
    const yieldRate = currentData["1. yield"];
    const high = parseFloat(currentData["2. high"]).toFixed(2);
    const low = parseFloat(currentData["3. low"]).toFixed(2);
    const percentChange = prevPrice ? ((currentPrice - prevPrice) / prevPrice * 100).toFixed(2) : "0.00";

    return { price: currentPrice.toFixed(2), trend, change, yield: yieldRate, high, low, percentChange };
  };

  const getInsuranceInfo = (insurance) => {
    const symbol = insurance["Meta Data"]["2. Symbol"];
    if (!symbol || !currentPrices[symbol]) {
      return {
        price: "N/A",
        riskLevel: "N/A",
        term: "N/A",
        premium: "N/A",
        coverage: "N/A",
      };
    }
    const price = parseFloat(currentPrices[symbol]).toFixed(2);
    const policyDetails = insurance["Policy Details"];
    const riskLevel = policyDetails["risk_level"];
    const term = policyDetails["term"];
    const premium = policyDetails["premium"];
    const coverage = parseFloat(policyDetails["coverage"]).toFixed(2);

    return { price, riskLevel, term, premium, coverage };
  };

  // Filter assets based on search query and category for insurances
  const filteredStocks = stocks.filter((stock) =>
    stock["Meta Data"]["2. Symbol"].toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredBonds = bonds.filter((bond) =>
    bond["Meta Data"]["2. Symbol"].toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredInsurances = insurances.filter((insurance) => {
    const matchesSearch = insurance["Meta Data"]["2. Symbol"].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || insurance["Policy Details"]["category"].toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Handle asset click
  const handleStockClick = (stockSymbol) => {
    navigate(`/stock/${stockSymbol}`);
  };
  const handleBondClick = (bondSymbol) => {
    navigate(`/bond/${bondSymbol}`);
  };
  const handleInsuranceClick = (insuranceSymbol) => {
    navigate(`/insurance/${insuranceSymbol}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6 font-sans">
      {/* Header */}
      <header className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Market Overview</h2>
        <p className="text-gray-600 mt-2 text-lg">Explore real-time financial data</p>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                {activeTab === "stocks" ? "Stock List" : activeTab === "bonds" ? "Bond List" : "Insurance List"}
                <FaInfoCircle title="Real-time financial data" />
              </h3>
              <div className="relative w-full max-w-sm">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-white/20">
              <button
                className={`py-2 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === "stocks"
                    ? "border-b-2 border-white text-white"
                    : "text-gray-200 hover:text-white"
                }`}
                onClick={() => setActiveTab("stocks")}
              >
                Stocks
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === "bonds"
                    ? "border-b-2 border-white text-white"
                    : "text-gray-200 hover:text-white"
                }`}
                onClick={() => setActiveTab("bonds")}
              >
                Bonds
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === "insurances"
                    ? "border-b-2 border-white text-white"
                    : "text-gray-200 hover:text-white"
                }`}
                onClick={() => setActiveTab("insurances")}
              >
                Insurances
              </button>
            </div>

            {/* Insurance Category Filter (visible only for Insurances tab) */}
            {activeTab === "insurances" && (
              <div className="mt-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full max-w-xs p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  <option value="Property">Property</option>
                  {/* Add more categories as needed */}
                </select>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
          {activeTab === "stocks" && (
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
            )}

            {activeTab === "bonds" && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Symbol</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Price (₹)</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Change</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Change (%)</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Yield (%)</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">High (%)</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Low (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBonds.map((bond, index) => {
                    const { price, trend, change, yield: yieldRate, high, low, percentChange } = getBondInfo(bond);
                    return (
                      <tr
                        key={bond["Meta Data"]["2. Symbol"]}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-indigo-100 cursor-pointer transition-all duration-200`}
                        onClick={() => handleBondClick(bond["Meta Data"]["2. Symbol"])}
                      >
                        <td className="py-4 px-6 font-medium text-gray-800">{bond["Meta Data"]["2. Symbol"]}</td>
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
                        <td className="py-4 px-6 text-gray-700">{yieldRate}%</td>
                        <td className="py-4 px-6 text-gray-700">{high}%</td>
                        <td className="py-4 px-6 text-gray-700">{low}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === "insurances" && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Symbol</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Price (₹)</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Risk Level</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Term</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Premium</th>
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Coverage (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInsurances.map((insurance, index) => {
                    const { price, riskLevel, term, premium, coverage } = getInsuranceInfo(insurance);
                    return (
                      <tr
                        key={insurance["Meta Data"]["2. Symbol"]}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-indigo-100 cursor-pointer transition-all duration-200`}
                        onClick={() => handleInsuranceClick(insurance["Meta Data"]["2. Symbol"])}
                      >
                        <td className="py-4 px-6 font-medium text-gray-800">{insurance["Meta Data"]["2. Symbol"]}</td>
                        <td className="py-4 px-6 font-semibold text-gray-900">₹{price}</td>
                        <td className="py-4 px-6 text-gray-700">{riskLevel}</td>
                        <td className="py-4 px-6 text-gray-700">{term}</td>
                        <td className="py-4 px-6 text-gray-700">{premium}</td>
                        <td className="py-4 px-6 text-gray-700">₹{coverage}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
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