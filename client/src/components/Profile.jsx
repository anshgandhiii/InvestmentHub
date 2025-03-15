import { useState } from "react";
import { FaUser, FaCreditCard, FaKey, FaSignOutAlt, FaEnvelope, FaPhone, FaLock, FaPalette } from "react-icons/fa";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Changes saved successfully!");
  };

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      alert("Signed out!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="navbar bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <a href="/" className="flex items-center gap-2 text-xl font-bold">
            <FaUser className="h-6 w-6" />
            InvestPro
          </a>
          <nav className="ml-auto flex gap-4">
            <a href="/dashboard" className="btn btn-ghost btn-sm text-white hover:text-indigo-200">Dashboard</a>
            <a href="/profile" className="btn btn-ghost btn-sm text-white underline">Profile</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Card */}
            <div className="card w-full md:w-1/3 bg-white shadow-xl rounded-xl p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-indigo-500 ring-offset-2">
                    <img src="https://via.placeholder.com/96" alt="Profile" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">John Doe</h2>
                <p className="text-sm text-indigo-600 font-semibold">Premium Investor</p>
                <div className="space-y-3 w-full">
                  <p className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FaUser className="text-indigo-500" /> Since March 2023
                  </p>
                  <p className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FaCreditCard className="text-indigo-500" /> Premium Plan
                  </p>
                </div>
                <button
                  className="btn btn-outline btn-error w-full mt-4 flex items-center justify-center gap-2"
                  onClick={handleSignOut}
                >
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            </div>

            {/* Tabs and Content */}
            <div className="w-full md:w-2/3 space-y-6">
              {/* Tabs */}
              <div className="tabs bg-white rounded-xl shadow-md p-3 flex gap-3">
                {["personal", "security", "preferences"].map((tab) => (
                  <button
                    key={tab}
                    className={`tab px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === tab ? "bg-indigo-600 text-white shadow-md" : "text-gray-600 hover:bg-indigo-50"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "personal" && <FaUser className="inline mr-2" />}
                    {tab === "security" && <FaKey className="inline mr-2" />}
                    {tab === "preferences" && <FaPalette className="inline mr-2" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="card bg-white shadow-xl rounded-xl p-6">
                {activeTab === "personal" && (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FaUser className="text-indigo-500" /> Personal Info
                      </h2>
                      <button
                        className="btn btn-sm btn-outline flex items-center gap-2"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? "Cancel" : <><FaKey className="h-4 w-4" /> Edit</>}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="label text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaUser className="text-indigo-500" /> First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          className="input input-bordered w-full bg-gray-50"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="label text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaUser className="text-indigo-500" /> Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          className="input input-bordered w-full bg-gray-50"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="label text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaEnvelope className="text-indigo-500" /> Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          className="input input-bordered w-full bg-gray-50"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="label text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaPhone className="text-indigo-500" /> Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          className="input input-bordered w-full bg-gray-50"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <button className="btn btn-primary mt-6 w-full" onClick={handleSave}>
                        Save Changes
                      </button>
                    )}
                  </>
                )}

                {activeTab === "security" && (
                  <>
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaKey className="text-indigo-500" /> Security
                    </h2>
                    <div className="space-y-6 mt-6">
                      <div>
                        <label className="label text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaLock className="text-indigo-500" /> Current Password
                        </label>
                        <input type="password" className="input input-bordered w-full bg-gray-50" />
                      </div>
                      <div>
                        <label className="label text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaLock className="text-indigo-500" /> New Password
                        </label>
                        <input type="password" className="input input-bordered w-full bg-gray-50" />
                      </div>
                      <div>
                        <label className="label text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaLock className="text-indigo-500" /> Confirm New Password
                        </label>
                        <input type="password" className="input input-bordered w-full bg-gray-50" />
                      </div>
                      <button className="btn btn-primary w-full">Update Password</button>
                    </div>
                  </>
                )}

                {activeTab === "preferences" && (
                  <>
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FaPalette className="text-indigo-500" /> Preferences
                    </h2>
                    <div className="space-y-6 mt-6">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaPalette className="text-indigo-500" /> Dark Mode
                        </label>
                        <input type="checkbox" className="toggle toggle-primary" />
                      </div>
                      <div>
                        <label className="label text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaEnvelope className="text-indigo-500" /> Email Notifications
                        </label>
                        <select className="select select-bordered w-full bg-gray-50">
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                          <option>Never</option>
                        </select>
                      </div>
                      <button className="btn btn-primary w-full">Save Preferences</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-medium">© 2025 InvestPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}