import User from "../models/user.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Profile from "../models/profile.js"
import { sendVerificationEmail, generateVerificationToken } from "../utils/emailSender.js"

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

        // Generate email verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            authProvider: "LOCAL",
            profile: profile._id,
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, firstName, verificationToken);
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Continue registration even if email fails - user can resend later
        }

        // Don't return password or token - user must verify email first
        user.password = undefined;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;

        res.status(201).json({
            message: "Registration successful. Please check your email to verify your account.",
            requiresEmailVerification: true,
            email: user.email
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

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in.",
                code: "EMAIL_NOT_VERIFIED",
                email: user.email
            });
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

// Google OAuth Callback Handler
export const googleAuthCallback = async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.redirect(
                `${process.env.CLIENT_URL}/oauth-error?message=Authentication failed`
            );
        }

        if (user.status === "BLOCKED") {
            return res.redirect(
                `${process.env.CLIENT_URL}/oauth-error?message=Account is blocked`
            );
        }

        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    } catch (error) {
        res.redirect(
            `${process.env.CLIENT_URL}/oauth-error?message=${encodeURIComponent(error.message)}`
        );
    }
};

// Get current user from token
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("profile");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get user: " + error
        });
    }
};

// Logout user
export const logoutUser = async (req, res) => {
    try {
        // For JWT, logout is primarily client-side (token removal)
        // This endpoint can be used for logging, analytics, or future token blacklisting
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Logout failed: " + error
        });
    }
};

// Verify email with token
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                message: "Verification token is required"
            });
        }

        // First, try to find user with matching token that hasn't expired
        let user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        }).select("+emailVerificationToken +emailVerificationExpires");

        if (!user) {
            // Token not found or expired - check if there's a user who is already verified
            // This handles the case where user clicks verification link again after already verifying
            const verifiedUser = await User.findOne({
                isEmailVerified: true,
                emailVerificationToken: { $exists: false }
            });

            // Check if token might have been used (user already verified)
            // We can't directly link token to user after verification, but we can give helpful message
            return res.status(400).json({
                message: "This verification link is invalid or has already been used. If you've already verified your email, please proceed to login.",
                code: "INVALID_TOKEN"
            });
        }

        // Check if already verified (edge case)
        if (user.isEmailVerified) {
            return res.status(200).json({
                success: true,
                message: "Email is already verified. You can log in.",
                alreadyVerified: true
            });
        }

        // Mark email as verified and clear verification fields
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in."
        });
    } catch (error) {
        res.status(500).json({
            message: "Email verification failed: " + error
        });
    }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            // Return success even if user not found for security (prevent email enumeration)
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, a verification link has been sent."
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                message: "Email is already verified. Please log in."
            });
        }

        if (user.authProvider !== "LOCAL") {
            return res.status(400).json({
                message: "This account uses Google sign-in. No email verification needed."
            });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user.emailVerificationToken = verificationToken;
        user.emailVerificationExpires = verificationExpires;
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, user.firstName, verificationToken);

        res.status(200).json({
            success: true,
            message: "Verification email sent. Please check your inbox."
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to resend verification email: " + error
        });
    }
};