import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the user_id from localStorage
    localStorage.removeItem("user_id");

    // Redirect to the loading page
    navigate("/landing");
  }, [navigate]);

  return null;
};

export default Logout;
