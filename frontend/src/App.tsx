import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import Battle from "./pages/Battle";
import Lobby from "./pages/Lobby";
import Login from "./pages/Login";
import PrivateRoute from "./PrivateRoute";
import io from "socket.io-client";
import Teste from "./pages/Teste";

const socket = io("http://192.168.1.2:8080", {
  transports: ["websocket"],
  reconnection: true,
});
function App() {
  return (
    <div className="App" id="outer-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" />
          <Route path="/login" element={<Login />} />
          <Route path="/teste" element={<Teste />} />
          <Route element={<PrivateRoute />}>
            <Route path="/lobby" element={<Lobby socket={socket} />} />
            <Route path="/battle/*" element={<Battle socket={socket} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
