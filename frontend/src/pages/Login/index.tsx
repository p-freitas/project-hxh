// App.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "./styles.css";

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/users/login`,
        {
          userName: userName,
          password: password,
        }
      );
      console.log("Server response:", response.data);
      if (response.status === 200) {
        sessionStorage.setItem("userId", response.data.userId);
        sessionStorage.setItem("token", response.data.accessToken);
        navigate("/");
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const handleSuccess = async (credentialResponse: any) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/users/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: credentialResponse.credential }),
    })
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("token", data.accessToken);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error during Google login:", error);
      });
  };

  // const handleError = (errorResponse: any) => {
  //   console.error("Google login failed", errorResponse);
  // };

  console.log("process. env. NODE_ENV::", process.env.NODE_ENV);

  return (
    <div className="login-page-container">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log("Login Failed");
        }}
        auto_select
      />
      {process.env.NODE_ENV === "development" && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="nameInput">Usuário:</label>
          <input
            type="text"
            id="nameInput"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <label htmlFor="passwordInput">Senha:</label>
          <input
            type="password"
            id="passwordInput"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default Login;
