// App.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "animate.css";
import "./styles.css";
import { useAxios } from "../../context/AxiosContext";

const Lobby = ({ socket }: any) => {
  const navigate = useNavigate();
  const axios = useAxios();

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const [watingPlayersMessagem, setWatingPlayersMessagem] =
    useState<boolean>(false);
  const [playButtonDisabled, setPlayButtonDisabled] = useState<boolean>(false);

  const validateToken = async () => {
    try {
      await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/validateToken`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const handleNewGame = () => {
    setWatingPlayersMessagem(true);
    setPlayButtonDisabled(true);
    try {
      setTimeout(() => {
        socket.emit("matchMaking");
      }, 1000);
    } catch (error) {
      console.error("Error playing round:", error);
    }
  };

  const cancelMatchMaking = () => {
    try {
      socket.emit("cancelMatchMaking");
      setWatingPlayersMessagem(false);
      setPlayButtonDisabled(false);
    } catch (error) {
      console.error("Error playing round:", error);
    }
  };

  useEffect(() => {
    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on("createNewGame", () => {
      setWatingPlayersMessagem(true);
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
      socket.emit("joinGame", gameId, userId);
    });

    return () => {
      socket.off("gameCreated");
    };
  }, [socket, userId]);

  useEffect(() => {
    socket.on("joinedGame", (gameId: string) => {
      setWatingPlayersMessagem(false);
      navigate(`/battle/${gameId}`);
    });

    return () => {
      socket.off("joinedGame");
    };
  }, [navigate, socket]);

  return (
    <>
      <button onClick={handleNewGame} disabled={playButtonDisabled}>
        Play
      </button>
      {watingPlayersMessagem && (
        <>
          <p>Aguardando jogadores...</p>
          <button onClick={cancelMatchMaking}>Cancelar</button>
        </>
      )}
    </>
  );
};

export default Lobby;
