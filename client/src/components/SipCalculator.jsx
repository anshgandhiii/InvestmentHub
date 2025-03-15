import React, { useState } from 'react';

const SipCalculator = () => {
  // State for selected investment option
  const [selectedOption, setSelectedOption] = useState('SIP');

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
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Calculation logic for all three options
  const calculate = () => {
    const r = expectedReturnRate; // Annual return rate in percentage
    const t = timePeriod; // Time period in years
    const i = r / 100 / 12; // Monthly interest rate
    const n = t * 12; // Total number of months

    let maturityAmount = 0;
    let investedAmount = 0;

    if (selectedOption === 'SIP') {
      const P = monthlyInvestment;
      maturityAmount = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      investedAmount = P * n;
    } else if (selectedOption === 'Lumpsum') {
      const P = totalInvestment;
      maturityAmount = P * Math.pow(1 + i, n);
      investedAmount = P;
    } else if (selectedOption === 'StepUpSIP') {
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
    <div className="max-w-[600px] mx-auto my-12 p-5 bg-white rounded-lg shadow-lg font-sans">
      {/* Option Selection */}
      <div className="flex justify-center mb-5">
        <button
          onClick={() => setSelectedOption('SIP')}
          className={`px-5 py-2 mx-1 border-2 border-blue-600 rounded-md cursor-pointer ${
            selectedOption === 'SIP' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
          } hover:bg-blue-100`}
        >
          SIP
        </button>
        <button
          onClick={() => setSelectedOption('Lumpsum')}
          className={`px-5 py-2 mx-1 border-2 border-blue-600 rounded-md cursor-pointer ${
            selectedOption === 'Lumpsum' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
          } hover:bg-blue-100`}
        >
          Lumpsum
        </button>
        <button
          onClick={() => setSelectedOption('StepUpSIP')}
          className={`px-5 py-2 mx-1 border-2 border-blue-600 rounded-md cursor-pointer ${
            selectedOption === 'StepUpSIP' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
          } hover:bg-blue-100`}
        >
          Step-up SIP
        </button>
      </div>

      {/* Input Fields */}
      <div className="inputs">
        {selectedOption === 'SIP' && (
          <label className="flex items-center my-4 text-gray-700">
            Monthly Investment (₹)
            <input
              type="range"
              min="100"
              max="100000"
              step="100"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-3/5 mx-2"
            />
            <input
              type="number"
              min="100"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-24 p-1 border border-blue-600 rounded text-right"
            />
          </label>
        )}
        {selectedOption === 'Lumpsum' && (
          <label className="flex items-center my-4 text-gray-700">
            Total Investment (₹)
            <input
              type="range"
              min="1000"
              max="10000000"
              step="1000"
              value={totalInvestment}
              onChange={(e) => setTotalInvestment(Number(e.target.value))}
              className="w-3/5 mx-2"
            />
            <input
              type="number"
              min="1000"
              value={totalInvestment}
              onChange={(e) => setTotalInvestment(Number(e.target.value))}
              className="w-24 p-1 border border-blue-600 rounded text-right"
            />
          </label>
        )}
        {selectedOption === 'StepUpSIP' && (
          <>
            <label className="flex items-center my-4 text-gray-700">
              Step-up Amount (₹)
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={stepUpAmount}
                onChange={(e) => setStepUpAmount(Number(e.target.value))}
                className="w-3/5 mx-2"
              />
              <input
                type="number"
                min="0"
                value={stepUpAmount}
                onChange={(e) => setStepUpAmount(Number(e.target.value))}
                className="w-24 p-1 border border-blue-600 rounded text-right"
              />
            </label>
            <label className="flex items-center my-4 text-gray-700">
              Monthly Investment (₹)
              <input
                type="range"
                min="100"
                max="100000"
                step="100"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-3/5 mx-2"
              />
              <input
                type="number"
                min="100"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-24 p-1 border border-blue-600 rounded text-right"
              />
            </label>
          </>
        )}
        <label className="flex items-center my-4 text-gray-700">
          Expected Return Rate (p.a) (%)
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={expectedReturnRate}
            onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
            className="w-3/5 mx-2"
          />
          <input
            type="number"
            min="1"
            step="0.1"
            value={expectedReturnRate}
            onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
            className="w-24 p-1 border border-blue-600 rounded text-right"
          />
        </label>
        <label className="flex items-center my-4 text-gray-700">
          Time Period (years)
          <input
            type="range"
            min="1"
            max="30"
            step="1"
            value={timePeriod}
            onChange={(e) => setTimePeriod(Number(e.target.value))}
            className="w-3/5 mx-2"
          />
          <input
            type="number"
            min="1"
            value={timePeriod}
            onChange={(e) => setTimePeriod(Number(e.target.value))}
            className="w-24 p-1 border border-blue-600 rounded text-right"
          />
        </label>
      </div>

      {/* Calculate Button */}
      <button
        className="block w-36 mx-auto my-5 p-2 bg-blue-600 text-white border-none rounded-md cursor-pointer hover:bg-blue-700"
        onClick={calculate}
      >
        Calculate
      </button>

      {/* Results Display with Invest Button */}
      {result && (
        <div className="mt-5 p-4 bg-blue-50 rounded-md">
          <div className="my-2 text-lg text-gray-700">
            <span className="font-bold text-blue-600 mr-2">Invested Amount:</span> ₹
            {formatNumber(result.investedAmount)}
          </div>
          <div className="my-2 text-lg text-gray-700">
            <span className="font-bold text-blue-600 mr-2">Estimated Returns:</span> ₹
            {formatNumber(result.estimatedReturns)}
          </div>
          <div className="my-2 text-lg text-gray-700">
            <span className="font-bold text-blue-600 mr-2">Total Value:</span> ₹
            {formatNumber(result.totalValue)}
          </div>
          <button
            className="block w-36 mx-auto my-5 p-2 bg-blue-600 text-white border-none rounded-md cursor-pointer hover:bg-blue-700"
            onClick={() => alert("Money invested.")}
          >
            Invest Now
          </button>
        </div>
      )}
    </div>
  );
};

export default SipCalculator;