"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { FaSearch, FaArrowUp, FaArrowDown, FaInfoCircle, FaTrash, FaCode } from "react-icons/fa"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Simulated data for Stocks, Bonds, and Insurances
import stockData from "../stocks.json" // Ensure path is correct
import bondsData from "../bonds.json"
import insurancesData from "../insurance.json"

export function TradePanel() {
  const [currentPrices, setCurrentPrices] = useState({})
  const [currentTimestampIndex, setCurrentTimestampIndex] = useState(0)
  const [stocks] = useState(stockData.stocks)
  const [bonds] = useState(bondsData) // Use the imported JSON data
  const [insurances] = useState(insurancesData)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("stocks")
  const [filterCategory, setFilterCategory] = useState("")
  const [selectedStocks, setSelectedStocks] = useState([])
  const [timeFilter, setTimeFilter] = useState("daily")
  const [leftMarker, setLeftMarker] = useState(null)
  const [rightMarker, setRightMarker] = useState(null)
  const [profit, setProfit] = useState(null)
  const [code, setCode] = useState("")
  const [parsedRules, setParsedRules] = useState([])
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const chartRef = useRef(null)
  const navigate = useNavigate()

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
    // Set initial prices for insurances
    insurances.forEach((insurance) => {
      initialPrices[insurance.id] = insurance.price
    })
    setCurrentPrices(initialPrices)

    const interval = setInterval(() => {
      setCurrentTimestampIndex((prevIndex) => {
        const nextIndex = prevIndex + 1
        const newPrices = {}

        // Update Stocks prices
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

        // Insurances remain static
        insurances.forEach((insurance) => {
          newPrices[insurance.id] = insurance.price
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
    const symbol = insurance.id
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
    const riskLevel = insurance.risk_level
    const term = `${insurance.term_years} years`
    const premium = insurance.premium_frequency
    const coverage = Number.parseFloat(insurance.coverage_amount).toFixed(2)

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
    const matchesSearch = insurance.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !filterCategory || insurance.category.toLowerCase() === filterCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  // Handle asset click
  const handleStockClick = (stockSymbol) => {
    navigate(`/stock/${stockSymbol}`)
  }
  const handleBondClick = (bondSymbol) => {
    navigate(`/bond/${bondSymbol}`)
  }
  const handleInsuranceClick = (insuranceName) => {
    navigate(`/insurance/${insuranceName}`)
  }

  // Handle checkbox selection
  const handleStockSelect = (e, stock) => {
    e.stopPropagation()
    const symbol = stock["Meta Data"]["2. Symbol"]

    if (selectedStocks.includes(symbol)) {
      setSelectedStocks(selectedStocks.filter((s) => s !== symbol))
    } else {
      setSelectedStocks([...selectedStocks, symbol])
    }
  }

  // Generate chart data based on selected stocks
  const getChartData = () => {
    if (selectedStocks.length === 0) return null

    const labels = []
    const datasets = []

    // Generate random colors for each stock
    const colors = [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)",
      "rgba(199, 199, 199, 1)",
      "rgba(83, 102, 255, 1)",
      "rgba(40, 159, 64, 1)",
      "rgba(210, 199, 199, 1)",
    ]

    // Get timestamps based on time filter
    let timeSeriesKey = "Time Series (60min)"
    switch (timeFilter) {
      case "yearly":
        timeSeriesKey = "Time Series (Yearly)"
        break
      case "monthly":
        timeSeriesKey = "Time Series (Monthly)"
        break
      case "weekly":
        timeSeriesKey = "Time Series (Weekly)"
        break
      default:
        timeSeriesKey = "Time Series (60min)"
    }

    // For demo purposes, we'll use the available 60min data
    selectedStocks.forEach((symbol, index) => {
      const stock = stocks.find((s) => s["Meta Data"]["2. Symbol"] === symbol)
      if (!stock) return

      const timestamps = Object.keys(stock["Time Series (60min)"]).sort()

      if (labels.length === 0) {
        // Only set labels once from the first stock
        labels.push(...timestamps)
      }

      const data = timestamps.map((timestamp) => Number.parseFloat(stock["Time Series (60min)"][timestamp]["4. close"]))

      datasets.push({
        label: symbol,
        data: data,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace("1)", "0.2)"),
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
      })
    })

    return {
      labels,
      datasets,
    }
  }

  // Handle chart double click for markers
  const handleChartDoubleClick = (event) => {
    if (!chartRef.current) return

    const chart = chartRef.current
    const canvasPosition = chart.canvas.getBoundingClientRect()
    const x = event.clientX - canvasPosition.left

    // Convert x position to data index
    const xScale = chart.scales.x
    const index = xScale.getValueForPixel(x)

    if (leftMarker === null || rightMarker !== null) {
      // Set left marker if none exists or reset both markers
      setLeftMarker(index)
      setRightMarker(null)
      setProfit(null)
    } else {
      // Set right marker if left marker exists
      setRightMarker(index)

      // Calculate profit between markers
      if (selectedStocks.length > 0) {
        const stock = stocks.find((s) => s["Meta Data"]["2. Symbol"] === selectedStocks[0])
        if (stock) {
          const timestamps = Object.keys(stock["Time Series (60min)"]).sort()
          const leftPrice = Number.parseFloat(stock["Time Series (60min)"][timestamps[leftMarker]]["4. close"])
          const rightPrice = Number.parseFloat(stock["Time Series (60min)"][timestamps[index]]["4. close"])
          const profitValue = (rightPrice - leftPrice).toFixed(2)
          const profitPercent = (((rightPrice - leftPrice) / leftPrice) * 100).toFixed(2)
          setProfit({ value: profitValue, percent: profitPercent })
        }
      }
    }
  }

  // Parse code to trading rules
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

  // Handle code change
  const handleCodeChange = (e) => {
    setCode(e.target.value)
  }

  // Apply trading rule
  const handleApplyRule = () => {
    const newRules = parseCodeToArray(code)
    setParsedRules([...parsedRules, ...newRules])
    setCode("")
  }

  // Delete rule
  const handleDeleteRule = (index) => {
    const updatedRules = [...parsedRules]
    updatedRules.splice(index, 1)
    setParsedRules(updatedRules)
  }

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

              <div className="relative h-80" onDoubleClick={handleChartDoubleClick}>
                {getChartData() && (
                  <Line
                    ref={chartRef}
                    data={getChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
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
                        y: {
                          beginAtZero: false,
                        },
                      },
                    }}
                  />
                )}

                {profit && (
                  <div className="absolute top-2 right-2 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                    <p className="text-sm font-medium">Profit between markers:</p>
                    <p
                      className={`text-lg font-bold ${profit.value > 0 ? "text-green-600" : profit.value < 0 ? "text-red-600" : "text-gray-600"}`}
                    >
                      {profit.value > 0 ? "+" : ""}
                      {profit.value} ({profit.value > 0 ? "+" : ""}
                      {profit.percent}%)
                    </p>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Double-click on the chart to set markers and calculate profit between points.
              </p>
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
                    const { price, trend, change, volume, high, low, open, percentChange } = getStockInfo(stock)
                    const symbol = stock["Meta Data"]["2. Symbol"]
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
                    const { price, riskLevel, term, premium, coverage } = getInsuranceInfo(insurance)
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
          {stocks.length > 0 && Object.keys(stocks[0]["Time Series (60min)"]).sort()[currentTimestampIndex]}
        </p>
      </footer>
    </div>
  )
}

