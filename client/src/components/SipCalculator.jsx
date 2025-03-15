import React, { useState } from "react";
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
  Filler,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SipCalculator = () => {
  // State for selected investment option
  const [selectedOption, setSelectedOption] = useState("SIP");

  // State for input fields
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000);
  const [totalInvestment, setTotalInvestment] = useState(100000);
  const [stepUpAmount, setStepUpAmount] = useState(100);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  // State for calculation results
  const [result, setResult] = useState(null);
  const [growthData, setGrowthData] = useState([]);

  // Function to format numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Input validation and clamping
  const handleInputChange = (setter, value, min, max) => {
    const numValue = Math.max(min, Math.min(max, Number(value) || min));
    setter(numValue);
  };

  // Calculation logic for all three options
  const calculate = () => {
    const r = expectedReturnRate; // Annual return rate in percentage
    const t = timePeriod; // Time period in years
    const i = r / 100 / 12; // Monthly interest rate
    const n = t * 12; // Total number of months

    let maturityAmount = 0;
    let investedAmount = 0;
    const yearlyGrowth = [];

    if (selectedOption === "SIP") {
      const P = monthlyInvestment;
      let currentValue = 0;
      for (let m = 1; m <= n; m++) {
        currentValue = P * Math.pow(1 + i, m);
        if (m % 12 === 0) {
          yearlyGrowth.push({
            year: m / 12,
            value: currentValue + (yearlyGrowth[m / 12 - 2]?.value || 0),
          });
        }
      }
      maturityAmount = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      investedAmount = P * n;
    } else if (selectedOption === "Lumpsum") {
      const P = totalInvestment;
      for (let y = 1; y <= t; y++) {
        const months = y * 12;
        const value = P * Math.pow(1 + i, months);
        yearlyGrowth.push({ year: y, value });
      }
      maturityAmount = P * Math.pow(1 + i, n);
      investedAmount = P;
    } else if (selectedOption === "StepUpSIP") {
      const S = stepUpAmount;
      const P = monthlyInvestment;
      let currentValue = 0;
      for (let m = 1; m <= n; m++) {
        const year = Math.ceil(m / 12);
        const investment = P + (year - 1) * S;
        currentValue += investment * Math.pow(1 + i, m);
        if (m % 12 === 0) {
          yearlyGrowth.push({ year: m / 12, value: currentValue });
        }
      }
      for (let m = 1; m <= n; m++) {
        const year = Math.ceil(m / 12);
        const investment = P + (year - 1) * S;
        maturityAmount += investment * Math.pow(1 + i, n - m + 1);
        investedAmount += investment;
      }
    }

    const estimatedReturns = maturityAmount - investedAmount;

    setResult({
      investedAmount: investedAmount.toFixed(2),
      estimatedReturns: estimatedReturns.toFixed(2),
      totalValue: maturityAmount.toFixed(2),
    });
    setGrowthData(yearlyGrowth);
  };

  // Chart configuration for investment growth
  const chartData = {
    labels: growthData.map((data) => `Year ${data.year}`),
    datasets: [
      {
        label: "Investment Value",
        data: growthData.map((data) => data.value),
        fill: true,
        backgroundColor: "rgba(34, 197, 94, 0.2)", // Green fill like NIFTY 50 chart
        borderColor: "rgba(34, 197, 94, 1)", // Green line
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) => `₹${formatNumber(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 10,
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (value) => `₹${formatNumber(value)}`,
        },
      },
    },
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            SIP Investment Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Visualize and plan your financial growth with precision
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            {/* Option Selection */}
            <div className="flex justify-center mb-6 space-x-4">
              {["SIP", "Lumpsum", "StepUpSIP"].map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedOption === option
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.replace("SIP", " SIP")}
                </button>
              ))}
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              {selectedOption === "SIP" && (
                <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                  <label className="block text-gray-700 font-medium mb-2">
                    Monthly Investment (₹)
                    <span className="text-xs text-gray-500 ml-2">
                      (Min: ₹100, Max: ₹100,000)
                    </span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="100"
                      max="100000"
                      step="100"
                      value={monthlyInvestment}
                      onChange={(e) =>
                        handleInputChange(setMonthlyInvestment, e.target.value, 100, 100000)
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <input
                      type="number"
                      min="100"
                      max="100000"
                      step="100"
                      value={monthlyInvestment}
                      onChange={(e) =>
                        handleInputChange(setMonthlyInvestment, e.target.value, 100, 100000)
                      }
                      className="w-28 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              {selectedOption === "Lumpsum" && (
                <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                  <label className="block text-gray-700 font-medium mb-2">
                    Total Investment (₹)
                    <span className="text-xs text-gray-500 ml-2">
                      (Min: ₹1,000, Max: ₹10,000,000)
                    </span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1000"
                      max="10000000"
                      step="1000"
                      value={totalInvestment}
                      onChange={(e) =>
                        handleInputChange(setTotalInvestment, e.target.value, 1000, 10000000)
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <input
                      type="number"
                      min="1000"
                      max="10000000"
                      step="1000"
                      value={totalInvestment}
                      onChange={(e) =>
                        handleInputChange(setTotalInvestment, e.target.value, 1000, 10000000)
                      }
                      className="w-28 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              {selectedOption === "StepUpSIP" && (
                <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                  <label className="block text-gray-700 font-medium mb-2">
                    Step-up Amount (₹)
                    <span className="text-xs text-gray-500 ml-2">
                      (Min: ₹0, Max: ₹10,000)
                    </span>
                  </label>
                  <div className="flex items-center space-x-4 mb-4">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="100"
                      value={stepUpAmount}
                      onChange={(e) =>
                        handleInputChange(setStepUpAmount, e.target.value, 0, 10000)
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      step="100"
                      value={stepUpAmount}
                      onChange={(e) =>
                        handleInputChange(setStepUpAmount, e.target.value, 0, 10000)
                      }
                      className="w-28 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Monthly Investment (₹)
                    <span className="text-xs text-gray-500 ml-2">
                      (Min: ₹100, Max: ₹100,000)
                    </span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="100"
                      max="100000"
                      step="100"
                      value={monthlyInvestment}
                      onChange={(e) =>
                        handleInputChange(setMonthlyInvestment, e.target.value, 100, 100000)
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <input
                      type="number"
                      min="100"
                      max="100000"
                      step="100"
                      value={monthlyInvestment}
                      onChange={(e) =>
                        handleInputChange(setMonthlyInvestment, e.target.value, 100, 100000)
                      }
                      className="w-28 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                <label className="block text-gray-700 font-medium mb-2">
                  Expected Return Rate (p.a) (%)
                  <span className="text-xs text-gray-500 ml-2">
                    (Min: 1%, Max: 20%)
                  </span>
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={expectedReturnRate}
                    onChange={(e) =>
                      handleInputChange(setExpectedReturnRate, e.target.value, 1, 20)
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    step="0.1"
                    value={expectedReturnRate}
                    onChange={(e) =>
                      handleInputChange(setExpectedReturnRate, e.target.value, 1, 20)
                    }
                    className="w-28 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                <label className="block text-gray-700 font-medium mb-2">
                  Time Period (years)
                  <span className="text-xs text-gray-500 ml-2">
                    (Min: 1, Max: 30)
                  </span>
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={timePeriod}
                    onChange={(e) =>
                      handleInputChange(setTimePeriod, e.target.value, 1, 30)
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="1"
                    value={timePeriod}
                    onChange={(e) =>
                      handleInputChange(setTimePeriod, e.target.value, 1, 30)
                    }
                    className="w-28 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={calculate}
            >
              Calculate
            </button>
          </div>

          {/* Results and Chart Section */}
          {result && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Investment Summary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Invested Amount</p>
                  <p className="text-xl font-bold text-blue-600">
                    ₹{formatNumber(result.investedAmount)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Estimated Returns</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{formatNumber(result.estimatedReturns)}
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Value</p>
                  <p className="text-xl font-bold text-indigo-600">
                    ₹{formatNumber(result.totalValue)}
                  </p>
                </div>
              </div>
              {/* Growth Chart */}
              {growthData.length > 0 && (
                <div className="w-full h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Powered by xAI | © 2025 All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default SipCalculator;