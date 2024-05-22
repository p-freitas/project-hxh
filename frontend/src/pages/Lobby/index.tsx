// App.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "animate.css";
import "./styles.css";
import { useAxios } from "../../context/AxiosContext";
import PackOpening from "../../components/PackOpening";

type packsType = {
  packType: string;
  quantity: number;
};

type UserPacksType = {
  packs: packsType[];
  total: number;
};

const Lobby = ({ socket }: any) => {
  const navigate = useNavigate();
  const axios = useAxios();

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const [watingPlayersMessagem, setWatingPlayersMessagem] =
    useState<boolean>(false);
  const [playButtonDisabled, setPlayButtonDisabled] = useState<boolean>(false);
  const [showPackOpening, setShowPackOpening] = useState<boolean>(false);
  const [userPacks, setUserPacks] = useState<UserPacksType>();

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

  const getUserPacks = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/getUserPacks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setUserPacks(response.data);
      }
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

  const handlePackButtonClick = () => {
    setShowPackOpening(!showPackOpening);
  };

  const handleOpenPacks = (
    cards: string[],
    openAll: boolean,
    packType: string
  ) => {
    socket.emit("openPack", userId, cards, openAll, packType);
  };

  useEffect(() => {
    validateToken();
    getUserPacks();
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

  useEffect(() => {
    socket.on("updatedPacks", (packs: any) => {
      setUserPacks(packs);
    });

    return () => {
      socket.off("updatedPacks");
    };
  }, [navigate, socket]);

  return (
    <>
      <button onClick={handleNewGame} disabled={playButtonDisabled}>
        Play
      </button>
      {userPacks && (
        <button onClick={handlePackButtonClick} disabled={userPacks?.total < 1}>
          {`Abrir pacotes (${userPacks?.total})`}
        </button>
      )}

      {watingPlayersMessagem && (
        <>
          <p>Aguardando jogadores...</p>
          <button onClick={cancelMatchMaking}>Cancelar</button>
        </>
      )}
      {showPackOpening && userPacks && (
        <PackOpening
          userPacks={userPacks}
          setShowPackOpening={setShowPackOpening}
          handleOpenPacks={handleOpenPacks}
          showPackOpening={showPackOpening}
        />
      )}
    </>
  );
};

export default Lobby;
