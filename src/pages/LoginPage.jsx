import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

function LoginPage() {
  const [activeTab, setActiveTab] = useState("legacy");
  const [legacyEmail, setLegacyEmail] = useState("");
  const [legacyPassword, setLegacyPassword] = useState("");
  const [legacyResponse, setLegacyResponse] = useState(null);
  const [idpResponse, setIdpResponse] = useState(null);

  const BASE_URL = "https://gfgp.ai/api";
  const HTML_WIDGET_URL = "https://nelsonkimaiga.github.io/idp-auth-widget/index.html";

  // Handle legacy login
  const handleLegacyLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: legacyEmail, password: legacyPassword }),
      });
      const data = await res.json();
      setLegacyResponse(data);
    } catch (err) {
      setLegacyResponse({ error: err.message });
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "https://nelsonkimaiga.github.io") return;

      if (event.data.type === "IDP_AUTH_SUCCESS") {
        const { accessToken, refreshToken } = event.data;
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        // Decode the token to extract claims
        const decoded = jwtDecode(accessToken);

        setIdpResponse({
          accessToken,
          refreshToken,
          claims: decoded,
        });
      }

      if (event.data.type === "IDP_AUTH_ERROR") {
        setIdpResponse({ error: event.data.error });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Choose Login Method</h2>

      {/* Tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "legacy" ? "active" : ""}`}
            onClick={() => setActiveTab("legacy")}
          >
            Legacy Login
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "idp" ? "active" : ""}`}
            onClick={() => setActiveTab("idp")}
          >
            IdP Login
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content mt-3">
        {activeTab === "legacy" && (
          <div>
            <form onSubmit={handleLegacyLogin}>
              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={legacyEmail}
                  onChange={(e) => setLegacyEmail(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={legacyPassword}
                  onChange={(e) => setLegacyPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Login (Legacy)
              </button>
            </form>
            {legacyResponse && (
              <pre className="mt-3">
                {JSON.stringify(legacyResponse, null, 2)}
              </pre>
            )}
          </div>
        )}

        {activeTab === "idp" && (
          <div className="text-center">
            <p>Authenticate via centralized Identity Provider</p>
            <iframe
              src={HTML_WIDGET_URL}
              title="IdP Auth Widget"
              style={{
                width: "100%",
                maxWidth: "400px",
                height: "500px",
                border: "none",
              }}
            />
            {idpResponse && (
              <pre className="mt-3">
                {JSON.stringify(idpResponse, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;