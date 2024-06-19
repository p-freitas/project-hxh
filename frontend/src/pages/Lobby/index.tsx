// App.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "animate.css";
import "./styles.css";
import { useAxios } from "../../context/AxiosContext";
import PackOpening from "../../components/PackOpening";
import CardsModal from "../../components/CardsModal";
import CardContainer from "../Battle/styles";
import { motion } from "framer-motion";
import CardsSelectionModal from "../../components/CardsSelectionModal";

type packsType = {
  packType: string;
  quantity: number;
};

type UserPacksType = {
  packs: packsType[];
  total: number;
};

type CardSelectedType = {
  cardCode: string;
  quantity: number;
  index: number;
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerCards, setPlayerCard] = useState<CardSelectedType[]>();
  const [animated, setAnimated] = useState<boolean>(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [openCardSeletionModal, setOpenCardSeletionModal] = useState(false);
  const [selectedCardsArray, setSelectedCardsArray] =
    useState<CardSelectedType[]>();

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

  const handleMouseMove = (
    e: React.MouseEvent | React.TouchEvent,
    cardId: any
  ) => {
    const card = document.getElementById(cardId);

    if (!card) return;

    const rect = card.getBoundingClientRect();
    const pos = {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };

    const l = pos.x;
    const t = pos.y;
    const h = card.offsetHeight;
    const w = card.offsetWidth;
    const px = Math.abs(Math.floor((100 / w) * l) - 100);
    const py = Math.abs(Math.floor((100 / h) * t) - 100);
    const lp = 50 + (px - 50) / 1.5;
    const tp = 50 + (py - 50) / 1.5;
    const ty = ((tp - 40) / 2) * -1;
    const tx = ((lp - 40) / 1.5) * 0.5;
    const tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg);`;

    card.setAttribute("style", tf);
    setAnimated(false);
  };

  const handleMouseOut = (cardId: any) => {
    const card = document.getElementById(cardId);
    if (!card) return;

    card.style.transform = "";
  };

  useEffect(() => {
    validateToken();
    getPlayerCards();
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
        socket.emit("createGame", gameId, userId, selectedCardsArray);
      } catch (error) {
        console.error(error);
      }
    });

    return () => {
      socket.off("joinExistingGame");
    };
  }, [selectedCardsArray, socket, userId]);

  useEffect(() => {
    socket.on("gameCreated", (gameId: string) => {
      socket.emit("joinGame", gameId, userId, selectedCardsArray);
    });

    return () => {
      socket.off("gameCreated");
    };
  }, [selectedCardsArray, socket, userId]);

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getPlayerCards = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/getUserCards`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPlayerCard(response.data.cards);
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="lobby-container">
      <button
        onClick={() => setOpenCardSeletionModal(true)}
        disabled={playButtonDisabled}
      >
        Play
      </button>
      {userPacks && (
        <button onClick={handlePackButtonClick} disabled={userPacks?.total < 1}>
          {`Abrir pacotes (${userPacks?.total})`}
        </button>
      )}

      <button onClick={() => handleOpenModal()}>Cartas de batalha</button>

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
          getUserPacks={getUserPacks}
        />
      )}

      <CardsSelectionModal
        isOpen={openCardSeletionModal}
        onClose={() => setOpenCardSeletionModal(false)}
        isClosing={isClosingModal}
        setIsClosing={setIsClosingModal}
        playerCards={playerCards}
        setPlayerCard={setPlayerCard}
        selectedCardsArray={selectedCardsArray}
        setSelectedCardsArray={setSelectedCardsArray}
        handleNewGame={handleNewGame}
        watingPlayersMessagem={watingPlayersMessagem}
        cancelMatchMaking={cancelMatchMaking}
      />

      <CardsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isClosing={isClosingModal}
        setIsClosing={setIsClosingModal}
      >
        <div className="cards-container">
          {playerCards?.length === 0 ? (
            <h1>Sem cartas</h1>
          ) : (
            playerCards?.map((card, index) => (
              <CardContainer content={`${card.quantity}`} key={index}>
                <div
                  onMouseMove={(e) => handleMouseMove(e, `card-${index}`)}
                  onMouseOut={() => handleMouseOut(`card-${index}`)}
                  className={
                    animated
                      ? "animated player-card-container"
                      : " player-card-container"
                  }
                  id={`card-${index}`}
                >
                  <motion.div
                    style={{
                      boxShadow: "0px 0px 20px 0 rgb(0 0 0)",
                    }}
                    onHoverStart={() => {
                      const myComponent = document.getElementById(
                        `card-container-${card.cardCode}`
                      );
                      //@ts-ignore
                      myComponent.style.boxShadow =
                        "0px 0px 20px 5px rgb(0 225 255)";
                    }}
                    // @ts-ignore
                    onMouseLeave={() => {
                      const myComponent = document.getElementById(
                        `card-container-${card.cardCode}`
                      );

                      //@ts-ignore
                      return (myComponent.style.boxShadow =
                        "0px 0px 20px 0 rgb(0 0 0)");
                    }}
                    className={`card-container demo animate__bounceIn lobby-card-container`}
                    whileHover={{ scale: 1.5 }}
                    id={`card-container-${card.cardCode}`}
                  >
                    <img
                      src={require(`../../assets/images/${card.cardCode}.svg`)}
                      alt="carta"
                      id="card"
                      className="card card-content"
                    />
                  </motion.div>
                </div>
              </CardContainer>
            ))
          )}
        </div>
      </CardsModal>
    </div>
  );
};

export default Lobby;
