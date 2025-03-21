import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaArrowUp, FaArrowDown, FaInfoCircle, FaTrash, FaCode, FaExclamationTriangle } from "react-icons/fa";
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
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import Draggable from 'react-draggable';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Simulated data for Stocks, Bonds, and Insurances
import stockData from "../stocks.json"; // Ensure path is correct
import bondsData from "../bonds.json";
import insurancesData from "../insurance.json";

// Valid stock symbols
const VALID_STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JNJ', 'V', 'WMT'];

export function TradePanel() {
  const [currentPrices, setCurrentPrices] = useState({});
  const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0);
  const [stocks] = useState(stockData.stocks);
  const [bonds] = useState(bondsData); // Use the imported JSON data
  const [insurances] = useState(insurancesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("stocks");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [timeFilter, setTimeFilter] = useState("daily");
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [profit, setProfit] = useState(null);
  const [code, setCode] = useState("");
  const [parsedRules, setParsedRules] = useState([]);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [syntaxError, setSyntaxError] = useState("");
  const [ruleProfit, setRuleProfit] = useState(null);
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);
  const navigate = useNavigate();

  // Dynamic price updates for Stocks and Bonds (excluding Insurances)
  useEffect(() => {
    const stockTimestamps = stocks[0] ? Object.keys(stocks[0]["Time Series (60min)"]).sort().reverse() : [];
    const bondTimestamps = bonds[0] ? Object.keys(bonds[0]["Time Series (5min)"]).sort().reverse() : [];

    const initialPrices = {};
    stocks.forEach((stock) => {
      if (stockTimestamps[0]) {
        initialPrices[stock["Meta Data"]["2. Symbol"]] = stock["Time Series (60min)"][stockTimestamps[0]]["4. close"];
      }
    });
    bonds.forEach((bond) => {
      if (bondTimestamps[0]) {
        initialPrices[bond["Meta Data"]["2. Symbol"]] = bond["Time Series (5min)"][bondTimestamps[0]]["4. price"];
      }
    });
    // Set initial prices for insurances
    insurances.forEach((insurance) => {
      initialPrices[insurance.id] = insurance.price;
    });
    setCurrentPrices(initialPrices);

    const interval = setInterval(() => {
      setCurrentTimestampIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        const newPrices = {};

        // Update Stocks prices
        stocks.forEach((stock) => {
          const timestamps = Object.keys(stock["Time Series (60min)"]).sort().reverse();
          const timestamp = timestamps[nextIndex % timestamps.length] || timestamps[0];
          newPrices[stock["Meta Data"]["2. Symbol"]] = stock["Time Series (60min)"][timestamp]["4. close"];
        });

        // Update Bonds prices
        bonds.forEach((bond) => {
          const timestamps = Object.keys(bond["Time Series (5min)"]).sort().reverse();
          const timestamp = timestamps[nextIndex % timestamps.length] || timestamps[0];
          newPrices[bond["Meta Data"]["2. Symbol"]] = bond["Time Series (5min)"][timestamp]["4. price"];
        });

        // Insurances remain static
        insurances.forEach((insurance) => {
          newPrices[insurance.id] = insurance.price;
        });

        setCurrentPrices(newPrices);
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [stocks, bonds, insurances]);

  // Get detailed info for each asset type
  const getStockInfo = (stock) => {
    const symbol = stock["Meta Data"]["2. Symbol"];
    if (!symbol || !currentPrices[symbol]) {
      return { price: "N/A", trend: null, change: "0.00", volume: "N/A", high: "N/A", low: "N/A", open: "N/A", percentChange: "0.00" };
    }
    const timestamps = Object.keys(stock["Time Series (60min)"]).sort(); // Sort timestamps in chronological order
    const currentPrice = parseFloat(currentPrices[symbol]);
    const prevPrice = parseFloat(
      stock["Time Series (60min)"][timestamps[currentTimestampIndex - 1] || timestamps[0]]["4. close"]
    );
    const trend = currentPrice > prevPrice ? "up" : currentPrice < prevPrice ? "down" : "neutral";
    const change = (currentPrice - prevPrice).toFixed(2);
    const currentData = stock["Time Series (60min)"][timestamps[currentTimestampIndex] || timestamps[0]];
    const volume = currentData["5. volume"];
    const high = parseFloat(currentData["2. high"]).toFixed(2);
    const low = parseFloat(currentData["3. low"]).toFixed(2);
    const open = parseFloat(currentData["1. open"]).toFixed(2);
    const percentChange = prevPrice ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2) : "0.00";

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
    const percentChange = prevPrice ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2) : "0.00";

    return { price: currentPrice.toFixed(2), trend, change, yield: yieldRate, high, low, percentChange };
  };

  const getInsuranceInfo = (insurance) => {
    const symbol = insurance.id;
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
    const riskLevel = insurance.risk_level;
    const term = `${insurance.term_years} years`;
    const premium = insurance.premium_frequency;
    const coverage = parseFloat(insurance.coverage_amount).toFixed(2);

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
    const matchesSearch = insurance.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || insurance.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Handle asset click
  const handleStockClick = (stockSymbol) => {
    navigate(`/virtualstock/${stockSymbol}`);
  };
  const handleBondClick = (bondSymbol) => {
    navigate(`/virtualbond/${bondSymbol}`);
  };
  const handleInsuranceClick = (insuranceName) => {
    navigate(`/virtualinsurance/${insuranceName}`);
  };

  // Handle checkbox selection
  const handleStockSelect = (e, stock) => {
    e.stopPropagation();
    const symbol = stock["Meta Data"]["2. Symbol"];
    
    if (selectedStocks.includes(symbol)) {
      setSelectedStocks(selectedStocks.filter(s => s !== symbol));
    } else {
      setSelectedStocks([...selectedStocks, symbol]);
    }
  };

  // Generate chart data based on selected stocks
  const getChartData = () => {
    if (selectedStocks.length === 0) return null;

    const datasets = [];
    
    // Generate random colors for each stock
    const colors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(199, 199, 199, 1)',
      'rgba(83, 102, 255, 1)',
      'rgba(40, 159, 64, 1)',
      'rgba(210, 199, 199, 1)',
    ];

    // Get timestamps based on time filter
    let timeSeriesKey = "Time Series (60min)";
    switch(timeFilter) {
      case "yearly":
        // For demo, we'll still use the available data
        timeSeriesKey = "Time Series (60min)";
        break;
      case "monthly":
        timeSeriesKey = "Time Series (60min)";
        break;
      case "weekly":
        timeSeriesKey = "Time Series (60min)";
        break;
      default:
        timeSeriesKey = "Time Series (60min)";
    }

    selectedStocks.forEach((symbol, index) => {
      const stock = stocks.find(s => s["Meta Data"]["2. Symbol"] === symbol);
      if (!stock) return;

      const timestamps = Object.keys(stock[timeSeriesKey]).sort();
      
      const data = timestamps.map(timestamp => {
        return {
          x: new Date(timestamp).getTime(),
          y: parseFloat(stock[timeSeriesKey][timestamp]["4. close"])
        };
      });

      datasets.push({
        label: symbol,
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
      });
    });

    return {
      datasets
    };
  };

  // Calculate profit between markers
  const calculateProfit = () => {
    if (!startMarker || !endMarker || selectedStocks.length === 0) return;
    
    const stock = stocks.find(s => s["Meta Data"]["2. Symbol"] === selectedStocks[0]);
    if (!stock) return;
    
    const timestamps = Object.keys(stock["Time Series (60min)"]).sort();
    
    // Find closest timestamps to marker positions
    const startTimestamp = timestamps[startMarker.index];
    const endTimestamp = timestamps[endMarker.index];
    
    if (!startTimestamp || !endTimestamp) return;
    
    const startPrice = parseFloat(stock["Time Series (60min)"][startTimestamp]["4. close"]);
    const endPrice = parseFloat(stock["Time Series (60min)"][endTimestamp]["4. close"]);
    
    const profitValue = (endPrice - startPrice).toFixed(2);
    const profitPercent = ((endPrice - startPrice) / startPrice * 100).toFixed(2);
    
    setProfit({ value: profitValue, percent: profitPercent });
  };

  // Calculate profit based on trading rules
  const calculateRuleProfit = () => {
    if (!startMarker || !endMarker || selectedStocks.length === 0 || parsedRules.length === 0) return;
    
    let totalProfit = 0;
    const transactions = [];
    
    // Process each selected stock
    for (const symbol of selectedStocks) {
      const stock = stocks.find(s => s["Meta Data"]["2. Symbol"] === symbol);
      if (!stock) continue;
      
      const timestamps = Object.keys(stock["Time Series (60min)"]).sort();
      
      // Get data points between markers
      const startIdx = startMarker.index;
      const endIdx = endMarker.index;
      
      if (startIdx >= endIdx) continue;
      
      // Get rules for this stock
      const stockRules = parsedRules.filter(rule => rule.stock === symbol);
      if (stockRules.length === 0) continue;
      
      let position = 0; // 0 = no position, 1 = long position
      let entryPrice = 0;
      
      // Iterate through time points between markers
      for (let i = startIdx; i <= endIdx; i++) {
        const timestamp = timestamps[i];
        const price = parseFloat(stock["Time Series (60min)"][timestamp]["4. close"]);
        
        // Apply rules
        for (const rule of stockRules) {
          const lower = rule.lower === "NULL" ? null : parseFloat(rule.lower);
          const upper = rule.upper === "NULL" ? null : parseFloat(rule.upper);
          
          // Buy rule
          if (rule.task === "buy" && position === 0) {
            if ((lower !== null && price <= lower) || (lower === null && upper !== null)) {
              position = 1;
              entryPrice = price;
              transactions.push({
                type: "BUY",
                stock: symbol,
                price: price,
                timestamp: timestamp
              });
              break;
            }
          }
          // Sell rule
          else if (rule.task === "sell" && position === 1) {
            if ((upper !== null && price >= upper) || (upper === null && lower !== null)) {
              const profit = price - entryPrice;
              totalProfit += profit;
              position = 0;
              transactions.push({
                type: "SELL",
                stock: symbol,
                price: price,
                profit: profit.toFixed(2),
                timestamp: timestamp
              });
              break;
            }
          }
        }
      }
      
      // Close any open position at the end
      if (position === 1) {
        const lastTimestamp = timestamps[endIdx];
        const lastPrice = parseFloat(stock["Time Series (60min)"][lastTimestamp]["4. close"]);
        const profit = lastPrice - entryPrice;
        totalProfit += profit;
        transactions.push({
          type: "SELL (Close)",
          stock: symbol,
          price: lastPrice,
          profit: profit.toFixed(2),
          timestamp: lastTimestamp
        });
      }
    }
    
    setRuleProfit({
      total: totalProfit.toFixed(2),
      transactions: transactions
    });
  };

  // Update profit calculation when markers change
  useEffect(() => {
    if (startMarker && endMarker) {
      calculateProfit();
      if (parsedRules.length > 0) {
        calculateRuleProfit();
      }
    }
  }, [startMarker, endMarker, selectedStocks, parsedRules]);

  // Parse code to trading rules
  const parseCodeToArray = (input) => {
    const lines = input.trim().split("\n");
    const result = [];
    let hasError = false;
    let errorMessage = "";
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(/\s+/);
      if (parts.length === 5 && parts[0].toUpperCase() === "IF") {
        const taskPart = parts[3].toUpperCase();
        const task = taskPart === "BUY" ? "buy" : taskPart === "SELL" ? "sell" : null;
        
        if (!task) {
          hasError = true;
          errorMessage = `Line ${i+1}: Invalid task "${parts[3]}". Use BUY or SELL.`;
          break;
        }
        
        const stockSymbol = parts[4].toUpperCase();
        if (!VALID_STOCK_SYMBOLS.includes(stockSymbol)) {
          hasError = true;
          errorMessage = `Line ${i+1}: Stock "${stockSymbol}" not listed. Valid stocks: ${VALID_STOCK_SYMBOLS.join(', ')}`;
          break;
        }
        
        result.push({
          task: task,
          lower: parts[1],
          upper: parts[2],
          stock: stockSymbol,
        });
      } else {
        hasError = true;
        errorMessage = `Line ${i+1}: Invalid syntax. Use format: IF [lower] [upper] [BUY/SELL] [stock]`;
        break;
      }
    }
    
    if (hasError) {
      setSyntaxError(errorMessage);
      return null;
    }
    
    setSyntaxError("");
    return result;
  };

  // Handle code change
  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setSyntaxError("");
  };

  // Apply trading rule
  const handleApplyRule = () => {
    const newRules = parseCodeToArray(code);
    if (newRules) {
      setParsedRules([...parsedRules, ...newRules]);
      setCode("");
      
      // Recalculate profit if markers are set
      if (startMarker && endMarker) {
        calculateRuleProfit();
      }
    }
  };

  // Delete rule
  const handleDeleteRule = (index) => {
    const updatedRules = [...parsedRules];
    updatedRules.splice(index, 1);
    setParsedRules(updatedRules);
    
    // Recalculate profit if markers are set
    if (startMarker && endMarker) {
      setTimeout(() => calculateRuleProfit(), 0);
    }
  };

  // Handle marker drag
  const handleMarkerDrag = (marker, data) => {
    if (!chartRef.current) return;
    
    const chart = chartRef.current;
    const chartArea = chart.chartArea;
    
    // Calculate x position relative to chart area
    const relativeX = data.x - chartArea.left;
    
    // Convert x position to data index
    const xScale = chart.scales.x;
    const index = Math.round(xScale.getValueForPixel(relativeX + chartArea.left));
    
    // Update marker position
    if (marker === 'start') {
      setStartMarker({ x: relativeX, index: index });
    } else {
      setEndMarker({ x: relativeX, index: index });
    }
  };

  // Initialize markers when chart is ready
  const handleChartReady = () => {
    if (!chartRef.current || selectedStocks.length === 0) return;
    
    const chart = chartRef.current;
    const chartArea = chart.chartArea;
    
    // Set initial marker positions if not set
    if (!startMarker) {
      const startX = chartArea.left + 50;
      const startIndex = Math.round(chart.scales.x.getValueForPixel(startX));
      setStartMarker({ x: 50, index: startIndex });
    }
    
    if (!endMarker) {
      const endX = chartArea.right - 50;
      const endIndex = Math.round(chart.scales.x.getValueForPixel(endX));
      setEndMarker({ x: chartArea.width - 50, index: endIndex });
    }
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
              <div className="flex items-center gap-4">
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
                <button
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
                >
                  <FaCode />
                  <span>Code Editor</span>
                </button>
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
  
            {/* Insurance Category Filter */}
            {activeTab === "insurances" && (
              <div className="mt-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full max-w-xs p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  <option value="health">Health</option>
                  <option value="life">Life</option>
                </select>
              </div>
            )}
          </div>
  
          {/* Chart Section */}
          {selectedStocks.length > 0 && (
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Stock Performance</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimeFilter("daily")}
                    className={`px-3 py-1 text-sm rounded-md ${timeFilter === "daily" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setTimeFilter("weekly")}
                    className={`px-3 py-1 text-sm rounded-md ${timeFilter === "weekly" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTimeFilter("monthly")}
                    className={`px-3 py-1 text-sm rounded-md ${timeFilter === "monthly" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setTimeFilter("yearly")}
                    className={`px-3 py-1 text-sm rounded-md ${timeFilter === "yearly" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"}`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
  
              <div className="relative h-80" ref={chartContainerRef}>
                {getChartData() && (
                  <Line
                    ref={chartRef}
                    data={getChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        duration: 0 // Disable animations for better marker performance
                      },
                      interaction: {
                        mode: "index",
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          position: "top",
                        },
                        tooltip: {
                          enabled: true,
                        },
                      },
                      scales: {
                        x: {
                          type: "time",
                          time: {
                            unit: "day",
                            displayFormats: {
                              day: "MMM d",
                            },
                          },
                          adapters: {
                            date: {
                              locale: enUS,
                            },
                          },
                        },
                        y: {
                          beginAtZero: false,
                        },
                      },
                      onResize: handleChartReady,
                      onComplete: handleChartReady,
                    }}
                  />
                )}
  
                {/* Draggable Markers */}
                {startMarker && chartRef.current && (
                  <Draggable
                    axis="x"
                    bounds={{
                      left: 0,
                      right: endMarker ? endMarker.x - 10 : chartRef.current.chartArea.width,
                    }}
                    position={{ x: startMarker.x, y: 0 }}
                    onStop={(e, data) => handleMarkerDrag("start", data)}
                  >
                    <div
                      className="absolute top-0 h-full w-2 bg-indigo-600 opacity-50 cursor-ew-resize z-10"
                      style={{ left: 0 }}
                    >
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-600 rounded-full"></div>
                    </div>
                  </Draggable>
                )}
  
                {endMarker && chartRef.current && (
                  <Draggable
                    axis="x"
                    bounds={{
                      left: startMarker ? startMarker.x + 10 : 0,
                      right: chartRef.current.chartArea.width,
                    }}
                    position={{ x: endMarker.x, y: 0 }}
                    onStop={(e, data) => handleMarkerDrag("end", data)}
                  >
                    <div
                      className="absolute top-0 h-full w-2 bg-red-600 opacity-50 cursor-ew-resize z-10"
                      style={{ left: 0 }}
                    >
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full"></div>
                    </div>
                  </Draggable>
                )}
  
                {profit && (
                  <div className="absolute top-2 right-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                    <p className="text-sm font-medium">Profit between markers:</p>
                    <p
                      className={`text-lg font-bold ${
                        profit.value > 0 ? "text-green-600" : profit.value < 0 ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      {profit.value > 0 ? "+" : ""}
                      {profit.value} ({profit.value > 0 ? "+" : ""}
                      {profit.percent}%)
                    </p>
                  </div>
                )}
              </div>
  
              <p className="text-sm text-gray-500 mt-2">
                Drag the markers to select time range for profit calculation.
              </p>
            </div>
          )}
  
          {/* Rule Profit Display */}
          {ruleProfit && (
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Rule-Based Trading Results</h3>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-700">Total Profit:</p>
                  <p
                    className={`text-xl font-bold ${
                      parseFloat(ruleProfit.total) > 0
                        ? "text-green-600"
                        : parseFloat(ruleProfit.total) < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {parseFloat(ruleProfit.total) > 0 ? "+" : ""}${ruleProfit.total}
                  </p>
                </div>
  
                {ruleProfit.transactions.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Transactions:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stock
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Profit
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {ruleProfit.transactions.map((transaction, index) => (
                            <tr key={index}>
                              <td
                                className={`px-3 py-2 whitespace-nowrap text-sm ${
                                  transaction.type.includes("BUY") ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {transaction.type}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                {transaction.stock}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                ${parseFloat(transaction.price).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                {transaction.profit ? (
                                  <span
                                    className={
                                      parseFloat(transaction.profit) >= 0 ? "text-green-600" : "text-red-600"
                                    }
                                  >
                                    {parseFloat(transaction.profit) > 0 ? "+" : ""}${transaction.profit}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {new Date(transaction.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
  
          {/* Code Editor Section */}
          {showCodeEditor && (
            <div className="p-6 border-b bg-gray-900">
              <h3 className="text-lg font-semibold text-white mb-4">Trading Rules Editor</h3>
  
              <div className="mb-4">
                <div className="bg-black rounded-t-lg p-2 text-xs text-gray-400 border-b border-gray-700">
                  trading-rules.js
                </div>
                <textarea
                  className="w-full h-40 bg-black text-green-400 font-mono p-4 outline-none border-0 rounded-b-lg resize-none"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Enter your trading code here... e.g. IF 500 NULL BUY AAPL"
                  spellCheck="false"
                  style={{
                    caretColor: "white",
                    lineHeight: "1.5",
                    fontSize: "14px",
                  }}
                />
              </div>
  
              {syntaxError && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200 flex items-start gap-2">
                  <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                  <p>{syntaxError}</p>
                </div>
              )}
  
              <div className="mb-2 text-gray-300 text-sm">
                <p>Valid stocks: {VALID_STOCK_SYMBOLS.join(", ")}</p>
                <p className="mt-1">Format: IF [lower] [upper] [BUY/SELL] [stock]</p>
                <p className="mt-1">Example: IF 100 200 BUY AAPL</p>
                <p className="mt-1">Use NULL for no limit: IF NULL 300 SELL MSFT</p>
              </div>
  
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                onClick={handleApplyRule}
              >
                Apply Rule
              </button>
  
              {parsedRules.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-white mb-2">Applied Rules:</h4>
                  <div className="bg-gray-800 rounded-lg p-4">
                    {parsedRules.map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
                      >
                        <div className="text-gray-200">
                          <span className="text-indigo-400">IF</span> {rule.lower} {rule.upper}{" "}
                          <span className={rule.task === "buy" ? "text-green-400" : "text-red-400"}>
                            {rule.task.toUpperCase()}
                          </span>{" "}
                          <span className="text-yellow-400">{rule.stock}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteRule(index)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
  
          {/* Tab Content */}
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            {activeTab === "stocks" && (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-700 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-4 px-2 font-semibold text-sm uppercase tracking-wide">Select</th>
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
                    const symbol = stock["Meta Data"]["2. Symbol"];
                    return (
                      <tr
                        key={symbol}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-indigo-100 cursor-pointer transition-all duration-200`}
                        onClick={() => handleStockClick(symbol)}
                      >
                        <td className="py-4 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedStocks.includes(symbol)}
                            onChange={(e) => handleStockSelect(e, stock)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-800">{symbol}</td>
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
                    <th className="py-4 px-6 font-semibold text-sm uppercase tracking-wide">Name</th>
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
                        key={insurance.id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-indigo-100 cursor-pointer transition-all duration-200`}
                        onClick={() => handleInsuranceClick(insurance.id)}
                      >
                        <td className="py-4 px-6 font-medium text-gray-800">{insurance.id}</td>
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
          {stocks.length > 0 && Object.keys(stocks[0]["Time Series (60min)"]).sort()[currentTimestampIndex]}
        </p>
      </footer>
    </div>
  );
}
