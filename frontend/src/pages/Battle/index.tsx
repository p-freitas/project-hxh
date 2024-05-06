// App.tsx
import React, { useState, useEffect, useRef } from "react";
import ReactDice, { ReactDiceRef } from "react-dice-complete";
import { useLocation } from "react-router-dom";
import "animate.css";
import "./styles.css";
import { motion, PanInfo } from "framer-motion";

type RoundResult = {
  id: string;
  score: number;
};

const Battle = ({ socket }: any) => {
  const location = useLocation();
  const userId = sessionStorage.getItem("userId");
  const reactDicePlayer1 = useRef<ReactDiceRef>(null);
  const reactDicePlayer2 = useRef<ReactDiceRef>(null);

  const [numDice, setNumDice] = useState<number>(1);
  const [roundResults, setRoundResults] = useState<RoundResult[]>();
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
  const [player2Dicenumber, setPlayer2DiceNumber] = useState<number>(0);
  const [gameId, setGameId] = useState<string>();
  const [watingPlayersMessagem, setWatingPlayersMessagem] =
    useState<boolean>(false);
  const [disablePlayButton, setDisablePlayButton] = useState<boolean>(false);
  const [disableButton, setDisableButton] = useState<boolean>(false);
  const [playerAgainMessagem, setPlayerAgainMessagem] =
    useState<boolean>(false);
  const [dragStart, setDragStart] = useState<number>();
  const [hideCard, setHideCard] = useState<string>("hide");
  const [hideUsingCard, setHideUsingCard] = useState<string>("show-card");
  const [isOpenBottomDiv, setIsOpenBottomDiv] = useState(false);

  useEffect(() => {
    setGameId(location.pathname.split("/")[2]);
  }, [location.pathname]);

  useEffect(() => {
    socket.on("ready", () => {
      rollPlayer1Dices(undefined);
    });

    return () => {
      socket.off("ready");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("player1Rolled", (gameId: string) => {
      socket.emit("getPlayer2Dices", gameId, userId);
    });

    return () => {
      socket.off("player1Rolled");
    };
  }, [socket, userId]);

  useEffect(() => {
    socket.on("rollPlayer2Dices", (player2Dices: number[]) => {
      if (player2Dices.length > 0) {
        setPlayer2DiceNumber(player2Dices.length);
        rollPlayer2Dices(player2Dices);
      }
    });

    return () => {
      socket.off("rollPlayer2Dices");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("setRoundResult", (data: RoundResult[]) => {
      console.log("roundResults::", data);

      setTimeout(() => {
        setRoundResults(data);
        data?.map((item) => {
          return item.id === userId
            ? setRoundPlayer1Result(item.score)
            : setRoundPlayer2Result(item.score);
        });
        setWatingPlayersMessagem(false);
        setPlayerAgainMessagem(true);
        setDisablePlayButton(false);
        setPlayerRoundButtonPressed(false);
      }, 2000);
    });

    return () => {
      socket.off("setRoundResult");
    };
  }, [roundResults, socket, userId]);

  useEffect(() => {
    socket.on("cardResult", (data: any) => {
      console.log("data::", data);
      if (data.dicesChanged.status === true) {
        const index = data.array.findIndex(
          (obj: { id: string | null }) => obj.id === userId
        );
        if (data.playerAffected === userId) {
          console.log("data.playerAffected === userId");

          setNumDice(data.array[index].dices.length);
          rollPlayer1Dices(data.array[index].dices);
        } else {
          console.log("data.playerAffected === userId else");

          const player2index = index === 0 ? 1 : 0;
          setPlayer2DiceNumber(data.array[player2index].dices.length);
          rollPlayer2Dices(data.array[player2index].dices);
        }
        socket.emit("getRoundResult", gameId);
      }
    });

    return () => {
      socket.off("cardResult");
    };
  }, [gameId, socket, userId]);

  const handlePlayRound = () => {
    setPlayerRoundButtonPressed(true);
    setDisablePlayButton(true);
    setDisableButton(true);
    setWatingPlayersMessagem(true);
    socket.emit("playerIsReady", gameId, userId, true);
  };

  const rollDonePlayer1 = (totalValue: number, values: number[]) => {
    if (playerRoundButtonPressed) {
      socket.emit("playerDices", gameId, userId, values);
      setAnimationClassPlayer1("");
    }
  };

  const rollDonePlayer2 = (totalValue: number, values: number[]) => {
    if (playerRoundButtonPressed) {
      setAnimationClassPlayer2("");
      socket.emit("getRoundResult", gameId);
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
    console.log("player2Dices>:::", player2Dices);

    setAnimationClassPlayer2("");
    setAnimationClassPlayer2("animate__backInDown");
    setIsDicesVisisbleClassPlayer2("show");
    reactDicePlayer2.current?.rollAll(player2Dices);
  };

  const handleOnDragEnd = (info: PanInfo) => {
    // @ts-ignore
    if (dragStart - info.point.y >= 300) {
      setIsOpenBottomDiv(false);
      setHideUsingCard("hide-card");
      setHideCard("show");
      socket.emit("useCard", gameId, userId, "01");
      // document.querySelector("body").style.background = "black";
    }
    // @ts-ignore
    document.querySelector("body").style.background =
      "linear-gradient(180deg, #9c1aff 0%, rgb(119, 0, 255) 100%)";
  };

  return (
    <div
      className="battle-container"
      style={{
        transform: isOpenBottomDiv ? "translateY(-40vh)" : "translateY(0)",
      }}
    >
      <div className="player2-container">
        <div
          className={`animate__animated playersDices player2-dices ${animationClassPlayer2} ${isDicesVisisbleClassPlayer2}`}
        >
          <ReactDice
            rollTime={2}
            defaultRoll={1}
            numDice={player2Dicenumber}
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
        {roundResults && (
          <div className="results-inner-container">
            <div className="results-card">
              <img
                src={require("../../assets/images/king_of_hearts.png")}
                alt="carta"
                className={`animate__animated animate__tada ${hideCard}`}
              />
            </div>
            <div className="results-score-container">
              <h1>{roundPlayer2Result}</h1>
              <h2>X</h2>
              <h1>{roundPlayer1Result}</h1>
            </div>
            <div className="results-card">
              <img
                src={require("../../assets/images/king_of_hearts.png")}
                alt="carta"
                className={`animate__animated animate__tada ${hideCard}`}
              />
            </div>
          </div>
        )}
      </div>

      <div className="player-container">
        <div
          className={`animate__animated playersDices player1-dices ${animationClassPlayer1} ${isDicesVisisbleClassPlayer1}`}
        >
          <ReactDice
            rollTime={2}
            defaultRoll={1}
            numDice={numDice}
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
            onClick={() => numDice !== 0 && setNumDice(numDice - 1)}
            disabled={disableButton}
            className="battle-dices-input-buttons"
          >
            -
          </button>
          <button onClick={handlePlayRound} disabled={disablePlayButton}>
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
          onClick={() => setIsOpenBottomDiv(!isOpenBottomDiv)}
          // disabled={disableButton}
          // className="battle-dices-input-buttons"
        >
          Cartas de feitiço
        </button>
      </div>
      <div
        className="bottom-div"
        style={{
          position: "fixed",
          bottom: "-40vh",
          left: 0,
          width: "100%",
          height: isOpenBottomDiv ? "40vh" : "0",
          backgroundColor: "black",
          transform: `translateY(${isOpenBottomDiv ? "0" : "100%"})`,
          transition: "height 0.3s ease, transform 0.3s ease",
          overflow: "visible",
          display: isOpenBottomDiv ? "flex" : "none",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        <motion.img
          drag
          dragSnapToOrigin
          whileDrag={{ scale: 1 }}
          // dragConstraints={{ top: 5 }}
          onDrag={(event, info) => {
            // @ts-ignore
            if (dragStart - info.point.y >= 300) {
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
            setDragStart(info.point.y);
          }}
          onDragEnd={(event, info) => {
            handleOnDragEnd(info);
          }}
          className={`card ${hideUsingCard}`}
          src={require("../../assets/images/king_of_hearts.png")}
          alt="carta"
          whileHover={{ scale: 1.5 }}
          whileTap={{ scale: 1 }}
        />
      </div>
    </div>
  );
};

export default Battle;
