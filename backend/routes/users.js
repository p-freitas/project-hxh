const express = require("express");
const router = express.Router();

const cleanBody = require("../middlewares/cleanbody");
const { validateToken } = require("../middlewares/validateToken");

const AuthController = require("../src/users/user.controller");

router.post("/signup", cleanBody, AuthController.Signup);

router.patch("/activate", cleanBody, AuthController.Activate);

router.post("/login", cleanBody, AuthController.Login);

router.patch("/forgot", cleanBody, AuthController.ForgotPassword);

router.patch("/reset", cleanBody, AuthController.ResetPassword);

router.get("/logout", validateToken, AuthController.Logout);

router.get("/getUserCards", validateToken, AuthController.GetUserCards);

router.get("/getUserPacks", validateToken, AuthController.GetUserPacks);

router.get("/validateToken", validateToken, AuthController.ValidateToken);

router.post("/auth/google", AuthController.googleAuth);

router.get("/auth/google/callback", AuthController.googleAuthCallback);

module.exports = router;
