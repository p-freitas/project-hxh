const express = require("express");
const router = express.Router();

const { validateToken } = require("../middlewares/validateToken");

const CardsController = require("../src/cards/cards.controller");

router.post(
  "/getOpponentCards",
  validateToken,
  CardsController.GetOpponentCards
);

module.exports = router;
