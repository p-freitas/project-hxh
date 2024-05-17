import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import Battle from "./pages/Battle";
import Lobby from "./pages/Lobby";
import Login from "./pages/Login";
import PrivateRoute from "./PrivateRoute";
import io from "socket.io-client";
import Teste from "./pages/Teste";
import { AxiosProvider } from "./context/AxiosContext";

const socket = io(`${process.env.REACT_APP_API_BASE_URL}`, {
  transports: ["websocket"],
  reconnection: true,
});
function App() {
  return (
    <div className="App" id="outer-container">
      <AxiosProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/teste" element={<Teste />} />
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Lobby socket={socket} />} />
              <Route path="/battle/*" element={<Battle socket={socket} />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AxiosProvider>
    </div>
  );
}

export default App;
