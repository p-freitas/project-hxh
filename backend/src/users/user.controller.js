const Joi = require("joi");
require("dotenv").config();
const { v4: uuid } = require("uuid");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library");
const { generateJwt } = require("./helpers/generateJwt");
const { sendEmail } = require("./helpers/mailer");
const { generateFromEmail } = require("unique-username-generator");

const User = require("./user.model");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//Validate user schema
const userSchema = Joi.object().keys({
  email: Joi.string().email({ minDomainSegments: 2 }),
  userName: Joi.string().required().max(15),
  password: Joi.string().required().min(4),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

exports.Signup = async (req, res) => {
  try {
    const result = userSchema.validate(req.body);
    if (result.error) {
      console.log(result.error.message);
      return res.json({
        error: true,
        status: 400,
        message: result.error.message,
      });
    }

    //Check if the email has been already registered.
    var user = await User.findOne({
      email: result.value.email,
    });

    if (user) {
      return res.json({
        error: true,
        message: "Email is already in use",
      });
    }

    const hash = await User.hashPassword(result.value.password);

    const id = uuid(); //Generate unique id for the user.
    result.value.userId = id;

    delete result.value.confirmPassword;
    result.value.password = hash;

    let code = Math.floor(100000 + Math.random() * 900000);

    let expiry = Date.now() + 60 * 1000 * 15; //15 mins in ms

    const sendCode = await sendEmail(result.value.email, code);

    if (sendCode.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send verification email.",
      });
    }
    result.value.emailToken = code;
    result.value.emailTokenExpires = new Date(expiry);

    const newUser = new User(result.value);
    await newUser.save();

    return res.status(200).json({
      success: true,
      message: "Registration Success",
    });
  } catch (error) {
    console.error("signup-error", error);
    return res.status(500).json({
      error: true,
      message: "Cannot Register",
    });
  }
};

exports.Activate = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.json({
        error: true,
        status: 400,
        message: "Please make a valid request",
      });
    }
    const user = await User.findOne({
      email: email,
      emailToken: code,
      emailTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        message: "Invalid details",
      });
    } else {
      if (user.active)
        return res.send({
          error: true,
          message: "Account already activated",
          status: 400,
        });

      user.emailToken = "";
      user.emailTokenExpires = null;
      user.active = true;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Account activated.",
      });
    }
  } catch (error) {
    console.error("activation-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

exports.Login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        error: true,
        message: "Cannot authorize user.",
      });
    }

    //1. Find if any account with that email exists in DB
    const user = await User.findOne({ userName: userName });

    // NOT FOUND - Throw error
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Account not found",
      });
    }

    //2. Throw error if account is not activated
    if (!user.active) {
      return res.status(400).json({
        error: true,
        message: "You must verify your email to activate your account",
      });
    }

    //3. Verify the password is valid
    const isValid = await User.comparePasswords(password, user.password);

    if (!isValid) {
      return res.status(400).json({
        error: true,
        message: "Invalid credentials",
      });
    }

    //Generate Access token

    const { error, token } = await generateJwt(user.userName, user.userId);
    if (error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't create access token. Please try again later",
      });
    }
    user.accessToken = token;
    await user.save();

    //Success
    return res.send({
      success: true,
      message: "User logged in successfully",
      accessToken: token,
      userId: user.userId,
      userName: user.userName,
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({
      error: true,
      message: "Couldn't login. Please try again later.",
    });
  }
};

exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.send({
        status: 400,
        error: true,
        message: "Cannot be processed",
      });
    }
    const user = await User.findOne({
      email: email,
    });
    if (!user) {
      return res.send({
        success: true,
        message:
          "If that email address is in our database, we will send you an email to reset your password",
      });
    }

    let code = Math.floor(100000 + Math.random() * 900000);
    let response = await sendEmail(user.email, code);

    if (response.error) {
      return res.status(500).json({
        error: true,
        message: "Couldn't send mail. Please try again later.",
      });
    }

    let expiry = Date.now() + 60 * 1000 * 15;
    user.resetPasswordToken = code;
    user.resetPasswordExpires = expiry; // 15 minutes

    await user.save();

    return res.send({
      success: true,
      message:
        "If that email address is in our database, we will send you an email to reset your password",
    });
  } catch (error) {
    console.error("forgot-password-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

exports.ResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
      return res.status(403).json({
        error: true,
        message:
          "Couldn't process request. Please provide all mandatory fields",
      });
    }
    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.send({
        error: true,
        message: "Password reset token is invalid or has expired.",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: true,
        message: "Passwords didn't match",
      });
    }
    const hash = await User.hashPassword(req.body.newPassword);
    user.password = hash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = "";

    await user.save();

    return res.send({
      success: true,
      message: "Password has been changed",
    });
  } catch (error) {
    console.error("reset-password-error", error);
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

exports.Logout = async (req, res) => {
  try {
    console.log("req.decoded::", req.decoded);
    const { id } = req.decoded;

    let user = await User.findOne({ userId: id });

    user.accessToken = "";

    await user.save();

    return res.send({ success: true, message: "User Logged out" });
  } catch (error) {
    console.error("user-logout-error", error);
    return res.stat(500).json({
      error: true,
      message: error.message,
    });
  }
};

exports.GetUserCards = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.decode(token, { complete: true });
    const userId = decodedToken.payload.id;

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
    console.error("GetUserCards error", err);
    return res.status(500).json({
      error: true,
      message: "Couldn't get user cards. Please try again later.",
    });
  }
};

exports.GetUserPacks = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const decodedToken = jwt.decode(token, { complete: true });
    const userId = decodedToken.payload.id;

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
      packs: user.packs,
      total: user.packs.reduce((total, pack) => total + pack.quantity, 0),
    });
  } catch (err) {
    console.error("GetUserCards error", err);
    return res.status(500).json({
      error: true,
      message: "Couldn't get user cards. Please try again later.",
    });
  }
};

exports.ValidateToken = async (req, res) => {
  return res.status(200).json({
    error: false,
  });
};

// Google Auth
exports.googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    console.log("payload::", payload);

    const user = await User.findOne({ email: payload.email });

    // If user doesn't exist, create a new user
    if (!user) {
      const id = uuid();
      const username = generateFromEmail(payload.email, 3);
      const { token: jwtToken } = await generateJwt(payload.email, id);

      const newUser = new User({
        email: payload.email,
        userId: id,
        userName: username,
        googleId: payload.sub,
        accessToken: jwtToken,
        active: true, // since this is a Google user, we can consider the email verified
      });
      await newUser.save();

      console.log('User logged: ', id);

      // Success
      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        accessToken: jwtToken,
        userId: id,
        userName: username,
      });
    } else {
      const { error, token: jwtToken } = await generateJwt(
        user.email,
        user.userId
      );

      if (error) {
        return res.status(500).json({
          error: true,
          message: "Couldn't create access token. Please try again later",
        });
      }

      user.accessToken = jwtToken;
      await user.save();

      console.log('User logged: ', user.userId);

      // Success
      return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        accessToken: jwtToken,
        userId: user.userId,
        userName: user.userName,
      });
    }
  } catch (error) {
    console.error("Google authentication error", error);
    return res.status(500).json({
      error: true,
      message: "Google authentication failed",
    });
  }
};

exports.googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/",
});
