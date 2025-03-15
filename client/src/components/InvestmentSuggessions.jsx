export function InvestmentSuggestions() {
    const suggestions = [
      { name: "Tech Growth Inc.", ticker: "TGI", price: 142.58, change: 3.2, recommendation: "Strong Buy" },
      { name: "Green Energy Solutions", ticker: "GES", price: 87.32, change: 1.8, recommendation: "Buy" },
      { name: "Healthcare Innovations", ticker: "HCI", price: 213.45, change: 2.5, recommendation: "Buy" }
    ];
  
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Investment Suggestions</h2>
        <p className="text-gray-500">Personalized recommendations based on your risk profile</p>
        <div className="grid gap-4 md:grid-cols-2">
          {suggestions.map((stock) => (
            <div key={stock.ticker} className="card bg-base-100 shadow-md p-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">{stock.name}</h3>
                <FaStar className="text-yellow-400" />
              </div>
              <p className="text-gray-500">{stock.ticker} • ${stock.price}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-green-500 flex items-center">
                  <FaArrowUp className="mr-1" /> {stock.change}%
                </span>
                <span className="font-bold">{stock.recommendation}</span>
              </div>
              <button className="btn btn-primary w-full mt-3">Add to Portfolio</button>
            </div>
          ))}
        </div>
      </div>
    );
  }
  