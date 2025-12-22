import User from "../models/user.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const generateToken = (userId) => {
    return jwt.sign(
        {userId},
        process.env.JWT_SECRET || "defaultsecret",
        {expiresIn: "7d"}
    );
}

export const register = async (
    req,
    res
) => {
    try {
        const {fullName, email, password} = req.body;

        const userExists = await User.findOne({email});

        if(userExists) {
            return res.status(400).json(
                {
                    message: "User already exists"
                });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            authProvider: "LOCAL"
        });

        res.status(201).json({
            message: "User registered successfully",
            token: generateToken(user._id.toString())
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
        const user = await User.findOne({email}).select("+password");

        if(!user || user.authProvider !== "LOCAL") {
            return res.status(401).json({
                message: "Invalid Credentials - user not found in DB"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({
                message: "Invalid Credentials - password mismatch"
            })
        }

        res.status(200).json({
            message: "Login successful",
            token: generateToken(user._id.toString()),
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                isMember: user.isMember
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Login failed: " + error
        })
    }
}