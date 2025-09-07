import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CLIENT_BASE_URL = "https://gfgp.ai/client-api";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
  };

  const fetchDashboard = async () => {
    let token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!token || !refreshToken) return logout();

    try {
      // Call user/admin dashboard based on role
      const endpoint = token.includes("ADMIN")
        ? "/api/v1/admin/dashboard"
        : "/api/v1/user/dashboard";

      const res = await fetch(`${CLIENT_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        // Token might be expired → refresh
        const refreshRes = await fetch(`${CLIENT_BASE_URL}/api/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshRes.ok) return logout();

        const data = await refreshRes.json();
        localStorage.setItem("access_token", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refresh_token", data.refreshToken);
        token = data.accessToken;

        // Retry dashboard fetch
        return fetchDashboard();
      }

      const data = await res.text();
      setUserData({ message: data });
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!userData) return <p>Redirecting to login...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Dashboard</h2>
      <p><strong>Welcome:</strong> {userData.email}</p>
      <p><strong>Message:</strong> {userData.message}</p>

      {userData.roles.includes("ROLE_ADMIN") ? (
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