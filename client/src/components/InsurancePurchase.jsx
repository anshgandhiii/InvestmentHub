// InsurancePurchase.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const InsurancePurchase = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const userId = localStorage.getItem("user_id");

  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/investment/mock-insurance/", {
          headers: { "User-Id": userId },
        });
        setPlans(response.data);
      } catch (error) {
        console.error("Error fetching insurance plans:", error);
      }
    };
    if (userId) fetchPlans();
  }, [userId]);

  const handleBuy = () => setShowConfirm(true);

  const confirmPurchase = async () => {
    setShowConfirm(false);
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/investment/mock-insurance/",
        { user_id: userId, plan_id: selectedPlan.id, quantity },
        { headers: { "User-Id": userId } }
      );
      console.log("Purchase response:", response.data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error purchasing insurance:", error);
      alert("Purchase failed: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-6 bg-white rounded-xl shadow-lg font-sans">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Buy Insurance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedPlan?.id === plan.id ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            <h3 className="text-lg font-medium text-gray-700">{plan.name}</h3>
            <p className="text-gray-600">Category: {plan.category.charAt(0).toUpperCase() + plan.category.slice(1)}</p>
            <p className="text-gray-600">Price: ₹{formatNumber(plan.price)}</p>
            <p className="text-gray-600">Risk Level: {plan.risk_level.charAt(0).toUpperCase() + plan.risk_level.slice(1)}</p>
            <p className="text-gray-600">Term: {plan.term_years} years</p>
            <p className="text-gray-600">Premium: {plan.premium_frequency.charAt(0).toUpperCase() + plan.premium_frequency.slice(1)}</p>
            <p className="text-gray-600">Coverage: ₹{formatNumber(plan.coverage_amount)}</p>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">Selected Plan: {selectedPlan.name}</h3>
          <label className="block text-sm font-medium text-gray-700 mt-2">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
            className="mt-1 w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-2 text-gray-700">
            Total Cost: ₹{formatNumber((selectedPlan.price * quantity).toFixed(2))}
          </p>
          <button
            onClick={handleBuy}
            className="mt-4 w-40 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            Buy Now
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800">Confirm Purchase</h3>
            <p className="mt-2 text-gray-600">
              Buy {quantity} unit(s) of {selectedPlan.name} for ₹{formatNumber((selectedPlan.price * quantity).toFixed(2))}?
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmPurchase}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <p className="font-semibold">Purchase Successful!</p>
          <p>₹{formatNumber((selectedPlan.price * quantity).toFixed(2))} invested in {selectedPlan.name}.</p>
        </div>
      )}
    </div>
  );
};

export default InsurancePurchase;