"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FaSearch, FaArrowUp, FaArrowDown, FaInfoCircle } from "react-icons/fa"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, X, Plus, Play } from "lucide-react"

// Simulated data for Stocks, Bonds, and Insurances
import stockData from "../stocks.json" // Ensure path is correct

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
        "2025-03-15 16:00:00": {
          "1. yield": "3.50",
          "2. high": "3.55",
          "3. low": "3.45",
          "4. price": "100.50",
          "5. volume": "5000",
        },
        "2025-03-15 15:55:00": {
          "1. yield": "3.48",
          "2. high": "3.50",
          "3. low": "3.40",
          "4. price": "100.30",
          "5. volume": "4800",
        },
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
        "2025-03-15 16:00:00": {
          "1. yield": "4.20",
          "2. high": "4.25",
          "4. low": "4.15",
          "4. price": "99.80",
          "5. volume": "7000",
        },
        "2025-03-15 15:55:00": {
          "1. yield": "4.18",
          "2. high": "4.20",
          "3. low": "4.10",
          "4. price": "99.60",
          "5. volume": "6800",
        },
      },
    },
  ],
}

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
        category: "Property",
        price: "2496.17", // Premium price
        risk_level: "Medium",
        term: "29 years",
        premium: "Annually",
        coverage: "507217.44",
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
        category: "Property",
        price: "3000.00",
        risk_level: "High",
        term: "25 years",
        premium: "Annually",
        coverage: "600000.00",
      },
    },
  ],
}

// Code Editor Component
const CodeEditor = () => {
  const [code, setCode] = useState("")
  const [parsedData, setParsedData] = useState([])

  const parseCodeToArray = (input) => {
    const lines = input.trim().split("\n")
    const result = lines
      .map((line) => {
        const parts = line.trim().split(/\s+/)
        if (parts.length === 5 && parts[0].toUpperCase() === "IF") {
          const taskPart = parts[3].toUpperCase()
          const task = taskPart === "BUY" ? "buy" : taskPart === "SELL" ? "sell" : null
          if (task) {
            return {
              task: task,
              lower: parts[1],
              upper: parts[2],
              stock: parts[4].toUpperCase(),
            }
          }
        }
        return null
      })
      .filter((item) => item !== null)

    return result
  }

  const handleChange = (e) => {
    setCode(e.target.value)
  }

  const handleApplyRule = async () => {
    const parsedArray = parseCodeToArray(code)
    setParsedData(parsedArray)
    console.log("Parsed Array:", parsedArray)

    try {
      const response = await fetch("https://your-api-endpoint.com/trading-rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedArray),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("API Response:", data)
      } else {
        console.error("API Error:", response.status)
      }
    } catch (error) {
      console.error("Fetch Error:", error)
    }
  }

  return (
    <div className="editor-container bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3">Trading Rules</h3>
      <textarea
        className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={code}
        onChange={handleChange}
        placeholder="Enter your trading code here... e.g. IF 500 NULL BUY AAPL"
        spellCheck="false"
      />
      <button
        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
        onClick={handleApplyRule}
      >
        <Play size={16} />
        Apply Rule
      </button>

      {parsedData.length > 0 && (
        <div className="mt-4">
          <h4 className="text-md font-medium mb-2">Active Rules:</h4>
          <ul className="space-y-2">
            {parsedData.map((rule, index) => (
              <li key={index} className="p-2 bg-gray-50 rounded border border-gray-200 flex items-center">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold mr-2 ${rule.task === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {rule.task.toUpperCase()}
                </span>
                <span className="text-sm">
                  {rule.stock} when price is {rule.lower !== "NULL" ? `above ${rule.lower}` : ""}
                  {rule.lower !== "NULL" && rule.upper !== "NULL" ? " and " : ""}
                  {rule.upper !== "NULL" ? `below ${rule.upper}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{`${new Date(label).toLocaleDateString()}`}</p>
        <p className="text-sm text-gray-700">{`Price: ₹${Number.parseFloat(payload[0].value).toFixed(2)}`}</p>
      </div>
    )
  }
  return null
}

export function TradePanel() {
  const [currentPrices, setCurrentPrices] = useState({})
  const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0)
  const [stocks] = useState(stockData.stocks)
  const [bonds] = useState(bondsData.bonds)
  const [insurances] = useState(insurancesData.insurances)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("stocks")
  const [filterCategory, setFilterCategory] = useState("")
  const [selectedStocks, setSelectedStocks] = useState({})
  const [chartRange, setChartRange] = useState({ start: 0, end: 30 })
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const chartContainerRef = useRef(null)
  const navigate = useNavigate()

  // Initialize selected stocks
  useEffect(() => {
    const initialSelection = {}
    stocks.forEach((stock) => {
      initialSelection[stock["Meta Data"]["2. Symbol"]] = false
    })
    setSelectedStocks(initialSelection)
  }, [stocks])

  // Dynamic price updates for Stocks and Bonds (excluding Insurances)
  useEffect(() => {
    const stockTimestamps = stocks[0] ? Object.keys(stocks[0]["Time Series (60min)"]).sort().reverse() : []
    const bondTimestamps = bonds[0] ? Object.keys(bonds[0]["Time Series (5min)"]).sort().reverse() : []

    const initialPrices = {}
    stocks.forEach((stock) => {
      if (stockTimestamps[0]) {
        initialPrices[stock["Meta Data"]["2. Symbol"]] = stock["Time Series (60min)"][stockTimestamps[0]]["4. close"]
      }
    })
    bonds.forEach((bond) => {
      if (bondTimestamps[0]) {
        initialPrices[bond["Meta Data"]["2. Symbol"]] = bond["Time Series (5min)"][bondTimestamps[0]]["4. price"]
      }
    })
    // Insurances are static, so just set their price once
    insurances.forEach((insurance) => {
      initialPrices[insurance["Meta Data"]["2. Symbol"]] = insurance["Policy Details"]["price"]
    })
    setCurrentPrices(initialPrices)

    const interval = setInterval(() => {
      setCurrentTimestampIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        const newPrices = {}

        stocks.forEach((stock) => {
          const timestamps = Object.keys(stock["Time Series (60min)"]).sort().reverse()
          const timestamp = timestamps[nextIndex % timestamps.length] || timestamps[0]
          newPrices[stock["Meta Data"]["2. Symbol"]] = stock["Time Series (60min)"][timestamp]["4. close"]
        })

        // Update Bonds prices
        bonds.forEach((bond) => {
          const timestamps = Object.keys(bond["Time Series (5min)"]).sort().reverse()
          const timestamp = timestamps[nextIndex % timestamps.length] || timestamps[0]
          newPrices[bond["Meta Data"]["2. Symbol"]] = bond["Time Series (5min)"][timestamp]["4. price"]
        })

        // Insurances remain static, so copy their current price
        insurances.forEach((insurance) => {
          newPrices[insurance["Meta Data"]["2. Symbol"]] = insurance["Policy Details"]["price"]
        })

        setCurrentPrices(newPrices)
        return nextIndex
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [stocks, bonds, insurances])

  // Get detailed info for each asset type
  const getStockInfo = (stock) => {
    const symbol = stock["Meta Data"]["2. Symbol"]
    if (!symbol || !currentPrices[symbol]) {
      return {
        price: "N/A",
        trend: null,
        change: "0.00",
        volume: "N/A",
        high: "N/A",
        low: "N/A",
        open: "N/A",
        percentChange: "0.00",
      }
    }
    const timestamps = Object.keys(stock["Time Series (60min)"]).sort() // Sort timestamps in chronological order
    const currentPrice = Number.parseFloat(currentPrices[symbol])
    const prevPrice = Number.parseFloat(
      stock["Time Series (60min)"][timestamps[currentTimestampIndex - 1] || timestamps[0]]["4. close"],
    )
    const trend = currentPrice > prevPrice ? "up" : currentPrice < prevPrice ? "down" : "neutral"
    const change = (currentPrice - prevPrice).toFixed(2)
    const currentData = stock["Time Series (60min)"][timestamps[currentTimestampIndex] || timestamps[0]]
    const volume = currentData["5. volume"]
    const high = Number.parseFloat(currentData["2. high"]).toFixed(2)
    const low = Number.parseFloat(currentData["3. low"]).toFixed(2)
    const open = Number.parseFloat(currentData["1. open"]).toFixed(2)
    const percentChange = prevPrice ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2) : "0.00"

    return { price: currentPrice.toFixed(2), trend, change, volume, high, low, open, percentChange }
  }

  const getBondInfo = (bond) => {
    const symbol = bond["Meta Data"]["2. Symbol"]
    if (!symbol || !currentPrices[symbol]) {
      return { price: "N/A", trend: null, change: "0.00", yield: "N/A", high: "N/A", low: "N/A", percentChange: "0.00" }
    }
    const timestamps = Object.keys(bond["Time Series (5min)"]).sort().reverse()
    const currentPrice = Number.parseFloat(currentPrices[symbol])
    const prevPrice = Number.parseFloat(
      bond["Time Series (5min)"][timestamps[currentTimestampIndex - 1] || timestamps[0]]["4. price"],
    )
    const trend = currentPrice > prevPrice ? "up" : currentPrice < prevPrice ? "down" : "neutral"
    const change = (currentPrice - prevPrice).toFixed(2)
    const currentData = bond["Time Series (5min)"][timestamps[currentTimestampIndex] || timestamps[0]]
    const yieldRate = currentData["1. yield"]
    const high = Number.parseFloat(currentData["2. high"]).toFixed(2)
    const low = Number.parseFloat(currentData["3. low"]).toFixed(2)
    const percentChange = prevPrice ? (((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2) : "0.00"

    return { price: currentPrice.toFixed(2), trend, change, yield: yieldRate, high, low, percentChange }
  }

  const getInsuranceInfo = (insurance) => {
    const symbol = insurance["Meta Data"]["2. Symbol"]
    if (!symbol || !currentPrices[symbol]) {
      return {
        price: "N/A",
        riskLevel: "N/A",
        term: "N/A",
        premium: "N/A",
        coverage: "N/A",
      }
    }
    const price = Number.parseFloat(currentPrices[symbol]).toFixed(2)
    const policyDetails = insurance["Policy Details"]
    const riskLevel = policyDetails["risk_level"]
    const term = policyDetails["term"]
    const premium = policyDetails["premium"]
    const coverage = Number.parseFloat(policyDetails["coverage"]).toFixed(2)

    return { price, riskLevel, term, premium, coverage }
  }

  // Filter assets based on search query and category for insurances
  const filteredStocks = stocks.filter((stock) =>
    stock["Meta Data"]["2. Symbol"].toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const filteredBonds = bonds.filter((bond) =>
    bond["Meta Data"]["2. Symbol"].toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const filteredInsurances = insurances.filter((insurance) => {
    const matchesSearch = insurance["Meta Data"]["2. Symbol"].toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      !filterCategory || insurance["Policy Details"]["category"].toLowerCase() === filterCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  // Handle asset click
  const handleStockClick = (stockSymbol, e) => {
    // If the click was on the checkbox, don't navigate
    if (e.target.type === "checkbox" || e.target.closest(".checkbox-container")) {
      return
    }
    navigate(`/stock/${stockSymbol}`)
  }

  const handleBondClick = (bondSymbol) => {
    navigate(`/bond/${bondSymbol}`)
  }

  const handleInsuranceClick = (insuranceSymbol) => {
    navigate(`/insurance/${insuranceSymbol}`)
  }

  // Toggle stock selection
  const toggleStockSelection = (symbol, e) => {
    e.stopPropagation()
    setSelectedStocks((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }))
  }

  // Prepare chart data for selected stocks
  const prepareChartData = (stock) => {
    const symbol = stock["Meta Data"]["2. Symbol"]
    const timestamps = Object.keys(stock["Time Series (60min)"]).sort()

    // Get the visible range of timestamps based on the slider
    const visibleTimestamps = timestamps.slice(
      Math.max(0, timestamps.length - chartRange.end),
      Math.max(0, timestamps.length - chartRange.start),
    )

    return visibleTimestamps.map((timestamp) => {
      const data = stock["Time Series (60min)"][timestamp]
      return {
        timestamp,
        [symbol]: Number.parseFloat(data["4. close"]),
        high: Number.parseFloat(data["2. high"]),
        low: Number.parseFloat(data["3. low"]),
        open: Number.parseFloat(data["1. open"]),
        volume: Number.parseInt(data["5. volume"]),
      }
    })
  }

  // Handle chart range slider change
  const handleRangeChange = (direction) => {
    if (direction === "left") {
      setChartRange((prev) => ({
        start: Math.max(0, prev.start - 5),
        end: Math.max(prev.end - 5, prev.start - 5 + 30),
      }))
    } else {
      const maxTimestamps = stocks[0] ? Object.keys(stocks[0]["Time Series (60min)"]).length : 0
      setChartRange((prev) => ({
        start: Math.min(prev.start + 5, maxTimestamps - 30),
        end: Math.min(prev.end + 5, maxTimestamps),
      }))
    }
  }

  // Get any selected stocks
  const selectedStocksList = Object.entries(selectedStocks)
    .filter(([_, isSelected]) => isSelected)
    .map(([symbol]) => stocks.find((stock) => stock["Meta Data"]["2. Symbol"] === symbol))
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6 font-sans">
      {/* Header */}
      <header className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Market Overview</h2>
        <p className="text-gray-600 mt-2 text-lg">Explore real-time financial data</p>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Charts Section for Selected Stocks */}
        {selectedStocksList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white shadow-lg rounded-xl overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Selected Stocks Performance</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRangeChange("left")}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => handleRangeChange("right")}
                    className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4" ref={chartContainerRef}>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      allowDuplicatedCategory={false}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />

                    {selectedStocksList.map((stock, index) => {
                      const symbol = stock["Meta Data"]["2. Symbol"]
                      const chartData = prepareChartData(stock)
                      const colors = [
                        "#4f46e5",
                        "#0ea5e9",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444",
                        "#8b5cf6",
                        "#ec4899",
                        "#06b6d4",
                        "#84cc16",
                        "#f97316",
                      ]

                      return (
                        <Line
                          key={symbol}
                          data={chartData}
                          type="monotone"
                          dataKey={symbol}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                          name={symbol}
                        />
                      )
                    })}

                    <ReferenceLine y={0} stroke="#666" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {selectedStocksList.map((stock, index) => {
                  const symbol = stock["Meta Data"]["2. Symbol"]
                  const colors = [
                    "#4f46e5",
                    "#0ea5e9",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                    "#06b6d4",
                    "#84cc16",
                    "#f97316",
                  ]

                  return (
                    <div
                      key={symbol}
                      className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${colors[index % colors.length]}20`,
                        color: colors[index % colors.length],
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></span>
                      {symbol}
                      <button
                        onClick={() => toggleStockSelection(symbol, { stopPropagation: () => {} })}
                        className="ml-1 hover:bg-white/20 rounded-full p-1"
                        aria-label={`Remove ${symbol} from chart`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Trading Rules Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowRuleEditor(!showRuleEditor)}
            className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            {showRuleEditor ? <X size={16} /> : <Plus size={16} />}
            {showRuleEditor ? "Hide Rule Editor" : "Add Trading Rules"}
          </button>

          {showRuleEditor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CodeEditor />
            </motion.div>
          )}
        </div>

        {/* Asset Tables */}
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
                  activeTab === "stocks" ? "border-b-2 border-white text-white" : "text-gray-200 hover:text-white"
                }`}
                onClick={() => setActiveTab("stocks")}
              >
                Stocks
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === "bonds" ? "border-b-2 border-white text-white" : "text-gray-200 hover:text-white"
                }`}
                onClick={() => setActiveTab("bonds")}
              >
                Bonds
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === "insurances" ? "border-b-2 border-white text-white" : "text-gray-200 hover:text-white"
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
                    <th className="py-4 px-2 font-semibold text-sm uppercase tracking-wide text-center">Select</th>
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
                    const { price, trend, change, volume, high, low, open, percentChange } = getStockInfo(stock)
                    const symbol = stock["Meta Data"]["2. Symbol"]
                    return (
                      <tr
                        key={symbol}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-indigo-100 cursor-pointer transition-all duration-200`}
                        onClick={(e) => handleStockClick(symbol, e)}
                      >
                        <td className="py-4 px-2 text-center checkbox-container">
                          <input
                            type="checkbox"
                            checked={selectedStocks[symbol] || false}
                            onChange={(e) => toggleStockSelection(symbol, e)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                            onClick={(e) => e.stopPropagation()}
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
                    )
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
                    const { price, trend, change, yield: yieldRate, high, low, percentChange } = getBondInfo(bond)
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
                    )
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
                    const { price, riskLevel, term, premium, coverage } = getInsuranceInfo(insurance)
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
                    )
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
          {stocks.length > 0 && Object.keys(stocks[0]["Time Series (60min)"]).sort()[currentTimestampIndex]}{" "}
          {/* Sorted in order */}
        </p>
      </footer>
    </div>
  )
}

