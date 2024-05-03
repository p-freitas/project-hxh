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
      const response = await axios.post("http://192.168.1.2:8080/users/login", {
        userName: userName,
        password: password,
      });
      console.log("Server response:", response.data);
      if (response.status === 200) {
        sessionStorage.setItem('userId', response.data.userId)
        navigate("/lobby");
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
