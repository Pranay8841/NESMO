import User from "../models/user.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Profile from "../models/profile.js"

export const register = async (
    req,
    res
) => {
    try {
        const {firstName, lastName, email, password} = req.body;

        if(!firstName || !lastName || !email || !password) {
            return res.status(400).json(
                {
                    message: "All fields are required"
                });
        }

        const userExists = await User.findOne({email});

        if(userExists) {
            return res.status(400).json(
                {
                    message: "User already exists"
                });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const profile = await Profile.create({});

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            authProvider: "LOCAL",
            profile: profile._id
        });

        res.status(201).json({
            message: "User registered successfully",
            user
        });
    } catch(error) {
        res.status(500).json({
            message: "Registration failed: " + error
        });
    }
}

export const login  = async (
    req,
    res
) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email}).select("+password").populate("profile");

        if(!user || user.authProvider !== "LOCAL") {
            return res.status(401).json({
                message: "Invalid Credentials - user not found in DB"
            })
        }

        if(user.status === "BLOCKED") {
            return res.status(403).json({
                message: "User is blocked. Please contact support."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({
                message: "Invalid Credentials - password mismatch"
            })
        }

        const token = jwt.sign(
            {userId: user._id.toString()},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        user.password = undefined;

        res.status(200).json({
            message: "Login successful",
            token: token,
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "Login failed: " + error
        })
    }
}