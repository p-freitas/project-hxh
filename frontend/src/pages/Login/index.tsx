// App.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <div>
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
    </div>
  );
};

export default Login;
