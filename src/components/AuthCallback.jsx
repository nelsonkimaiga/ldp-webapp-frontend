import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthCallback = () => {
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get("token");
    const refreshToken = urlParams.get("refreshToken");

    if (window.opener && accessToken && refreshToken) {
      window.opener.postMessage(
        {
          type: "IDP_AUTH_SUCCESS",
          accessToken,
          refreshToken,
        },
        "https://ldp-webapp-frontend.vercel.app"
      );

      window.close();
    } else {

      window.opener.postMessage(
        {
          type: "IDP_AUTH_ERROR",
          error: "Authentication failed. Tokens not received.",
        },
        "https://ldp-webapp-frontend.vercel.app"
      );
      window.close();
    }
  }, [location]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800">
          Authenticating...
        </h2>
        <p className="mt-4 text-gray-600">
          Please wait while we redirect you. You can close this window now.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;