import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import { ProfitCalculator } from "./components/ProfitCalculator";
import { AccountBalance } from "./components/AccountBalance";
import { InvestmentSuggestions } from "./components/InvestmentSuggessions";
import { TradePanel } from "./components/TradePanel";
import Profile from "./components/Profile";
import LandingPage from "./components/Landing";
import Login from "./components/Login";
import Signup from "./components/SIgnup";

function App() {
  return (
    <Router>
          <main className="content flex-grow p-4">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/landing" replace />} />
            </Routes>
          </main>
    </Router>
  );
}

export default App;
