import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("access_token", token);

      navigate("/dashboard");
    } else {
      navigate("/?error=auth_failed");
    }
  }, [location, navigate]);

  return <p>Processing login...</p>;
};

export default AuthCallback;