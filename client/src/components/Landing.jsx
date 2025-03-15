import { useState } from "react";
import { Link } from "react-router-dom";
import { FaChartLine, FaDollarSign, FaChartBar, FaChartPie, FaBars, FaArrowRight } from "react-icons/fa";

export default function LandingPage() {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const navItems = [
    { label: "Home", path: "/", active: true },
    { label: "Features", path: "#features", active: false },
    { label: "About", path: "#about", active: false },
    { label: "Contact", path: "#contact", active: false },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg px-4 py-3 sticky top-0 z-20 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden btn btn-ghost p-2"
              onClick={() => setIsNavbarOpen(!isNavbarOpen)}
            >
              <FaBars className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <FaChartLine className="h-6 w-6" />
              InvestmentHub
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.path}
                className={`text-sm font-medium ${item.active ? "underline" : "hover:text-indigo-200"} transition-colors`}
              >
                {item.label}
              </a>
            ))}
            <Link to="/login" className="btn bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100">
              Login
            </Link>
            <Link to="/signup" className="btn bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-800">
              Sign Up
            </Link>
          </div>
          {isNavbarOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-indigo-600 shadow-lg p-4 flex flex-col gap-4 z-10">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.path}
                  className={`text-sm font-medium ${item.active ? "underline" : "hover:text-indigo-200"}`}
                  onClick={() => setIsNavbarOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/login"
                className="btn bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100"
                onClick={() => setIsNavbarOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-800"
                onClick={() => setIsNavbarOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-b from-indigo-50 to-gray-50">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Take Control of Your Investments
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
          Manage your portfolio, track performance, and explore opportunities with InvestmentHub – your all-in-one financial dashboard.
        </p>
        <div className="flex gap-4">
          <Link to="/signup" className="btn bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            Get Started <FaArrowRight />
          </Link>
          <Link to="/dashboard" className="btn bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300">
            View Demo
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Why Choose InvestmentHub?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <FaDollarSign className="h-10 w-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Portfolio Management</h3>
              <p className="text-gray-600">
                Monitor your stocks, bonds, and insurance in one place with real-time updates.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <FaChartBar className="h-10 w-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Tracking</h3>
              <p className="text-gray-600">
                Visualize your gains and losses with intuitive charts and insights.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
              <FaChartPie className="h-10 w-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Investment Suggestions</h3>
              <p className="text-gray-600">
                Get personalized recommendations to optimize your portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Us</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            InvestmentHub is designed to empower individuals to make informed financial decisions. Our mission is to simplify investing with cutting-edge tools and a user-friendly experience.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Investing?</h2>
          <p className="text-lg mb-8">Join thousands of users who trust InvestmentHub to grow their wealth.</p>
          <Link to="/signup" className="btn bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-100 flex items-center gap-2 mx-auto w-fit">
            Sign Up Now <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white w-full">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm font-medium">© 2025 InvestmentHub</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#terms" className="text-sm hover:underline">Terms</a>
            <a href="#privacy" className="text-sm hover:underline">Privacy</a>
            <a href="mailto:support@investmenthub.com" className="text-sm hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}