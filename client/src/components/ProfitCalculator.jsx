export function ProfitCalculator() {
    const [investment, setInvestment] = useState(10000);
    const [monthlyContribution, setMonthlyContribution] = useState(500);
    const [years, setYears] = useState(10);
    const [interestRate, setInterestRate] = useState(7);
  
    const calculateFutureValue = () => {
      const monthlyRate = interestRate / 100 / 12;
      const months = years * 12;
      const initialFV = investment * Math.pow(1 + monthlyRate, months);
      const contributionFV = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      return (initialFV + contributionFV).toFixed(2);
    };
  
    return (
      <div className="card bg-base-100 shadow-md p-4">
        <h3 className="text-lg font-semibold">Profit Calculator</h3>
        <label className="label">Initial Investment</label>
        <input type="number" className="input input-bordered w-full" value={investment} onChange={(e) => setInvestment(e.target.value)} />
        
        <label className="label">Monthly Contribution</label>
        <input type="number" className="input input-bordered w-full" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} />
        
        <label className="label">Years</label>
        <input type="number" className="input input-bordered w-full" value={years} onChange={(e) => setYears(e.target.value)} />
        
        <label className="label">Expected Annual Return (%)</label>
        <input type="number" className="input input-bordered w-full" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
        
        <p className="text-lg font-bold mt-4">Estimated Future Value: ${calculateFutureValue()}</p>
      </div>
    );
  }