import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [claims, setClaims] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/"); // redirect if no token
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setClaims(decoded);
    } catch (err) {
      console.error("Invalid token", err);
      navigate("/");
    }
  }, [navigate]);

  if (!claims) return <p>Loading dashboard...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>
      <p><strong>Welcome:</strong> {claims.email}</p>
      <p><strong>Role:</strong> {claims.role}</p>

      {claims.role === "Admin" ? (
        <div style={{ color: "darkred" }}>
          <h3>Admin Controls</h3>
          <p>You can manage users, settings, and more.</p>
        </div>
      ) : (
        <div style={{ color: "green" }}>
          <h3>User Panel</h3>
          <p>You can view your profile and access resources.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
