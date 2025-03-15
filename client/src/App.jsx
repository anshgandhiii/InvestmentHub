import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./components/Dashboard";
import News from "./components/news";
import Profile from "./components/Profile";
import LandingPage from "./components/Landing";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { StockDetail } from "./components/StockDetail";
import PrivateRoute from "./components/PrivateRoute"; 
import Logout from "./components/Logout";
import { BondDetail } from "./components/BondDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="landing" element={<LandingPage />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="stock/:symbol" element={<StockDetail />} />
        <Route path="bond/:symbol" element={<BondDetail />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected routes wrapped inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="news"
            element={
              <PrivateRoute>
                <News />
              </PrivateRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
