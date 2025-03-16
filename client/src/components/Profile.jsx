import { useState, useEffect } from "react";
import { FaUser, FaCreditCard, FaKey, FaSignOutAlt, FaEnvelope, FaHistory } from "react-icons/fa";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [userId, setUserId] = useState(null);

  // Fetch profile and transactions
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      setUserId(storedUserId);
    }

    const fetchProfile = async () => {
      if (!storedUserId) return;
      try {
        const response = await fetch(`http://127.0.0.1:8000/user/profile/${storedUserId}`);
        if (!response.ok) throw new Error("Failed to fetch profile");
        const data = await response.json();
        setProfile(data);
        setFormData({
          email: data.email,
          risk_tolerance: data.risk_tolerance,
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const fetchTransactions = async () => {
      if (!storedUserId) return;
      try {
        const response = await fetch(`http://127.0.0.1:8000/investment/transactions/${storedUserId}/`);
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchProfile();
    fetchTransactions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userId) {
      alert("No user ID found");
      return;
    }
    try {
      const updatedProfile = { ...profile, ...formData };
      const response = await fetch(`http://127.0.0.1:8000/user/profile/${userId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      const data = await response.json();
      setProfile(data);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("userId"); // Clear userId on sign out
      alert("Signed out!");
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-xl font-semibold text-indigo-600">
            <FaUser className="h-6 w-6" />
            InvestmentHub
          </a>
          <nav className="flex gap-6">
            <a href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Dashboard
            </a>
            <a href="/profile" className="text-indigo-600 font-medium border-b-2 border-indigo-600">
              Profile
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src="https://picsum.photos/200"
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{profile.user.username}</h2>
                <div className="w-full space-y-3 text-gray-600">
                  {[
                    { label: "Balance", value: profile.balance },
                    { label: "Bought Sum", value: profile.boughtsum },
                    { label: "Stocks", value: profile.stocks },
                    { label: "Bonds", value: profile.bonds },
                    { label: "Insurance", value: profile.insurance },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{item.label}:</span>
                      <span className="font-medium">${item.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  onClick={handleSignOut}
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex flex-wrap gap-2">
                {["personal", "transactions", "security"].map((tab) => (
                  <button
                    key={tab}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "personal" && <FaUser />}
                    {tab === "transactions" && <FaHistory />}
                    {tab === "security" && <FaKey />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                    <button
                      className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaEnvelope className="text-indigo-500" /> Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaUser className="text-indigo-500" /> Risk Tolerance
                      </label>
                      <select
                        name="risk_tolerance"
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        value={formData.risk_tolerance || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              )}

              {activeTab === "transactions" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-gray-600">
                          <th className="p-3">Asset</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map((txn) => (
                            <tr key={txn.id} className="border-t hover:bg-gray-50">
                              <td className="p-3">{txn.asset_symbol}</td>
                              <td className="p-3">{txn.transaction_type}</td>
                              <td className="p-3">{txn.quantity}</td>
                              <td className="p-3">${txn.price}</td>
                              <td className="p-3">${txn.amount}</td>
                              <td className="p-3">{new Date(txn.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-3 text-center text-gray-500">
                              No transactions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
                  <div className="space-y-4">
                    {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                      <div key={label} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaCreditCard className="text-indigo-500" /> {label}
                        </label>
                        <input
                          type="password"
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    ))}
                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}