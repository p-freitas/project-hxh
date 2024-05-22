import React, { useState, useEffect, useRef } from "react";
import ReactDice, { ReactDiceRef } from "react-dice-complete";
import { useLocation, useNavigate } from "react-router-dom";
import "animate.css";
import "./styles.css";
import { motion } from "framer-motion";
import CardsModal from "../../components/CardsModal";
import PointsCounter from "../../components/PointsCounter";
import { useAxios } from "../../context/AxiosContext";
import CardContainer from "./styles";

type RoundResult = {
  id: string;
  score: number;
};

type RoundResultWinner = {
  draw: boolean;
  winner: string;
};

type CardSelectedType = {
  cardCode: string;
  quantity?: string;
  index: number;
};

type BattleResultType = {
  draw: boolean;
  winner: string | undefined;
  loser: string | undefined;
};

const Battle = ({ socket }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxios();
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");
  const reactDicePlayer1 = useRef<ReactDiceRef>(null);
  const reactDicePlayer2 = useRef<ReactDiceRef>(null);

  const [numDice, setNumDice] = useState<number>(1);
  const [numDiceComponent, setNumDiceComponent] = useState<number>(1);
  const [roundResults, setRoundResults] = useState<RoundResult[]>();
  const [roundResultsWinner, setRoundResultsWinner] = useState<
    RoundResultWinner[]
  >([]);
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
  const [battleFinished, setBattleFinished] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<BattleResultType>();
  const [opponentCards, setOpponentCards] = useState<CardSelectedType[]>();
  const [animated, setAnimated] = useState<boolean>(false);
  const [disableCards, setDisableCards] = useState<boolean>(true);
  const [cardPlayed, setCardPlayed] = useState<boolean>(false);
  const [disableStealPlayerCardButton, setDisableStealPlayerCardButton] =
    useState<boolean>(false);
  const [disableGainPackButton, setDisableGainPackButton] =
    useState<boolean>(false);
  const [showPack, setShowPack] = useState<boolean>(false);

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
  const [modalType, setModalType] = useState<string>();

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
        setDisableCards(false);
        setRoundResults(data);
        data?.map((item) => {
          return item.id === userId
            ? setRoundPlayer1Result(item.score)
            : setRoundPlayer2Result(item.score);
        });
        const result = data.reduce<any>(
          (acc, obj) => {
            if (!acc.highestScorer) {
              return { highestScorer: obj, draw: false };
            }

            const accScore = acc.highestScorer.score;
            const objScore = obj.score;

            // Check if both scores are the same
            if (accScore === objScore) {
              return { ...acc, draw: true };
            }

            // Rule 1: Both scores less than 21
            if (accScore <= 21 && objScore <= 21) {
              const accDiff = 21 - accScore;
              const objDiff = 21 - objScore;
              if (objDiff < accDiff) {
                return { highestScorer: obj, draw: false };
              }
            }
            // Rule 2: One score more than 21, the other less than 21
            else if (accScore > 21 && objScore <= 21) {
              return { highestScorer: obj, draw: false };
            } else if (accScore <= 21 && objScore > 21) {
              return acc;
            }
            // Rule 3: Both scores more than 21
            else if (accScore > 21 && objScore > 21) {
              const accDiff = accScore - 21;
              const objDiff = objScore - 21;
              if (objDiff < accDiff) {
                return { highestScorer: obj, draw: false };
              }
            }

            return acc;
          },
          { highestScorer: null, draw: false }
        );

        if (result) {
          const newObj = {
            draw: result.draw,
            winner: result.highestScorer.id,
          };
          setRoundResultsWinner([...roundResultsWinner, newObj]);
        }

        switch (round) {
          case 1:
            result.draw
              ? setPoint1Color("draw")
              : result?.highestScorer?.id === userId
              ? setPoint1Color("winner")
              : setPoint1Color("loser");
            break;
          case 2:
            result.draw
              ? setPoint2Color("draw")
              : result?.highestScorer?.id === userId
              ? setPoint2Color("winner")
              : setPoint2Color("loser");
            break;
          case 3:
            result.draw
              ? setPoint3Color("draw")
              : result?.highestScorer?.id === userId
              ? setPoint3Color("winner")
              : setPoint3Color("loser");
            break;
          case 4:
            result.draw
              ? setPoint4Color("draw")
              : result?.highestScorer?.id === userId
              ? setPoint4Color("winner")
              : setPoint4Color("loser");
            break;
          case 5:
            result.draw
              ? setPoint5Color("draw")
              : result?.highestScorer?.id === userId
              ? setPoint5Color("winner")
              : setPoint5Color("loser");

            setBattleFinished(true);
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
  }, [gameId, roundResultsWinner, socket, userId]);

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
    socket.on("setBattleWinner", (result: BattleResultType) => {
      setBattleResult(result);
    });

    return () => {
      socket.off("setBattleWinner");
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
      setDisableCards(true);
      setHideCard("hide");
      setHideCardPlayer2("hide");
      setCardPlayed(false);
    });

    return () => {
      socket.off("resetRound");
    };
  }, [diceKey, socket]);

  useEffect(() => {
    socket.on("readyToFinishBattle", () => {
      socket.emit("getBattleWinner", gameId, roundResultsWinner);
    });

    return () => {
      socket.off("readyToFinishBattle");
    };
  }, [gameId, roundResultsWinner, socket]);

  const handlePlayRound = () => {
    if (battleFinished) {
      socket.emit("playerReadyToFinishBattle", gameId, userId);
      setWatingPlayersMessagem(true);
      return;
    }

    if (playerAgainMessagem) {
      setDisableCards(true);
      socket.emit("nextRound", gameId, userId, roundResultsWinner);
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
    setCardSelected(undefined);
  };

  const handlePlayCard = () => {
    socket.emit("useCard", gameId, userId, cardSelected?.cardCode);
    setCardSelectedSent(cardSelected);
    setHideCard("show");
    setCardOutAnimation(true);
    setCardPlayed(true);
    setTimeout(() => {
      handleCloseModal();
      setCardSelected(undefined);
      setCardOutAnimation(false);
    }, 300);
  };

  const handleStealPlayCardButton = () => {
    socket.emit(
      "stealPlayerCard",
      gameId,
      userId,
      battleResult?.loser,
      cardSelected?.cardCode
    );
    setTimeout(() => {
      handleCloseModal();
      setCardSelected(undefined);
    }, 300);
  };

  const handleStealPlayerCard = async () => {
    setDisableGainPackButton(true);
    setDisableStealPlayerCardButton(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cards/getOpponentCards`,
        {
          userId: battleResult?.loser,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setOpponentCards(response.data.cards);
        handleOpenModal("opponentCards");
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const handleOpenModal = (type: string) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleGetPacks = () => {
    setDisableStealPlayerCardButton(true);
    setDisableGainPackButton(true);
    socket.emit("gainPacks", userId);

    setShowPack(true);
    setTimeout(() => {
      const myComponent = document.getElementById("pack");
      myComponent?.classList.add("animate__tada");
    }, 1000);
    setTimeout(() => {
      const myComponent = document.getElementById("pack");

      myComponent?.classList.add("animate__backOutDown");
    }, 2500);
    setTimeout(() => {
      setShowPack(false);
    }, 3500);
  };

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
      {!battleResult ? (
        <>
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
                  : battleFinished
                  ? "Terminar a batalha"
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
              onClick={() => handleOpenModal("myCards")}
              disabled={disableCards}
            >
              Cartas de batalha
            </button>
          </div>
        </>
      ) : (
        <div>
          {showPack && (
            <div
              style={{
                height: "100vh",
                alignContent: "center",
              }}
              id="pack"
            >
              <img
                src={require(`../../assets/images/pack.png`)}
                alt="carta"
                className="animate__animated animate__backInDown"
              />
            </div>
          )}

          <div>
            <h1>Resultado da batalha:</h1>
          </div>
          {battleResult.draw ? (
            <div>
              <h1>Empate!</h1>
              <div>
                <button onClick={() => navigate("/")}>Sair da batalha</button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1>
                  {battleResult.winner === userId
                    ? "Você ganhou!"
                    : "Você perdeu :("}
                </h1>
              </div>
              <div>
                {battleResult.winner === userId ? (
                  <>
                    <button
                      onClick={handleStealPlayerCard}
                      disabled={disableStealPlayerCardButton}
                    >
                      Roubar carta do oponente
                    </button>
                    <button
                      onClick={handleGetPacks}
                      disabled={disableGainPackButton}
                    >
                      Receber um pacote
                    </button>
                    <button onClick={() => handleOpenModal("myCards")}>
                      Minhas cartas
                    </button>
                    <button onClick={() => navigate("/")}>
                      Sair da batalha
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate("/")}>
                      Sair da batalha
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
      <CardsModal isOpen={isModalOpen} onClose={handleCloseModal}>
        {modalType === "myCards" ? (
          <div className="cards-container">
            {playerCards?.length === 0 ? (
              <h1>Sem cartas</h1>
            ) : (
              playerCards?.map((card, index) => (
                <CardContainer content={card.quantity} key={index}>
                  <div
                    onClick={() => {
                      if (cardSelected?.index !== index) {
                        return setCardSelected({
                          cardCode: card.cardCode,
                          index: index,
                        });
                      }
                      return setCardSelected(undefined);
                    }}
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
                        boxShadow:
                          index === cardSelected?.index
                            ? "0 0 50px 15px rgb(0 255 14)"
                            : "0px 0px 20px 0 rgb(0 0 0)",
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

                        return index === cardSelected?.index
                          ? //@ts-ignore
                            (myComponent.style.boxShadow =
                              "0 0 50px 15px rgb(0 255 14)")
                          : //@ts-ignore
                            (myComponent.style.boxShadow =
                              "0px 0px 20px 0 rgb(0 0 0)");
                      }}
                      className={`card-container demo ${hideUsingCard} animate__bounceIn ${
                        cardOutAnimation && cardSelected?.index === index
                          ? "animate__fadeOutUp"
                          : ""
                      }`}
                      whileHover={{ scale: 1.5 }}
                      whileTap={{ scale: 1 }}
                      id={`card-container-${card.cardCode}`}
                    >
                      <img
                        src={require(`../../assets/images/${card.cardCode}.png`)}
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
        ) : (
          <div className="cards-container">
            {opponentCards?.length === 0 ? (
              <h1>O oponente não tem cartas</h1>
            ) : (
              opponentCards?.map((card, index) => (
                <CardContainer content={card.quantity} key={index}>
                  <div
                    className={
                      animated
                        ? "animated player-card-container"
                        : " player-card-container"
                    }
                    onMouseMove={(e) => handleMouseMove(e, `card-${index}`)}
                    onMouseOut={() => handleMouseOut(`card-${index}`)}
                    onClick={() => {
                      if (cardSelected?.index !== index) {
                        return setCardSelected({
                          cardCode: card.cardCode,
                          index: index,
                        });
                      }
                      return setCardSelected(undefined);
                    }}
                    id={`card-${index}`}
                  >
                    <motion.div
                      style={{
                        boxShadow:
                          index === cardSelected?.index
                            ? "0 0 50px 15px rgb(0 255 14)"
                            : "0px 0px 20px 0 rgb(0 0 0)",
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

                        return index === cardSelected?.index
                          ? //@ts-ignore
                            (myComponent.style.boxShadow =
                              "0 0 50px 15px rgb(0 255 14)")
                          : //@ts-ignore
                            (myComponent.style.boxShadow =
                              "0px 0px 20px 0 rgb(0 0 0)");
                      }}
                      className={`card-container demo ${hideUsingCard} animate__bounceIn ${
                        cardOutAnimation && cardSelected?.index === index
                          ? "animate__fadeOutUp"
                          : ""
                      }`}
                      whileHover={{ scale: 1.5 }}
                      whileTap={{ scale: 1 }}
                      id={`card-container-${card.cardCode}`}
                    >
                      <img
                        src={require(`../../assets/images/${card.cardCode}.png`)}
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
        )}

        <div className="cards-modal-button-container">
          {modalType === "myCards" ? (
            <button
              onClick={handlePlayCard}
              // @ts-ignore
              disabled={
                opponentCards?.length === 0 || battleResult || cardPlayed
              }
            >
              Jogar carta
            </button>
          ) : (
            <button
              onClick={handleStealPlayCardButton}
              disabled={opponentCards?.length === 0}
            >
              Roubar carta
            </button>
          )}
        </div>
      </CardsModal>
    </div>
  );
};

export default Battle;
