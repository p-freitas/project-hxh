// App.tsx
import React, { useState, useEffect, useRef } from "react";
import ReactDice, { ReactDiceRef } from "react-dice-complete";
import { useLocation } from "react-router-dom";
import "animate.css";
import "./styles.css";

type RoundResult = {
  name: string;
  score: number;
};

const Battle = ({ socket }: any) => {
  const location = useLocation();
  const userId = sessionStorage.getItem("userId");
  const reactDicePlayer1 = useRef<ReactDiceRef>(null);
  const reactDicePlayer2 = useRef<ReactDiceRef>(null);

  const [numDice, setNumDice] = useState<number>(1);
  const [roundResults, setRoundResults] = useState<RoundResult[]>();
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

  useEffect(() => {
    setGameId(location.pathname.split("/")[2]);
  }, [location.pathname]);

  useEffect(() => {
    socket.on("ready", () => {
      console.log("readyyyy");

      rollPlayer1Dices();
    });

    return () => {
      socket.off("ready");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("ready2", (gameId: string) => {
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    });

    return () => {
      socket.off("player1Rolled");
    };
  }, [socket, userId]);

  useEffect(() => {
    socket.on("player1Rolled", (gameId: string) => {
      socket.emit("getPlayer2Dices", gameId, userId);
    });

    return () => {
      socket.off("player1Rolled");
    };
  }, [socket, userId]);

  useEffect(() => {
    socket.on("rollPlayer2Dices", (player2Dices: number[], gameId: string) => {
      setPlayer2DiceNumber(player2Dices.length);
      rollPlayer2Dices(player2Dices, gameId);
    });

    return () => {
      socket.off("rollPlayer2Dices");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("setRoundResult", (data: RoundResult[]) => {
      console.log("data:", data);

      setTimeout(() => {
        setRoundResults(data);
      }, 2000);
    });

    console.log("roundResults::", roundResults);
    return () => {
      socket.off("roundResult");
    };
  }, [roundResults, socket]);

  const handlePlayRound = async () => {
    setPlayerRoundButtonPressed(true);
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

  const rollPlayer1Dices = () => {
    setAnimationClassPlayer1("");
    setIsDicesVisisbleClassPlayer1("show");
    reactDicePlayer1.current?.rollAll();
    setAnimationClassPlayer1("animate__backInUp");
  };

  const rollPlayer2Dices = (player2Dices: number[], gameId: string) => {
    setAnimationClassPlayer2("");
    setAnimationClassPlayer2("animate__backInDown");
    setIsDicesVisisbleClassPlayer2("show");
    reactDicePlayer2.current?.rollAll(player2Dices);
  };

  return (
    <div className="battle-container">
      <div className="player2-container">
        <div
          className={`animate__animated player2 ${animationClassPlayer2} ${isDicesVisisbleClassPlayer2}`}
        >
          <ReactDice
            rollTime={2}
            defaultRoll={5}
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
        <h1>Pontuação do round:</h1>
        {roundResults &&
          roundResults?.map((result, index) => (
            <h2 key={index}>
              {result.name}: {result.score}
            </h2>
          ))}
      </div>

      <div className="player-container">
        <div
          className={`animate__animated player1 ${animationClassPlayer1} ${isDicesVisisbleClassPlayer1}`}
        >
          <ReactDice
            rollTime={2}
            defaultRoll={5}
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
            className="battle-dices-input-buttons"
          >
            -
          </button>
          <button onClick={handlePlayRound}>{`Jogar ${numDice} dados`}</button>
          <button
            onClick={() => numDice !== 10 && setNumDice(numDice + 1)}
            className="battle-dices-input-buttons"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default Battle;
