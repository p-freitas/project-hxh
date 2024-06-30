const express = require("express");
const router = express.Router();

const { validateToken } = require("../middlewares/validateToken");

const PacksController = require("../src/packs/packs.controller");

router.post("/gainPacks", PacksController.AddPacks);

module.exports = router;
