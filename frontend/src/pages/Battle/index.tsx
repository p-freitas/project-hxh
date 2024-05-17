import React, { useState, useEffect, useRef } from "react";
import ReactDice, { ReactDiceRef } from "react-dice-complete";
import { useLocation } from "react-router-dom";
import "animate.css";
import "./styles.css";
import { motion } from "framer-motion";
import CardsModal from "../../components/CardsModal";
import PointsCounter from "../../components/PointsCounter";
import { useAxios } from "../../context/AxiosContext";

type RoundResult = {
  id: string;
  score: number;
};

type CardSelectedType = {
  cardCode: string;
  quantity?: string;
  index: number;
};

type Accumulator = {
  highestScorer: RoundResult | null;
  highestScore: number;
  draw: boolean;
};

const Battle = ({ socket }: any) => {
  const location = useLocation();
  const axios = useAxios();
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");
  const reactDicePlayer1 = useRef<ReactDiceRef>(null);
  const reactDicePlayer2 = useRef<ReactDiceRef>(null);

  const [numDice, setNumDice] = useState<number>(1);
  const [numDiceComponent, setNumDiceComponent] = useState<number>(1);
  const [roundResults, setRoundResults] = useState<RoundResult[]>();
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [roundPlayer1Result, setRoundPlayer1Result] = useState<number>();
  const [roundPlayer2Result, setRoundPlayer2Result] = useState<number>();
  const [animationClassPlayer1, setAnimationClassPlayer1] = useState<string>();
  const [animationClassPlayer2, setAnimationClassPlayer2] = useState<string>();
  const [isDicesVisisbleClassPlayer1, setIsDicesVisisbleClassPlayer1] =
    useState<string>("hide");
  const [isDicesVisisbleClassPlayer2, setIsDicesVisisbleClassPlayer2] =
    useState<string>("hide");
  const [playerRoundButtonPressed, setPlayerRoundButtonPressed] =
    useState<boolean>(false);
  const [player2DiceNumber, setPlayer2DiceNumber] = useState<number>(0);
  const [gameId, setGameId] = useState<string>();
  const [watingPlayersMessagem, setWatingPlayersMessagem] =
    useState<boolean>(false);
  const [disablePlayButton, setDisablePlayButton] = useState<boolean>(false);
  const [disableButton, setDisableButton] = useState<boolean>(false);
  const [playerAgainMessagem, setPlayerAgainMessagem] =
    useState<boolean>(false);
  const [hideCard, setHideCard] = useState<string>("hide");
  const [hideCardPlayer2, setHideCardPlayer2] = useState<string>("hide");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hideUsingCard, setHideUsingCard] = useState<string>("show-card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardSelected, setCardSelected] = useState<CardSelectedType>();
  const [cardSelectedSent, setCardSelectedSent] = useState<
    CardSelectedType | undefined
  >();
  const [oponentSelectedCard, setOponentSelectedCard] = useState<string>();
  const [cardOutAnimation, setCardOutAnimation] = useState<boolean>();
  const [playersReady, setPlayersReady] = useState<boolean>(false);
  const [point1Color, setPoint1Color] = useState<string>();
  const [point2Color, setPoint2Color] = useState<string>();
  const [point3Color, setPoint3Color] = useState<string>();
  const [point4Color, setPoint4Color] = useState<string>();
  const [point5Color, setPoint5Color] = useState<string>();
  const [diceKey, setDiceKey] = useState<number>(0);
  const [playerCards, setPlayerCard] = useState<CardSelectedType[]>();

  const getPlayerCards = async () => {
    try {
      const response = await axios.get(
        "http://192.168.1.2:8080/users/getUserCards",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Server response:", response.data);
      if (response.status === 200) {
        setPlayerCard(response.data.cards);
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  useEffect(() => {
    getPlayerCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setGameId(location.pathname.split("/")[2]);
  }, [location.pathname]);

  useEffect(() => {
    socket.on("updatedCards", (cards: any) => {
      setPlayerCard(cards);
      console.log("cards::", cards);
    });

    return () => {
      socket.off("updatedCards");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("ready", () => {
      setPlayersReady(true);
      rollPlayer1Dices(undefined);
    });

    return () => {
      socket.off("ready");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("playersRolled", (gameId: string) => {
      socket.emit("getPlayer2Dices", gameId, userId);
    });

    return () => {
      socket.off("playersRolled");
    };
  }, [socket, userId]);

  useEffect(() => {
    socket.on("rollPlayer2Dices", (player2Dices: number[]) => {
      if (player2Dices.length >= 1) {
        setPlayer2DiceNumber(player2Dices.length);
        rollPlayer2Dices(player2Dices);
      }
    });

    return () => {
      socket.off("rollPlayer2Dices");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("setRoundResult", (data: RoundResult[], round: number) => {
      setTimeout(() => {
        setRoundResults(data);
        data?.map((item) => {
          return item.id === userId
            ? setRoundPlayer1Result(item.score)
            : setRoundPlayer2Result(item.score);
        });
        const highestScorer = data.reduce<Accumulator>(
          (acc, obj) => {
            if (obj.score > acc.highestScore) {
              return {
                highestScorer: obj,
                highestScore: obj.score,
                draw: false,
              };
            } else if (obj.score === acc.highestScore) {
              return { ...acc, draw: true };
            } else {
              return acc;
            }
          },
          { highestScorer: null, highestScore: -Infinity, draw: false }
        );

        switch (round) {
          case 1:
            highestScorer.draw
              ? setPoint1Color("draw")
              : highestScorer?.highestScorer?.id === userId
              ? setPoint1Color("winner")
              : setPoint1Color("loser");
            break;
          case 2:
            highestScorer.draw
              ? setPoint2Color("draw")
              : highestScorer?.highestScorer?.id === userId
              ? setPoint2Color("winner")
              : setPoint2Color("loser");
            break;
          case 3:
            highestScorer.draw
              ? setPoint3Color("draw")
              : highestScorer?.highestScorer?.id === userId
              ? setPoint3Color("winner")
              : setPoint3Color("loser");
            break;
          case 4:
            highestScorer.draw
              ? setPoint4Color("draw")
              : highestScorer?.highestScorer?.id === userId
              ? setPoint4Color("winner")
              : setPoint4Color("loser");
            break;
          case 5:
            highestScorer.draw
              ? setPoint5Color("draw")
              : highestScorer?.highestScorer?.id === userId
              ? setPoint5Color("winner")
              : setPoint5Color("loser");
            break;

          default:
            break;
        }

        setWatingPlayersMessagem(false);
        setPlayerAgainMessagem(true);
        setDisablePlayButton(false);
      }, 2200);
      setPlayerRoundButtonPressed(false);
    });

    return () => {
      socket.off("setRoundResult");
    };
  }, [socket, userId]);

  useEffect(() => {
    socket.on("cardResult", (data: any) => {
      if (data.dicesChanged.status === true) {
        const index = data.array.findIndex(
          (obj: { id: string | null }) => obj.id === userId
        );
        if (data.playerAffected === userId) {
          setNumDiceComponent(data.array[index].dices.length);
          rollPlayer1Dices(data.array[index].dices);
        } else {
          const player2index = index === 0 ? 1 : 0;
          setPlayer2DiceNumber(data.array[player2index].dices.length);
          rollPlayer2Dices(data.array[player2index].dices);
        }
        socket.emit("getRoundResult", gameId, userId, true);
      }
    });

    return () => {
      socket.off("cardResult");
    };
  }, [gameId, socket, userId]);

  useEffect(() => {
    socket.on("oponentCard", (card: string) => {
      setHideCardPlayer2("show");
      setOponentSelectedCard(card);
    });

    return () => {
      socket.off("oponentCard");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("resetRound", (round: number) => {
      setRoundNumber(round);
      setRoundResults([]);
      setWatingPlayersMessagem(false);
      setPlayerAgainMessagem(false);
      setIsDicesVisisbleClassPlayer2("hide");
      setIsDicesVisisbleClassPlayer1("hide");
      setAnimationClassPlayer1("");
      setAnimationClassPlayer2("");
      setDisableButton(false);
      setNumDice(1);
      setNumDiceComponent(1);
      setPlayerRoundButtonPressed(false);
      setPlayersReady(false);
      setDiceKey(diceKey + 1);
    });

    return () => {
      socket.off("resetRound");
    };
  }, [diceKey, socket]);

  const handlePlayRound = () => {
    if (playerAgainMessagem) {
      socket.emit("nextRound", gameId, userId);
      setWatingPlayersMessagem(true);
      return;
    }

    setNumDiceComponent(numDice);
    setPlayerRoundButtonPressed(true);
    setDisablePlayButton(true);
    setDisableButton(true);
    setWatingPlayersMessagem(true);
    socket.emit("playerIsReady", gameId, userId, true);
  };

  const rollDonePlayer1 = (totalValue: number, values: number[]) => {
    if (playerRoundButtonPressed && playersReady) {
      socket.emit("playerDices", gameId, userId, values);
      setAnimationClassPlayer1("");
    }
  };

  const rollDonePlayer2 = (totalValue: number, values: number[]) => {
    if (playerRoundButtonPressed && playersReady) {
      setAnimationClassPlayer2("");
      socket.emit("getRoundResult", gameId, userId, false);
    }
  };

  const rollPlayer1Dices = (player1Dices: number[] | undefined) => {
    setAnimationClassPlayer1("");
    setIsDicesVisisbleClassPlayer1("show");
    reactDicePlayer1.current?.rollAll(
      player1Dices !== undefined ? player1Dices : undefined
    );
    setAnimationClassPlayer1("animate__backInUp");
  };

  const rollPlayer2Dices = (player2Dices: number[]) => {
    setTimeout(() => {
      reactDicePlayer2.current?.rollAll(player2Dices);
      setAnimationClassPlayer2("");
      setAnimationClassPlayer2("animate__backInDown");
      setIsDicesVisisbleClassPlayer2("show");
    }, 100);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePlayCard = () => {
    socket.emit("useCard", gameId, userId, cardSelected?.cardCode);
    setCardSelectedSent(cardSelected);
    setHideCard("show");
    setCardOutAnimation(true);
    setTimeout(() => {
      handleCloseModal();
      setCardSelected(undefined);
    }, 300);
  };

  console.log("playerCards::", playerCards);

  return (
    <div className="battle-container">
      <div className="round-counter">
        <h2>Round {roundNumber}/5</h2>
        <PointsCounter
          roundNumber={roundNumber}
          pointsColor={[
            point1Color,
            point2Color,
            point3Color,
            point4Color,
            point5Color,
          ]}
        />
      </div>
      <div className="player2-container">
        <div
          className={`animate__animated playersDices player2-dices ${animationClassPlayer2} ${isDicesVisisbleClassPlayer2}`}
          key={diceKey}
        >
          <ReactDice
            rollTime={2}
            defaultRoll={1}
            numDice={player2DiceNumber}
            ref={reactDicePlayer2}
            disableIndividual
            faceColor="#ffffff"
            dotColor="#000000"
            dieCornerRadius={10}
            outline
            rollDone={rollDonePlayer2}
          />
        </div>
      </div>

      <div className="results-container">
        {roundResults && roundResults?.length > 0 && (
          <div className="results-inner-container">
            <div className="results-card">
              {oponentSelectedCard !== undefined && (
                <img
                  src={require(`../../assets/images/${oponentSelectedCard}.png`)}
                  alt="carta"
                  className={`scale-on-hover animate__backInDown ${hideCardPlayer2}`}
                />
              )}
            </div>
            <div className="results-score-container">
              <h1>{roundPlayer2Result}</h1>
              <h2>X</h2>
              <h1>{roundPlayer1Result}</h1>
            </div>
            <div className="results-card">
              {cardSelectedSent?.cardCode !== undefined && (
                <img
                  src={require(`../../assets/images/${cardSelectedSent?.cardCode}.png`)}
                  alt="carta"
                  className={`animate__backInUp scale-on-hover ${hideCard}`}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="player-container">
        <div
          className={`animate__animated playersDices player1-dices ${animationClassPlayer1} ${isDicesVisisbleClassPlayer1}`}
          key={diceKey}
        >
          <ReactDice
            rollTime={2}
            defaultRoll={1}
            numDice={numDiceComponent}
            ref={reactDicePlayer1}
            disableIndividual
            faceColor="#ffffff"
            dotColor="#000000"
            dieCornerRadius={10}
            outline
            rollDone={rollDonePlayer1}
          />
        </div>
        <div className="battle-dices-inputs player1">
          <button
            onClick={() => numDice !== 1 && setNumDice(numDice - 1)}
            disabled={disableButton}
            className="battle-dices-input-buttons"
          >
            -
          </button>
          <button
            onClick={handlePlayRound}
            disabled={disablePlayButton || watingPlayersMessagem}
          >
            {watingPlayersMessagem
              ? "Aguardando o outro jogador..."
              : playerAgainMessagem
              ? "Próximo round"
              : `Jogar ${numDice} dados`}
          </button>
          <button
            onClick={() => numDice !== 10 && setNumDice(numDice + 1)}
            disabled={disableButton}
            className="battle-dices-input-buttons"
          >
            +
          </button>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          // disabled={disableButton}
          // className="battle-dices-input-buttons"
        >
          Cartas de batalha
        </button>
      </div>
      <CardsModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="cards-container">
          {playerCards?.length === 0 ? (
            <h1>Sem cartas</h1>
          ) : (
            playerCards?.map((card, index) => (
              <>
                <style>
                  {`
                  .card:after {
                    content: '${card.quantity}';
                    
                  }
                `}
                </style>
                <div
                  className="player-card-container"
                  style={{
                    borderColor:
                      index === cardSelected?.index ? "greenyellow" : "black",
                  }}
                  key={index}
                  onClick={() => {
                    if (cardSelected?.index !== index) {
                      return setCardSelected({
                        cardCode: card.cardCode,
                        index: index,
                      });
                    }
                    return setCardSelected(undefined);
                  }}
                >
                  <motion.div
                    className={`card ${hideUsingCard} animate__bounceIn ${
                      cardOutAnimation && cardSelected?.index === index
                        ? "animate__fadeOutUp"
                        : ""
                    }`}
                    whileHover={{ scale: 1.5 }}
                    whileTap={{ scale: 1 }}
                    id={card.cardCode}
                  >
                    <motion.img
                      src={require(`../../assets/images/${card.cardCode}.png`)}
                      alt="carta"
                      drag
                      dragSnapToOrigin
                      dragTransition={{
                        bounceStiffness: 300,
                        bounceDamping: 20,
                      }}
                      whileDrag={{ scale: 1 }}
                    />
                  </motion.div>
                </div>
              </>
            ))
          )}
        </div>
        <div className="cards-modal-button-container">
          <button onClick={handlePlayCard} disabled={playerCards?.length === 0}>
            Jogar carta
          </button>
        </div>
      </CardsModal>
    </div>
  );
};

export default Battle;
