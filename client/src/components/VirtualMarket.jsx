import { useState, useEffect } from "react";
import { FaChartLine, FaDollarSign, FaArrowUp, FaArrowDown, FaChartBar, FaChartPie, FaCoins } from "react-icons/fa";
import { TradePanel } from "./TradePanel";
import SipCalculator from "./SipCalculator";
import Learnings from "./Learnings";

export default function VirtualMarket() {
  const [activeTab, setActiveTab] = useState("overview");
  const [portfolioSummary, setPortfolioSummary] = useState([]);
  const [portfolio, setPortfolio] = useState(() => JSON.parse(localStorage.getItem("portfolio")) || []);
  const [balance, setBalance] = useState(() => parseFloat(localStorage.getItem("balance")) || 10000); // Starting balance of $10,000
  const [boughtsum, setBoughtsum] = useState(() => parseFloat(localStorage.getItem("boughtsum")) || 10000); // Initial investment
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id") || "default_user"; // Fallback user ID

  useEffect(() => {
    const updatePortfolioSummary = () => {
      const totalPortfolio = portfolio.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const stocksValue = portfolio
        .filter((item) => item.type === "stock")
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      const bondsValue = portfolio
        .filter((item) => item.type === "bond")
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
      const insuranceValue = portfolio
        .filter((item) => item.type === "insurance")
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

      const calculateTrend = (currentValue, initialValue) => {
        if (initialValue === 0) return { percentage: "0.0%", direction: "neutral" };
        const change = ((currentValue - initialValue) / initialValue) * 100;
        return {
          percentage: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
          direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
        };
      };

      const portfolioTrend = calculateTrend(totalPortfolio, boughtsum);
      const stocksTrend = calculateTrend(stocksValue, boughtsum * 0.6);
      const bondsTrend = calculateTrend(bondsValue, boughtsum * 0.3);
      const insuranceTrend = calculateTrend(insuranceValue, boughtsum * 0.1);

      const summary = [
        {
          title: "Portfolio",
          value: `$${totalPortfolio.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: <FaDollarSign className="h-6 w-6 text-indigo-500" />,
          trend: portfolioTrend.percentage,
          trendIcon: portfolioTrend.direction === "up" ? <FaArrowUp className="h-4 w-4 text-green-500" /> : portfolioTrend.direction === "down" ? <FaArrowDown className="h-4 w-4 text-red-500" /> : null,
          trendColor: portfolioTrend.direction === "up" ? "bg-green-100 text-green-600" : portfolioTrend.direction === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
        },
        {
          title: "Stocks",
          value: `$${stocksValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: <FaChartLine className="h-6 w-6 text-indigo-500" />,
          trend: stocksTrend.percentage,
          trendIcon: stocksTrend.direction === "up" ? <FaArrowUp className="h-4 w-4 text-green-500" /> : stocksTrend.direction === "down" ? <FaArrowDown className="h-4 w-4 text-red-500" /> : null,
          trendColor: stocksTrend.direction === "up" ? "bg-green-100 text-green-600" : stocksTrend.direction === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
        },
        {
          title: "Bonds",
          value: `$${bondsValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: <FaChartBar className="h-6 w-6 text-indigo-500" />,
          trend: bondsTrend.percentage,
          trendIcon: bondsTrend.direction === "up" ? <FaArrowUp className="h-4 w-4 text-green-500" /> : bondsTrend.direction === "down" ? <FaArrowDown className="h-4 w-4 text-red-500" /> : null,
          trendColor: bondsTrend.direction === "up" ? "bg-green-100 text-green-600" : bondsTrend.direction === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
        },
        {
          title: "Insurance",
          value: `$${insuranceValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          icon: <FaChartPie className="h-6 w-6 text-indigo-500" />,
          trend: insuranceTrend.percentage,
          trendIcon: insuranceTrend.direction === "up" ? <FaArrowUp className="h-4 w-4 text-green-500" /> : insuranceTrend.direction === "down" ? <FaArrowDown className="h-4 w-4 text-red-500" /> : null,
          trendColor: insuranceTrend.direction === "up" ? "bg-green-100 text-green-600" : insuranceTrend.direction === "down" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
        },
      ];

      setPortfolioSummary(summary);
      setLoading(false);
    };

    updatePortfolioSummary();
  }, [portfolio, boughtsum]);

  // Function to handle buying stocks
  const handleBuyStock = (stockPrice, quantity, stockName) => {
    const totalCost = stockPrice * quantity;
    if (totalCost > balance) {
      alert("Insufficient balance!");
      return;
    }

    const newBalance = balance - totalCost;
    setBalance(newBalance);
    localStorage.setItem("balance", newBalance.toString());

    const existingStock = portfolio.find((item) => item.name === stockName && item.type === "stock");
    let updatedPortfolio;
    if (existingStock) {
      updatedPortfolio = portfolio.map((item) =>
        item.name === stockName && item.type === "stock"
          ? { ...item, quantity: item.quantity + quantity, price: stockPrice } // Update price to latest
          : item
      );
    } else {
      updatedPortfolio = [...portfolio, { name: stockName, type: "stock", price: stockPrice, quantity }];
    }

    setPortfolio(updatedPortfolio);
    localStorage.setItem("portfolio", JSON.stringify(updatedPortfolio));
  };

  // Function to handle selling stocks
  const handleSellStock = (stockPrice, quantity, stockName) => {
    const existingStock = portfolio.find((item) => item.name === stockName && item.type === "stock");
    if (!existingStock || existingStock.quantity < quantity) {
      alert("Not enough stocks to sell!");
      return;
    }

    const totalGain = stockPrice * quantity;
    const newBalance = balance + totalGain;
    setBalance(newBalance);
    localStorage.setItem("balance", newBalance.toString());

    const updatedPortfolio = portfolio
      .map((item) =>
        item.name === stockName && item.type === "stock"
          ? { ...item, quantity: item.quantity - quantity }
          : item
      )
      .filter((item) => item.quantity > 0); // Remove if quantity becomes 0

    setPortfolio(updatedPortfolio);
    localStorage.setItem("portfolio", JSON.stringify(updatedPortfolio));
  };

  if (loading) {
    return <div className="text-center p-6">Loading VirtualMarket...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {portfolioSummary.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.icon}
                <h2 className="text-sm font-semibold text-gray-700">{item.title}</h2>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.trendColor}`}>
                {item.trendIcon} {item.trend}
              </span>
            </div>
            <div className="mt-4 text-2xl font-bold text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs bg-white rounded-xl shadow-md p-3 flex justify-start gap-3 mb-8 overflow-x-auto">
        {["overview", "trade", "learnings", "SIP"].map((tab) => (
          <button
            key={tab}
            className={`tab px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-indigo-50"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in space-y-8">
        {activeTab === "overview" && (
          <>
            <div className="card bg-base-100 shadow-md p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center">
                  <FaCoins className="mr-2" />
                  InvestHub Money
                </h3>
                <button className="btn btn-sm btn-outline">Add Funds</button>
              </div>
              <p className="text-xl font-bold">
                Rs.{balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-gray-500 text-sm">Last deposit: Rs.2,000 on Mar 10, 2025</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaChartLine className="text-indigo-500" /> Performance
                </h2>
                <div className="h-72 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg mt-4 flex items-center justify-center">
                  <FaChartLine className="h-16 w-16 text-indigo-300" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FaChartPie className="text-indigo-500" /> Allocation
                </h2>
                <div className="h-72 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg mt-4 flex items-center justify-center">
                  <FaChartPie className="h-16 w-16 text-indigo-300" />
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === "trade" && <TradePanel onBuy={handleBuyStock} onSell={handleSellStock} />}
        {activeTab === "learnings" && <Learnings />}
        {activeTab === "SIP" && <SipCalculator />}
      </div>
    </div>
  );
}