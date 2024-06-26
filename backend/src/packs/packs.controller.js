const Joi = require("joi");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const User = require("../users/user.model");

exports.AddPacks = async (req, res) => {
  const { userId, number } = req.body;

  console.log("userId::", userId);

  // Find the user
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  // Find the pack within the user's pack
  const packIndex = user.packs.findIndex((c) => c.packType === "battle");

  if (packIndex === -1) {
    // pack not found, add new pack
    user.packs.push({ packType: "battle", quantity: number });
  } else {
    // pack found, update quantity
    user.packs[packIndex].quantity += number;
  }

  // Save the updated user document
  user.save();

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
