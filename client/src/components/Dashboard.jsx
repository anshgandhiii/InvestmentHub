import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaChartLine, FaBars, FaDollarSign, FaArrowUp, FaArrowDown, FaChartBar, FaChartPie, FaNewspaper, FaHistory, FaGamepad, FaMoneyBillWave } from "react-icons/fa";
import { TradePanel } from "./TradePanel";
import { InvestmentSuggestions } from "./InvestmentSuggessions";
import { ProfitCalculator } from "./ProfitCalculator";
import { AccountBalance } from "./AccountBalance";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // State for backend data
  const [portfolioSummary, setPortfolioSummary] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [virtualTradingStats, setVirtualTradingStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API endpoints (replace with your actual backend URLs)
  const API_BASE_URL = "http://127.0.0.1:8000/"; // Replace with your backend URL

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Portfolio Summary
        const portfolioResponse = await fetch(`${API_BASE_URL}/investment/portfolio`);
        const portfolioData = await portfolioResponse.json();
        setPortfolioSummary(portfolioData);

        // Fetch News
        const newsResponse = await fetch(`${API_BASE_URL}/news`);
        const newsData = await newsResponse.json();
        setNewsItems(newsData);

        // Fetch Transaction History
        const transactionsResponse = await fetch(`${API_BASE_URL}/investment/transactions`);
        const transactionsData = await transactionsResponse.json();
        setTransactionHistory(transactionsData);

        // Fetch Virtual Trading Stats
        const virtualTradingResponse = await fetch(`${API_BASE_URL}/virtual-trading`);
        const virtualTradingData = await virtualTradingResponse.json();
        setVirtualTradingStats(virtualTradingData);

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data from the server.");
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means it runs once on mount

  const navItems = [
    { label: "Dashboard", path: "/dashboard", active: true },
    { label: "Profile", path: "/profile", active: false },
    { label: "Logout", path: "/logout", active: false },
  ];

  const sidebarItems = [
    { label: "News", icon: <FaNewspaper className="h-5 w-5 text-indigo-500" />, action: () => alert("News section coming soon!") },
    { label: "History", icon: <FaHistory className="h-5 w-5 text-indigo-500" />, action: () => alert("Transaction History section coming soon!") },
    { label: "Virtual Trading", icon: <FaGamepad className="h-5 w-5 text-indigo-500" />, action: () => alert("Virtual Trading section coming soon!") },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg px-4 py-3 sticky top-0 z-20 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="md:hidden btn btn-ghost p-2" onClick={() => setIsNavbarOpen(!isNavbarOpen)}>
              <FaBars className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <FaChartLine className="h-6 w-6" />
              InvestmentHub
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`text-sm font-medium ${item.active ? "underline" : "hover:text-indigo-200"} transition-colors`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {isNavbarOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-indigo-600 shadow-lg p-4 flex flex-col gap-4 z-10">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-sm font-medium ${item.active ? "underline" : "hover:text-indigo-200"}`}
                  onClick={() => setIsNavbarOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          <button className="md:hidden btn btn-ghost p-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <aside
          className={`bg-white shadow-lg p-6 w-72 flex-shrink-0 fixed md:static inset-y-0 left-0 z-10 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300`}
        >
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                <FaChartLine /> Tools
              </h3>
              <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                <FaBars className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <ul className="space-y-3">
              {sidebarItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="w-full flex items-center gap-3 p-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-all shadow-sm"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FaNewspaper className="text-indigo-500" /> News
              </h4>
              {newsItems.map((news, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-700">{news.title}</p>
                  <p className="text-xs text-gray-500">{news.date}</p>
                </div>
              ))}
              <button className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                <FaArrowUp className="h-3 w-3" /> More
              </button>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FaHistory className="text-indigo-500" /> Transactions
              </h4>
              {transactionHistory.map((tx, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{tx.type}</p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                  <p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-green-600" : "text-red-600"}`}>{tx.amount}</p>
                </div>
              ))}
              <button className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                <FaArrowUp className="h-3 w-3" /> More
              </button>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <FaGamepad className="text-indigo-500" /> Virtual Trading
              </h4>
              <div className="bg-gradient-to-r from-indigo-50 to-gray-50 p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-700">Balance</p>
                  <p className="text-sm font-semibold text-indigo-600">{virtualTradingStats.balance}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-700">Gain/Loss</p>
                  <p className={`text-sm font-semibold ${virtualTradingStats.gainLoss.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {virtualTradingStats.gainLoss}
                  </p>
                </div>
              </div>
              <button className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                <FaGamepad className="h-3 w-3" /> Trade Now
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-6 w-full max-w-7xl mx-auto">
          {/* Portfolio Summary */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {portfolioSummary.map((item, index) => (
              <div key={index} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all">
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
            {["overview", "trade", "suggestions", "calculator"].map((tab) => (
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
                <AccountBalance />
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
            {activeTab === "trade" && <TradePanel />}
            {activeTab === "suggestions" && <InvestmentSuggestions />}
            {activeTab === "calculator" && <ProfitCalculator />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-7xl mx-auto">
          <p className="text-sm font-medium">© 2025 InvestPro</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <button className="text-sm hover:underline">Terms</button>
            <button className="text-sm hover:underline">Privacy</button>
            <button className="text-sm hover:underline">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}