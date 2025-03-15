import { useState } from "react";
import { FaChartLine, FaDollarSign, FaArrowUp, FaArrowDown, FaChartBar, FaChartPie } from "react-icons/fa";
import { TradePanel } from "./TradePanel";
import { InvestmentSuggestions } from "./InvestmentSuggessions";
import SipCalculator from "./SipCalculator"
import { AccountBalance } from "./AccountBalance";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const portfolioSummary = [
    { title: "Portfolio", value: "$45,231.89", icon: <FaDollarSign className="h-6 w-6 text-indigo-500" />, trend: "+20.1%", trendIcon: <FaArrowUp className="h-4 w-4 text-green-500" />, trendColor: "bg-green-100 text-green-600" },
    { title: "Stocks", value: "$28,566.00", icon: <FaChartLine className="h-6 w-6 text-indigo-500" />, trend: "+12.5%", trendIcon: <FaArrowUp className="h-4 w-4 text-green-500" />, trendColor: "bg-green-100 text-green-600" },
    { title: "Bonds", value: "$12,543.00", icon: <FaChartBar className="h-6 w-6 text-indigo-500" />, trend: "+4.3%", trendIcon: <FaArrowUp className="h-4 w-4 text-green-500" />, trendColor: "bg-green-100 text-green-600" },
    { title: "Insurance", value: "$4,122.89", icon: <FaChartPie className="h-6 w-6 text-indigo-500" />, trend: "-2.5%", trendIcon: <FaArrowDown className="h-4 w-4 text-red-500" />, trendColor: "bg-red-100 text-red-600" },
  ];

  return (
    <>
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
        {["overview", "trade", "suggestions", "SIP"].map((tab) => (
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
        {activeTab === "SIP" && <SipCalculator />}
      </div>
    </>
  );
}