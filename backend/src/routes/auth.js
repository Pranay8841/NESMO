import express from 'express';
import passport from 'passport';
import {register, login} from "../controllers/auth.js";
import jwt from 'jsonwebtoken';

const router = express.Router();

// User Registration
router.post('/register', register);

// User Login
router.post('/login', login);

// Google OAuth Login
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(
      `${process.env.CLIENT_URL}/oauth-success?token=${token}`
    );
  }
);

export default router;