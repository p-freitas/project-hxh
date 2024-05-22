const Joi = require("joi");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const User = require("../users/user.model");

exports.AddPacks = async (req, res) => {
  const { userId } = req.body;

  console.log("userId::", userId);

  try {
    if (!userId) {
      return res.status(400).json({
        error: true,
        message: "UserId not found.",
      });
    }

    //1. Find if any account with that userId exists in DB
    const user = await User.findOne({ userId: userId });

    // NOT FOUND - Throw error
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
      });
    }

    //Success
    return res.send({
      success: true,
      userId: user.userId,
      cards: user.cards,
    });
  } catch (err) {
    console.error("AddPacks error", err);
    return res.status(500).json({
      error: true,
      message: "Couldn't get user cards. Please try again later.",
    });
  }
};
