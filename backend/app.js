const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");
const cors = require("cors");
const app = express();

app.use(cors());
require("dotenv").config();

const PORT = process.env.PORT || 8080;
const authRoutes = require("./routes/users");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    credentials: false,
  },
  // transports: ['websocket']
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

const rooms = new Map();
let roomsAvaiable = [];
let players = {};

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
      console.log("matchMaking 1", socket.id);
      const gameId = generateRoomId();
      roomsAvaiable.push({ gameId: gameId, socketsWating: socket.id });
      socket.emit("createNewGame");
    } else {
      console.log("matchMaking 2", socket.id);
      socket.emit("joinExistingGame", roomsAvaiable[0].gameId);
    }
  });

  socket.on("createGame", (gameId, userId) => {
    rooms.set(gameId, {
      id: gameId,
      players: [{ id: userId, isReady: false, dices: [] }],
    });
    socket.emit("gameCreated", gameId);
    io.to(roomsAvaiable[0].socketsWating).emit("gameCreated", gameId);
    // roomsAvaiable = [];
  });

  socket.on("joinGame", (gameId, userId) => {
    console.log('roomsAvaiable::', roomsAvaiable[0]);
    socket.join(gameId);
    const room = rooms.get(gameId);
    const playerExists = room.players.some((player) => player.id === userId);

    if (!playerExists) {
      room.players.push({ id: userId, isReady: false, dices: [] });
    }
    io.to(gameId).emit("joinedGame", gameId);
  });

  socket.on("playerIsReady", (gameId, userId, isReady) => {
    // console.log("---------------------------------");
    // socket.join(gameId);
    const room = rooms.get(gameId);
    console.log("playerIsReady userId::", userId);
    // room.players.push(socket.id);

    const objectIdToFind = userId;
    const indexToEdit = room.players.findIndex(
      (obj) => obj.id === objectIdToFind
    );
    socket.emit("ready2");

    if (indexToEdit !== -1) {
      room.players[indexToEdit].isReady = isReady;
      console.log("Array after editing:", room);

      const allTrueValues = room.players.every((obj) => obj.isReady === true);
      if (allTrueValues) {
        console.log("readyyyy", io.to(gameId));
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
      console.log("Array after editing dices:", room);
      io.to(gameId).emit("player1Rolled", gameId);
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
      console.log("Array after editing dices:", room);
      socket.emit("rollPlayer2Dices", room.players[player2Index].dices, gameId);
    } else {
      console.log("Object not found in array.");
    }
  });

  socket.on("getRoundResult", (gameId) => {
    const room = rooms.get(gameId);

    // Calculate sum of dices for each player
    const sums = room.players.map((player) => ({
      name: player.name,
      score: player.dices.reduce((total, dice) => total + dice, 0),
    }));

    io.to(gameId).emit("setRoundResult", sums);
  });
});

app.listen(PORT, () => {
  console.log("Server started listening on PORT : " + PORT);
});

server.listen(PORT, "192.168.1.2", () => {
  console.log(`Server is running on port ${PORT}`);
});
