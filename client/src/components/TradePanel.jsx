import { useState } from "react";
import { FaSearch, FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";

export function TradePanel() {
  const [orderType, setOrderType] = useState("market");
  const [tradeAction, setTradeAction] = useState("buy");
  const [quantity, setQuantity] = useState("1");
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Order submitted: ${tradeAction} ${quantity} shares of ${symbol || "selected stock"} at ${orderType === "market" ? "market price" : "$" + price}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Trade Securities</h2>
      <p className="text-gray-500">Buy and sell stocks, bonds, and other securities</p>
      
      <div className="card bg-base-100 shadow-md p-4">
        <h3 className="text-lg font-semibold">Place Order</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="label">Stock Symbol</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
            <input type="text" placeholder="Enter stock symbol" className="input input-bordered w-full pl-10" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
          </div>

          <label className="label">Action</label>
          <div className="flex gap-4">
            <button type="button" className={`btn ${tradeAction === "buy" ? "btn-primary" : "btn-outline"}`} onClick={() => setTradeAction("buy")}>Buy</button>
            <button type="button" className={`btn ${tradeAction === "sell" ? "btn-error" : "btn-outline"}`} onClick={() => setTradeAction("sell")}>Sell</button>
          </div>

          <label className="label">Quantity</label>
          <input type="number" className="input input-bordered w-full" value={quantity} onChange={(e) => setQuantity(e.target.value)} />

          {orderType !== "market" && (
            <>
              <label className="label">Price ($)</label>
              <input type="number" className="input input-bordered w-full" value={price} onChange={(e) => setPrice(e.target.value)} />
            </>
          )}

          <button type="submit" className="btn btn-success w-full">{tradeAction === "buy" ? "Buy" : "Sell"} {quantity} Shares</button>
        </form>
      </div>
    </div>
  );
}
