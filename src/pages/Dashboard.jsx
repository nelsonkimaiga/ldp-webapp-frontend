import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const CLIENT_BASE_URL = "https://gfgp.ai/client-api";

const Dashboard = () => {
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  const validateAndRefreshToken = async () => {
    let token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!token || !refreshToken) return logout();

    try {
      const decoded = jwtDecode(token);
      const expiry = decoded.exp * 1000;

      if (Date.now() > expiry) {
        // Token expired → refresh
        const res = await fetch(`${CLIENT_BASE_URL}/api/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        });

        if (!res.ok) return logout();

        const data = await res.json();
        localStorage.setItem("access_token", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refresh_token", data.refreshToken);
        token = data.accessToken;
      }

      setClaims(jwtDecode(token));
    } catch (err) {
      console.error("Token validation failed", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateAndRefreshToken();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!claims) return <p>Redirecting to login...</p>;

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

      <button
        onClick={logout}
        style={{
          marginTop: "2rem",
          padding: "0.5rem 1rem",
          backgroundColor: "gray",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;