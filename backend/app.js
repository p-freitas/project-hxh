const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");
const cors = require("cors");
const app = express();
const User = require("./src/users/user.model");

app.use(cors());
require("dotenv").config();

const authRoutes = require("./routes/users");
const cardsRoutes = require("./routes/cards");
const server = http.createServer(app);
const cardsHelper = require("./helpers/cardsHelper");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    credentials: false,
  },
});

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "TheNodeAuth",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection Success.");
  })
  .catch((err) => {
    console.error("Mongo Connection Error", err);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  return res.send({
    error: false,
    message: "Server is healthy",
  });
});

app.use("/users", authRoutes);
app.use("/cards", cardsRoutes);

const rooms = new Map();
let roomsAvaiable = [];

function generateRoomId() {
  try {
    // Generate a random room ID
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let roomId = "";
    for (let i = 0; i < 6; i++) {
      roomId += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return roomId;
  } catch (error) {
    console.error("generateRoomId error::", error);
  }
}

const handleCards = (cardCode, array, userId) => {
  const handler = cardsHelper[cardCode];
  if (handler) {
    return handler(array, userId);
  } else {
    throw new Error("Código inválido.");
  }
};

const decreasePlayerCard = async (userId, card) => {
  // Find the user
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  // Find the card within the user's cards
  const cardIndex = user.cards.findIndex((c) => c.cardCode === card);

  if (cardIndex === -1) {
    throw new Error("Card not found");
  }

  // Decrease the card quantity
  user.cards[cardIndex].quantity -= 1;

  // Remove the card if the quantity is zero
  if (user.cards[cardIndex].quantity <= 0) {
    user.cards.splice(cardIndex, 1);
  }

  // Save the updated user document
  await user.save();

  return user;
};

const increasePlayerCard = async (userId, card) => {
  // Find the user
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  // Find the card within the user's cards
  const cardIndex = user.cards.findIndex((c) => c.cardCode === card);

  if (cardIndex === -1) {
    // Card not found, add new card
    user.cards.push({ cardCode: card, quantity: 1 });
  } else {
    // Card found, update quantity
    user.cards[cardIndex].quantity += 1;
  }

  // Save the updated user document
  user.save();

  return user;
};

const openPack = async (userId, cards, openAll, packType) => {
  // Find the user
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  cards.forEach((card) => {
    // Find the card within the user's cards
    const cardIndex = user.cards.findIndex((c) => c.cardCode === card);

    if (cardIndex === -1) {
      // Card not found, add new card
      user.cards.push({ cardCode: card, quantity: 1 });
    } else {
      // Card found, update quantity
      user.cards[cardIndex].quantity += 1;
    }

    // Save the updated user document
  });

  if (openAll) {
    // Remove all packs
    user.packs = [];
  } else {
    // Find the packs within the user's packs
    const packIndex = user.packs.findIndex((c) => c.packType === packType);

    if (packIndex === -1) {
      throw new Error("Card not found");
    }

    // Decrease the packs quantity
    user.packs[packIndex].quantity -= 1;

    // Remove the packs if the quantity is zero
    if (user.packs[packIndex].quantity <= 0) {
      user.packs.splice(packIndex, 1);
    }
  }
  await user.save();

  return user;
};

const addPacks = async (userId, packType, number) => {
  // Find the user
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  // Find the pack within the user's pack
  const packIndex = user.packs.findIndex((c) => c.packType === packType);

  if (packIndex === -1) {
    // pack not found, add new pack
    user.packs.push({ packType: packType, quantity: number });
  } else {
    // pack found, update quantity
    user.packs[packIndex].quantity += number;
  }

  // Save the updated user document
  user.save();

  return user;
};

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`A user connected with id: ${socket.id}`);
  socket.on("disconnect", () => {
    try {
      console.log(`A user disconnected with id: ${socket.id}`);
    } catch (error) {
      console.error("disconnect error::", error);
    }
  });

  socket.on("matchMaking", () => {
    if (roomsAvaiable.length === 0) {
      const gameId = generateRoomId();
      roomsAvaiable.push({ gameId: gameId, socketsWating: socket.id });
      socket.emit("createNewGame");
    } else {
      socket.emit("joinExistingGame", roomsAvaiable[0].gameId);
    }
  });

  socket.on("cancelMatchMaking", () => {
    roomsAvaiable = roomsAvaiable.filter(
      (item) => item.socketsWating !== socket.id
    );
  });

  socket.on("createGame", (gameId, userId) => {
    rooms.set(gameId, {
      id: gameId,
      players: [
        {
          id: userId,
          isReady: false,
          playerReadyFinishBattle: false,
          dices: [],
        },
      ],
      round: 1,
    });
    socket.emit("gameCreated", gameId);
    io.to(roomsAvaiable[0].socketsWating).emit("gameCreated", gameId);
    roomsAvaiable = roomsAvaiable.filter((item) => item.gameId !== gameId);
  });

  socket.on("joinGame", (gameId, userId) => {
    socket.join(gameId);
    const room = rooms.get(gameId);
    const playerExists = room.players.some((player) => player.id === userId);

    if (!playerExists) {
      room.players.push({
        id: userId,
        isReady: false,
        playerReadyFinishBattle: false,
        dices: [],
      });
    }
    io.to(gameId).emit("joinedGame", gameId);
  });

  socket.on("playerIsReady", (gameId, userId, isReady) => {
    const room = rooms.get(gameId);

    const objectIdToFind = userId;
    const indexToEdit = room.players.findIndex(
      (obj) => obj.id === objectIdToFind
    );

    if (indexToEdit !== -1) {
      room.players[indexToEdit].isReady = isReady;

      const allTrueValues = room.players.every((obj) => obj.isReady === true);
      if (allTrueValues) {
        io.to(gameId).emit("ready");
      }
    } else {
      console.log("Object not found in array.");
    }
  });

  socket.on("playerDices", (gameId, userId, dices) => {
    const room = rooms.get(gameId);
    const objectIdToFind = userId;
    const indexToEdit = room.players.findIndex(
      (obj) => obj.id === objectIdToFind
    );

    if (indexToEdit !== -1) {
      room.players[indexToEdit].dices = dices;

      if (
        room.players[0].dices.length > 0 &&
        room.players[1].dices.length > 0
      ) {
        io.to(gameId).emit("playersRolled", gameId);
      }
    } else {
      console.log("Object not found in array.");
    }
  });

  socket.on("getPlayer2Dices", (gameId, userId) => {
    const room = rooms.get(gameId);
    const objectIdToFind = userId;
    const indexToEdit = room.players.findIndex(
      (obj) => obj.id === objectIdToFind
    );
    const player2Index = indexToEdit === 0 ? 1 : 0;

    if (indexToEdit !== -1) {
      socket.emit("rollPlayer2Dices", room.players[player2Index].dices, gameId);
    } else {
      console.log("Object not found in array.");
    }
  });

  socket.on("getRoundResult", (gameId) => {
    const room = rooms.get(gameId);

    // Calculate sum of dices for each player
    const sums = room.players.map((player) => ({
      id: player.id,
      score: player.dices.reduce((total, dice) => total + dice, 0),
    }));

    socket.emit("setRoundResult", sums, room.round);
  });

  socket.on("useCard", async (gameId, userId, card) => {
    const room = rooms.get(gameId);

    const user = await decreasePlayerCard(userId, card);

    const result = handleCards(card, room.players, userId);
    room.players = result.array;
    socket.to(gameId).emit("oponentCard", card);
    io.to(gameId).emit("cardResult", result);

    // Emit the updated card array to the user
    socket.emit("updatedCards", user.cards);
  });

  socket.on("stealPlayerCard", async (gameId, userId, opponentId, card) => {
    const room = rooms.get(gameId);

    const opponent = await decreasePlayerCard(opponentId, card);

    if (opponent) {
      const user = await increasePlayerCard(userId, card);
      socket.emit("updatedCards", user.cards);
    }
  });

  socket.on("nextRound", (gameId, userId, matchResults) => {
    const room = rooms.get(gameId);
    const indexToEdit = room.players.findIndex((obj) => obj.id === userId);
    room.players[indexToEdit].isReady = false;
    room.players[indexToEdit].dices = [];

    if (
      room.players[0].isReady === false &&
      room.players[1].isReady === false
    ) {
      room.round = room.round + 1;
      const winCounts = {};

      // Count wins
      for (const result of matchResults) {
        if (!result.draw) {
          if (!winCounts[result.winner]) {
            winCounts[result.winner] = 0;
          }
          winCounts[result.winner]++;
        }
      }

      // Determine the winner or if it's a tie
      const requiredWins = 3; // Best of 5 requires at least 3 wins
      let topWinner = null;
      let highestWins = 0;
      let isTie = false;

      for (const [userId, wins] of Object.entries(winCounts)) {
        if (wins > highestWins) {
          highestWins = wins;
          topWinner = userId;
          isTie = false; // Reset tie status as we found a new leader
        } else if (wins === highestWins) {
          isTie = true;
        }
      }

      const objectIdToFind = topWinner;
      const index = room.players.findIndex((obj) => obj.id === objectIdToFind);

      const loserIndex = index === 1 ? 0 : 1;


      // Final determination based on win counts
      if (isTie || highestWins < requiredWins) {
        io.to(gameId).emit("resetRound", room.round);
      } else {
        io.to(gameId).emit("setBattleWinner", {
          draw: false,
          winner: topWinner,
          loser: room.players[loserIndex].id,
        });
      }
    }
  });

  socket.on("getRoundNumber", (gameId) => {
    const room = rooms.get(gameId);
    io.to(gameId).emit("setRoundNumber", room.round);
  });

  socket.on("getBattleWinner", (gameId, matchResults) => {
    const room = rooms.get(gameId);
    const winCounts = {};

    // Count wins
    for (const result of matchResults) {
      if (!result.draw) {
        if (!winCounts[result.winner]) {
          winCounts[result.winner] = 0;
        }
        winCounts[result.winner]++;
      }
    }

    // Determine the winner or if it's a tie
    const requiredWins = 3; // Best of 5 requires at least 3 wins
    let topWinner = null;
    let highestWins = 0;
    let isTie = false;

    for (const [userId, wins] of Object.entries(winCounts)) {
      if (wins > highestWins) {
        highestWins = wins;
        topWinner = userId;
        isTie = false; // Reset tie status as we found a new leader
      } else if (wins === highestWins) {
        isTie = true;
      }
    }

    const objectIdToFind = topWinner;
    const index = room.players.findIndex((obj) => obj.id === objectIdToFind);

    const loserIndex = index === 1 ? 0 : 1;

    // socket.emit('setBattleWinner', {draw: isTie || highestWins < requiredWins, winner: })

    // Final determination based on win counts
    if (isTie || highestWins < requiredWins) {
      socket.emit("setBattleWinner", {
        draw: true,
        winner: undefined,
        loser: undefined,
      });
    } else {
      socket.emit("setBattleWinner", {
        draw: false,
        winner: topWinner,
        loser: room.players[loserIndex].id,
      });
    }
  });

  socket.on("openPack", async (userId, cards, openAll, packType) => {
    await openPack(userId, cards, openAll, packType);
  });

  socket.on("playerReadyToFinishBattle", (gameId, userId) => {
    const room = rooms.get(gameId);

    const objectIdToFind = userId;
    const indexToEdit = room.players.findIndex(
      (obj) => obj.id === objectIdToFind
    );

    if (indexToEdit !== -1) {
      room.players[indexToEdit].playerReadyFinishBattle = true;

      const allTrueValues = room.players.every(
        (obj) => obj.playerReadyFinishBattle === true
      );
      if (allTrueValues) {
        io.to(gameId).emit("readyToFinishBattle");
      }
    } else {
      console.log("Object not found in array.");
    }
  });

  socket.on("gainPacks", async (userId) => {
    await addPacks(userId, "battle", 1);
  });
});

server.listen(
  process.env.SERVER_PORT || 3000,
  process.env.SERVER_HOST || "0.0.0.0",
  () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT || 3000}`);
  }
);

server.off("server.off", () => {
  console.log("[http] Server stopping...");
});
