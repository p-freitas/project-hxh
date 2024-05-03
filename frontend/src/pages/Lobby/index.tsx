// App.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "animate.css";
import "./styles.css";

const Lobby = ({ socket }: any) => {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  const handleNewGame = async () => {
    try {
      socket.emit("matchMaking");
    } catch (error) {
      console.error("Error playing round:", error);
    }
  };

  useEffect(() => {
    socket.on("createNewGame", () => {
      console.log("Aguardando jogador...");
    });
  }, [socket]);

  useEffect(() => {
    socket.on("joinExistingGame", (gameId: string) => {
      try {
        socket.emit("createGame", gameId, userId);
      } catch (error) {
        console.error(error);
      }
    });

    return () => {
      socket.off("joinExistingGame");
    };
  }, [socket, userId]);

  useEffect(() => {
    socket.on("gameCreated", (gameId: string) => {
      console.log("gameCreated::");

      socket.emit("joinGame", gameId, userId);
    });

    return () => {
      socket.off("gameCreated");
    };
  }, [socket, userId]);

  useEffect(() => {
    socket.on("joinedGame", (gameId: string) => {
      navigate(`/battle/${gameId}`);
    });

    return () => {
      socket.off("joinedGame");
    };
  }, [navigate, socket]);

  return <button onClick={handleNewGame}>Play</button>;
};

export default Lobby;
