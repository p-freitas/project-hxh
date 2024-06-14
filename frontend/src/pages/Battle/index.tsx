import React, { useState, useEffect, useRef } from "react";
import ReactDice, { ReactDiceRef } from "react-dice-complete";
import { useLocation, useNavigate } from "react-router-dom";
import "animate.css";
import "./styles.css";
import { motion, PanInfo } from "framer-motion";
import CardsModal from "../../components/CardsModal";
import PointsCounter from "../../components/PointsCounter";
import { useAxios } from "../../context/AxiosContext";
import CardContainer from "./styles";
import CircularProgressBar from "../../components/CircularProgressBar";
import { ReactComponent as MyIcon } from "../../assets/images/01.svg";

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
  const [point6Color, setPoint6Color] = useState<string>();
  const [point7Color, setPoint7Color] = useState<string>();
  const [diceKey, setDiceKey] = useState<number>(0);
  const [playerCards, setPlayerCard] = useState<CardSelectedType[]>();
  const [battleFinished, setBattleFinished] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<BattleResultType>();
  const [opponentCards, setOpponentCards] = useState<CardSelectedType[]>();
  const [selectedStolenCard, setSelectedStolenCard] =
    useState<CardSelectedType>();
  const [animated, setAnimated] = useState<boolean>(false);
  const [disableCards, setDisableCards] = useState<boolean>(true);
  const [cardPlayed, setCardPlayed] = useState<boolean>(false);
  const [disableStealPlayerCardButton, setDisableStealPlayerCardButton] =
    useState<boolean>(false);
  const [disableGainPackButton, setDisableGainPackButton] =
    useState<boolean>(false);
  const [showPack, setShowPack] = useState<boolean>(false);
  const [showStoledCard, setShowStoledCard] = useState<boolean>(false);
  const [roundAlreadyPlayed, setRoundAlreadyPlayed] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(60000);
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [inactiveCounter, setInactiveCounter] = useState<number>(0);
  const [roundSelectedNumber, setRoundSelectedNumber] = useState<number>();
  const [dragStart, setDragStart] = useState<number>();
  const [startDrag, setStartDrag] = useState<boolean>(true);
  const [scaled, setScaled] = useState(false);

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
    socket.emit("joinGameAgain", location.pathname.split("/")[2], userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.emit("getSelectedRandomNumber", location.pathname.split("/")[2]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on("setSelectedRandomNumber", (number: number) => {
      setRoundSelectedNumber(number);
    });

    return () => {
      socket.off("setSelectedRandomNumber");
    };
  }, [socket]);

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
    socket.on(
      "setRoundResult",
      (data: RoundResult[], round: number, hostId: string) => {
        setTimeout(
          () => {
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

                if (roundSelectedNumber) {
                  // Rule 1: Both scores less than roundSelectedNumber
                  if (
                    accScore <= roundSelectedNumber &&
                    objScore <= roundSelectedNumber
                  ) {
                    const accDiff = roundSelectedNumber - accScore;
                    const objDiff = roundSelectedNumber - objScore;
                    if (objDiff < accDiff) {
                      return { highestScorer: obj, draw: false };
                    }
                  }
                  // Rule 2: One score more than roundSelectedNumber, the other less than roundSelectedNumber
                  else if (
                    accScore > roundSelectedNumber &&
                    objScore <= roundSelectedNumber
                  ) {
                    return { highestScorer: obj, draw: false };
                  } else if (
                    accScore <= roundSelectedNumber &&
                    objScore > roundSelectedNumber
                  ) {
                    return acc;
                  }
                  // Rule 3: Both scores more than roundSelectedNumber
                  else if (
                    accScore > roundSelectedNumber &&
                    objScore > roundSelectedNumber
                  ) {
                    const accDiff = accScore - roundSelectedNumber;
                    const objDiff = objScore - roundSelectedNumber;
                    if (objDiff < accDiff) {
                      return { highestScorer: obj, draw: false };
                    }
                  }
                }

                return acc;
              },
              { highestScorer: null, draw: false }
            );

            // if (result && hostId === userId) {
            if (!roundAlreadyPlayed) {
              const newObj = {
                draw: result.draw,
                winner: result.highestScorer.id,
                round: roundNumber,
              };
              setRoundResultsWinner([...roundResultsWinner, newObj]);
              setRoundAlreadyPlayed(true);
            } else {
              // @ts-ignore
              setRoundResultsWinner(roundResultsWinner.pop());
              const newObj = {
                draw: result.draw,
                winner: result.highestScorer.id,
                round: roundNumber,
              };
              setRoundResultsWinner([...roundResultsWinner, newObj]);
            }
            // }

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
                break;
              case 6:
                result.draw
                  ? setPoint6Color("draw")
                  : result?.highestScorer?.id === userId
                  ? setPoint6Color("winner")
                  : setPoint6Color("loser");

                break;
              case 7:
                result.draw
                  ? setPoint7Color("draw")
                  : result?.highestScorer?.id === userId
                  ? setPoint7Color("winner")
                  : setPoint7Color("loser");
                setBattleFinished(true);
                break;

              default:
                break;
            }

            setWatingPlayersMessagem(false);
            setPlayerAgainMessagem(true);
            setDisablePlayButton(false);
            setShowTimer(true);
          },
          !cardPlayed ? 2200 : 0
        );
        setPlayerRoundButtonPressed(false);
      }
    );

    return () => {
      socket.off("setRoundResult");
    };
  }, [
    cardPlayed,
    gameId,
    roundAlreadyPlayed,
    roundNumber,
    roundResultsWinner,
    roundSelectedNumber,
    socket,
    userId,
  ]);

  useEffect(() => {
    socket.on("cardResult", (data: any) => {
      if (data.dicesChanged.status === true) {
        if (data.playerAffected === userId) {
          data.dicesChanged.dices.forEach((element: number) => {
            const diceElement = document.querySelectorAll(
              `.player-container .die-container .roll${element}`
            );
            const index = data.dicesChanged.lastDice
              ? diceElement.length - 1
              : 0;
            if (diceElement && diceElement[index]?.parentElement) {
              //@ts-ignore
              diceElement[index].parentElement.classList.add("dimmed");
              //@ts-ignore
              diceElement[index].parentElement.classList.add(
                "animate__animated"
              );
              //@ts-ignore
              diceElement[index].parentElement.classList.add(
                "animate__heartBeat"
              );

              // Criação da nova estrutura HTML
              const burnElement = document.createElement("div");
              burnElement.className = "burn";
              burnElement.innerHTML = `
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                    `;
              //@ts-ignore
              diceElement[index].parentElement.appendChild(burnElement);
            }
          });
        } else {
          data.dicesChanged.dices.forEach((element: number) => {
            const diceElement = document.querySelectorAll(
              `.player2-container .die-container .roll${element}`
            );
            const index = data.dicesChanged.lastDice
              ? diceElement.length - 1
              : 0;
            if (diceElement && diceElement[index]?.parentElement) {
              //@ts-ignore
              diceElement[index].parentElement.classList.add("dimmed");
              //@ts-ignore
              diceElement[index].parentElement.classList.add(
                "animate__animated"
              );
              //@ts-ignore
              diceElement[index].parentElement.classList.add(
                "animate__heartBeat"
              );

              // Criação da nova estrutura HTML
              const burnElement = document.createElement("div");
              burnElement.className = "burn";
              burnElement.innerHTML = `
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                      <div class="flame"></div>
                                    `;
              //@ts-ignore
              diceElement[index].parentElement.appendChild(burnElement);
            }
          });
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
      setRoundAlreadyPlayed(false);
      setShowTimer(true);
    });

    return () => {
      socket.off("resetRound");
    };
  }, [diceKey, socket]);

  useEffect(() => {
    socket.on("readyToFinishBattle", (hostId: string) => {
      if (hostId === userId) {
        socket.emit("getBattleWinner", gameId, roundResultsWinner);
      }
    });

    return () => {
      socket.off("readyToFinishBattle");
    };
  }, [gameId, roundResultsWinner, socket, userId]);

  useEffect(() => {
    if (seconds === 0) {
      if (!watingPlayersMessagem) {
        setInactiveCounter(inactiveCounter + 1);
        const element = document.querySelector("#play-round-button");

        //@ts-ignore
        element?.click();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  useEffect(() => {
    socket.on("timer", (timer: any) => {
      setSeconds(timer);
    });

    return () => {
      socket.off("timer");
    };
  }, [socket]);

  useEffect(() => {
    if (inactiveCounter >= 4) {
      socket.emit("getBattleWinner", gameId, [], userId);
    }
  }, [gameId, inactiveCounter, socket, userId]);

  const handlePlayRound = () => {
    if (battleFinished) {
      socket.emit("playerReadyToFinishBattle", gameId, userId);
      setWatingPlayersMessagem(true);
      return;
    }

    if (playerAgainMessagem) {
      setDisableCards(true);
      setShowTimer(false);
      socket.emit("nextRound", gameId, userId, roundResultsWinner);
      setWatingPlayersMessagem(true);
      return;
    }

    setNumDiceComponent(numDice);
    setPlayerRoundButtonPressed(true);
    setDisablePlayButton(true);
    setDisableButton(true);
    setWatingPlayersMessagem(true);
    setShowTimer(false);
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
    setDisableStealPlayerCardButton(true);
    setDisableGainPackButton(true);
    setCardOutAnimation(true);
    setIsClosingModal(true);

    socket.emit(
      "stealPlayerCard",
      gameId,
      userId,
      battleResult?.loser,
      cardSelected?.cardCode
    );

    setTimeout(() => {
      handleCloseModal();
      setIsClosingModal(false);
      handleStoledCardAnimation();
    }, 500);
  };

  const handleStealPlayerCard = async () => {
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
    }, 3200);
  };

  const handleStoledCardAnimation = () => {
    setSelectedStolenCard(cardSelected);
    setShowStoledCard(true);
    setTimeout(() => {
      const myComponent = document.getElementById("stoled-card");
      myComponent?.classList.add("animate__tada");
    }, 1000);
    setTimeout(() => {
      const myComponent = document.getElementById("stoled-card");

      myComponent?.classList.add("animate__backOutDown");
    }, 2500);
    setTimeout(() => {
      setShowStoledCard(false);
      setCardSelected(undefined);
      setCardOutAnimation(false);
    }, 3200);
  };

  const handleLeaveRoom = () => {
    navigate("/");
    socket.emit("leaveRoom", gameId, userId);
  };

  const handleOnDragEnd = (info: PanInfo) => {
    if (
      dragStart &&
      dragStart - info.point.y >= 150 &&
      !disableCards &&
      !cardPlayed
    ) {
      handlePlayCard();
    }
    // @ts-ignore
    document.querySelector("body").style.background =
      "linear-gradient(180deg, #9c1aff 0%, rgb(119, 0, 255) 100%)";
  };

  const handleClick = () => {
    setStartDrag(!startDrag);
    setScaled(!scaled);
  };

  return (
    <div className="battle-container">
      <div className="round-counter">
        <div style={{ width: "100px" }}>
          <button onClick={handleLeaveRoom}>Sair</button>
        </div>
        <div>
          <h2>Round {roundNumber}/7</h2>
          <PointsCounter
            roundNumber={roundNumber}
            pointsColor={[
              point1Color,
              point2Color,
              point3Color,
              point4Color,
              point5Color,
              point6Color,
              point7Color,
            ]}
          />
          {seconds <= 30 && showTimer && (
            <div className="timer-container">
              <CircularProgressBar seconds={seconds} />
            </div>
          )}
          <p>{roundSelectedNumber}</p>
        </div>
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
                      src={require(`../../assets/images/${oponentSelectedCard}.svg`)}
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
                      src={require(`../../assets/images/${cardSelectedSent?.cardCode}.svg`)}
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
            <div className="cards-container-test">
              <motion.div
                onHoverStart={() => {
                  const myComponent =
                    document.getElementById(`card-container-01`);
                  //@ts-ignore
                  myComponent.style.boxShadow =
                    "0px 0px 20px 5px rgb(0 225 255)";
                }}
                // whileTap={{ scale: 2, zIndex: 999 }}
                id={`card-container-01`}
                className="card-test"
                drag={startDrag}
                dragSnapToOrigin
                whileDrag={{ scale: 2, zIndex: 999 }}
                onDrag={(event, info) => {
                  if (
                    dragStart &&
                    dragStart - info.point.y >= 150 &&
                    !disableCards &&
                    !cardPlayed
                  ) {
                    // @ts-ignore
                    document.querySelector("body").style.background =
                      "linear-gradient(180deg, #9c1aff6b 0%, rgb(119, 0, 255) 100%)";
                  } else {
                    // @ts-ignore
                    document.querySelector("body").style.background =
                      "linear-gradient(180deg, #9c1aff 0%, rgb(119, 0, 255) 100%)";
                  }
                }}
                onDragStart={(event, info) => {
                  setCardSelected({
                    cardCode: "01",
                    index: 1,
                  });
                  setDragStart(info.point.y);
                }}
                onDragEnd={(event, info) => {
                  handleOnDragEnd(info);
                }}
              >
                <MyIcon
                  id="card"
                  className={`${
                    scaled ? "scaled centered" : ""
                  } card card-content animate__animated animate__bounceInRight`}
                  onClick={handleClick}
                />
              </motion.div>
              <motion.div
                onHoverStart={() => {
                  const myComponent =
                    document.getElementById(`card-container-01`);
                  //@ts-ignore
                  myComponent.style.boxShadow =
                    "0px 0px 20px 5px rgb(0 225 255)";
                }}
                // whileTap={{ scale: 2, zIndex: 999 }}
                id={`card-container-01`}
                className="card-test"
                drag={startDrag}
                dragSnapToOrigin
                whileDrag={{ scale: 2, zIndex: 999 }}
                onDrag={(event, info) => {
                  if (
                    dragStart &&
                    dragStart - info.point.y >= 150 &&
                    !disableCards &&
                    !cardPlayed
                  ) {
                    // @ts-ignore
                    document.querySelector("body").style.background =
                      "linear-gradient(180deg, #9c1aff6b 0%, rgb(119, 0, 255) 100%)";
                  } else {
                    // @ts-ignore
                    document.querySelector("body").style.background =
                      "linear-gradient(180deg, #9c1aff 0%, rgb(119, 0, 255) 100%)";
                  }
                }}
                onDragStart={(event, info) => {
                  setCardSelected({
                    cardCode: "01",
                    index: 1,
                  });
                  setDragStart(info.point.y);
                }}
                onDragEnd={(event, info) => {
                  handleOnDragEnd(info);
                }}
              >
                <MyIcon
                  id="card"
                  className={`${
                    scaled ? "scaled centered" : ""
                  } card card-content animate__animated animate__bounceInRight`}
                  onClick={handleClick}
                />
              </motion.div>
              <motion.div
                onHoverStart={() => {
                  const myComponent =
                    document.getElementById(`card-container-01`);
                  //@ts-ignore
                  myComponent.style.boxShadow =
                    "0px 0px 20px 5px rgb(0 225 255)";
                }}
                // whileTap={{ scale: 2, zIndex: 999 }}
                id={`card-container-01`}
                className="card-test"
                drag={startDrag}
                dragSnapToOrigin
                whileDrag={{ scale: 2, zIndex: 999 }}
                onDrag={(event, info) => {
                  if (
                    dragStart &&
                    dragStart - info.point.y >= 150 &&
                    !disableCards &&
                    !cardPlayed
                  ) {
                    // @ts-ignore
                    document.querySelector("body").style.background =
                      "linear-gradient(180deg, #9c1aff6b 0%, rgb(119, 0, 255) 100%)";
                  } else {
                    // @ts-ignore
                    document.querySelector("body").style.background =
                      "linear-gradient(180deg, #9c1aff 0%, rgb(119, 0, 255) 100%)";
                  }
                }}
                onDragStart={(event, info) => {
                  setCardSelected({
                    cardCode: "01",
                    index: 1,
                  });
                  setDragStart(info.point.y);
                }}
                onDragEnd={(event, info) => {
                  handleOnDragEnd(info);
                }}
              >
                <MyIcon
                  id="card"
                  className={`${
                    scaled ? "scaled centered" : ""
                  } card card-content animate__animated animate__bounceInRight`}
                  onClick={handleClick}
                />
              </motion.div>
              <motion.div
                onHoverStart={() => {
                  const myComponent =
                    document.getElementById(`card-container-01`);
                  //@ts-ignore
                  myComponent.style.boxShadow =
                    "0px 0px 20px 5px rgb(0 225 255)";
                }}
                // whileTap={{ scale: 2, zIndex: 999 }}
                id={`card-container-01`}
                className="card-test"
                drag={startDrag}
                dragSnapToOrigin
                whileDrag={{ scale: 2, zIndex: 999 }}
                onDrag={(event, info) => {
                  if (
                    dragStart &&
                    dragStart - info.point.y >= 150 &&
                    !disableCards &&
                    !cardPlayed
                  ) {
                    // @ts-ignore
                    document.querySelector("body").style.background =
                      "linear-gradient(180deg, #9c1aff6b 0%, rgb(119, 0, 255) 100%)";
                  } else {
                    // @ts-ignore
                    document.querySelector("body").style.background =
                      "linear-gradient(180deg, #9c1aff 0%, rgb(119, 0, 255) 100%)";
                  }
                }}
                onDragStart={(event, info) => {
                  setCardSelected({
                    cardCode: "01",
                    index: 1,
                  });
                  setDragStart(info.point.y);
                }}
                onDragEnd={(event, info) => {
                  handleOnDragEnd(info);
                }}
              >
                <MyIcon
                  id="card"
                  className={`${
                    scaled ? "scaled centered" : ""
                  } card card-content animate__animated animate__bounceInRight`}
                  onClick={handleClick}
                />
              </motion.div>
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
                id="play-round-button"
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
            {/* <button
              onClick={() => handleOpenModal("myCards")}
              disabled={disableCards}
            >
              Cartas de batalha
            </button> */}
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
                src={require(`../../assets/images/battle-pack.png`)}
                alt="carta"
                className="animate__animated animate__backInDown"
              />
            </div>
          )}
          {showStoledCard && (
            <div
              style={{
                height: "100vh",
                alignContent: "center",
              }}
              id="stoled-card"
            >
              <img
                src={require(`../../assets/images/${selectedStolenCard?.cardCode}.svg`)}
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
                <button onClick={handleLeaveRoom}>Sair da batalha</button>
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
                    <button onClick={handleLeaveRoom}>Sair da batalha</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleLeaveRoom}>Sair da batalha</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
      <CardsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isClosing={isClosingModal}
        setIsClosing={setIsClosingModal}
      >
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
                          ? "animate__zoomOut"
                          : ""
                      }`}
                      whileHover={{ scale: 1.5 }}
                      whileTap={{ scale: 1 }}
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
