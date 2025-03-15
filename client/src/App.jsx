import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import { ProfitCalculator } from "./components/ProfitCalculator";
import { AccountBalance } from "./components/AccountBalance";
import { InvestmentSuggestions } from "./components/InvestmentSuggessions";
import { TradePanel } from "./components/TradePanel";
import Profile from "./components/Profile";

function App() {
  return (
    <Router>
          <main className="content flex-grow p-4">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
    </Router>
  );
}

export default App;
