import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout"; // Import the new Layout component
import Dashboard from "./components/Dashboard";
import News from "./components/news";
import Profile from "./components/Profile";
import LandingPage from "./components/Landing";
import Login from "./components/Login";
import Signup from "./components/SIgnup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />}>
          <Route path="landing" element={<LandingPage />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="news" element={<News />} />
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;