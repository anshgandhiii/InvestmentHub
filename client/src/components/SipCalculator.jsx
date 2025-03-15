import React, { useState } from "react";

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

  // Function to format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

    if (selectedOption === "SIP") {
      const P = monthlyInvestment;
      maturityAmount = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      investedAmount = P * n;
    } else if (selectedOption === "Lumpsum") {
      const P = totalInvestment;
      maturityAmount = P * Math.pow(1 + i, n);
      investedAmount = P;
    } else if (selectedOption === "StepUpSIP") {
      const S = stepUpAmount;
      const P = monthlyInvestment;
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
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-xl shadow-2xl border border-gray-100 font-sans">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">SIP Calculator</h1>
        <p className="text-gray-500 text-sm">Plan your investments with precision</p>
      </div>

      {/* Option Selection */}
      <div className="flex justify-center mb-8 space-x-4">
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
              <span className="text-xs text-gray-500 ml-2">(Min: ₹100, Max: ₹100,000)</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={monthlyInvestment}
                onChange={(e) => handleInputChange(setMonthlyInvestment, e.target.value, 100, 100000)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="number"
                min="100"
                max="100000"
                step="100"
                value={monthlyInvestment}
                onChange={(e) => handleInputChange(setMonthlyInvestment, e.target.value, 100, 100000)}
                className="w-24 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        {selectedOption === "Lumpsum" && (
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block text-gray-700 font-medium mb-2">
              Total Investment (₹)
              <span className="text-xs text-gray-500 ml-2">(Min: ₹1,000, Max: ₹10,000,000)</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1000"
                max="10000000"
                step="1000"
                value={totalInvestment}
                onChange={(e) => handleInputChange(setTotalInvestment, e.target.value, 1000, 10000000)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="number"
                min="1000"
                max="10000000"
                step="1000"
                value={totalInvestment}
                onChange={(e) => handleInputChange(setTotalInvestment, e.target.value, 1000, 10000000)}
                className="w-24 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        {selectedOption === "StepUpSIP" && (
          <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
            <label className="block text-gray-700 font-medium mb-2">
              Step-up Amount (₹)
              <span className="text-xs text-gray-500 ml-2">(Min: ₹0, Max: ₹10,000)</span>
            </label>
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={stepUpAmount}
                onChange={(e) => handleInputChange(setStepUpAmount, e.target.value, 0, 10000)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="number"
                min="0"
                max="10000"
                step="100"
                value={stepUpAmount}
                onChange={(e) => handleInputChange(setStepUpAmount, e.target.value, 0, 10000)}
                className="w-24 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <label className="block text-gray-700 font-medium mb-2">
              Monthly Investment (₹)
              <span className="text-xs text-gray-500 ml-2">(Min: ₹100, Max: ₹100,000)</span>
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={monthlyInvestment}
                onChange={(e) => handleInputChange(setMonthlyInvestment, e.target.value, 100, 100000)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <input
                type="number"
                min="100"
                max="100000"
                step="100"
                value={monthlyInvestment}
                onChange={(e) => handleInputChange(setMonthlyInvestment, e.target.value, 100, 100000)}
                className="w-24 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
        <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
          <label className="block text-gray-700 font-medium mb-2">
            Expected Return Rate (p.a) (%)
            <span className="text-xs text-gray-500 ml-2">(Min: 1%, Max: 20%)</span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="20"
              step="0.1"
              value={expectedReturnRate}
              onChange={(e) => handleInputChange(setExpectedReturnRate, e.target.value, 1, 20)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <input
              type="number"
              min="1"
              max="20"
              step="0.1"
              value={expectedReturnRate}
              onChange={(e) => handleInputChange(setExpectedReturnRate, e.target.value, 1, 20)}
              className="w-24 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
          <label className="block text-gray-700 font-medium mb-2">
            Time Period (years)
            <span className="text-xs text-gray-500 ml-2">(Min: 1, Max: 30)</span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={timePeriod}
              onChange={(e) => handleInputChange(setTimePeriod, e.target.value, 1, 30)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <input
              type="number"
              min="1"
              max="30"
              step="1"
              value={timePeriod}
              onChange={(e) => handleInputChange(setTimePeriod, e.target.value, 1, 30)}
              className="w-24 p-2 border border-gray-300 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        className="w-full max-w-xs mx-auto mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={calculate}
      >
        Calculate
      </button>

      {/* Results Display with Invest Button */}
      {result && (
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Investment Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Invested Amount:</span>
              <span className="font-bold text-blue-600">₹{formatNumber(result.investedAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Estimated Returns:</span>
              <span className="font-bold text-green-600">₹{formatNumber(result.estimatedReturns)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Total Value:</span>
              <span className="font-bold text-indigo-600">₹{formatNumber(result.totalValue)}</span>
            </div>
          </div>
          <button
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg shadow-md hover:from-green-700 hover:to-teal-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={() => alert("Investment processed! Redirecting to payment gateway...")}
          >
            Invest Now
          </button>
          <button
            className="w-full mt-2 px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={() => alert("Results exported as PDF!")}
          >
            Export Results
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-6 text-gray-500 text-xs">
        Powered by xAI | © 2025 All Rights Reserved
      </div>
    </div>
  );
};

export default SipCalculator;