import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { FaChartLine, FaBars, FaNewspaper, FaHistory, FaGamepad } from "react-icons/fa";

export function Layout() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", active: true },
    { label: "Profile", path: "/profile", active: false },
    { label: "Logout", path: "/logout", active: false },
  ];

  const sidebarItems = [
    { label: "News", icon: <FaNewspaper className="h-5 w-5 text-indigo-500" />, path: "/news", active: true },
    { label: "History", icon: <FaHistory className="h-5 w-5 text-indigo-500" />, action: () => alert("Transaction History section coming soon!") },
    { label: "Virtual Trading", icon: <FaGamepad className="h-5 w-5 text-indigo-500" />, path: "/VirtualMarket", active: true },
  ];

  const newsItems = [
    { title: "Market Hits Record High", date: "Mar 15, 2025" },
    { title: "Tech Stocks Surge", date: "Mar 14, 2025" },
  ];

  const transactionHistory = [
    { type: "Buy AAPL", amount: "-$913.15", date: "Mar 12, 2025" },
    { type: "Deposit", amount: "+$2,000.00", date: "Mar 10, 2025" },
  ];

  const virtualTradingStats = { balance: "$10,000.00", gainLoss: "+5.2%" };

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
              InvestPro
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
                  {item.path ? (
                    <Link
                      to={item.path}
                      className="w-full flex items-center gap-3 p-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-all shadow-sm"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-indigo-100 hover:text-indigo-600 rounded-lg transition-all shadow-sm"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  )}
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
                <FaNewspaper className="h-3 w-3" /> More
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
                  <p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {tx.amount}
                  </p>
                </div>
              ))}
              <button className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                <FaHistory className="h-3 w-3" /> More
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

        {/* Main Content Area */}
        <div className="flex-1 p-6 w-full max-w-7xl mx-auto">
          <Outlet />
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