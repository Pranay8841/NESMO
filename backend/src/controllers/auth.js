/**
 * @fileoverview Authentication Controller
 * Handles user registration, login, email verification, and OAuth authentication.
 * 
 * @module controllers/auth
 */

import User from "../models/user.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import Profile from "../models/profile.js"
import { sendVerificationEmail, generateVerificationToken, sendPasswordResetEmail } from "../utils/emailSender.js"

/**
 * Register a new user with email/password authentication.
 * Creates a profile, sends verification email, and returns success message.
 * 
 * @async
 * @function register
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with registration status
 * 
 * @example
 * // Request body
 * { "firstName": "John", "lastName": "Doe", "email": "john@example.com", "password": "secret123" }
 * 
 * // Success response (201)
 * { "message": "Registration successful...", "requiresEmailVerification": true, "email": "john@example.com" }
 */
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

        // Send verification email in background (non-blocking)
        // This allows registration to complete quickly while email is sent asynchronously
        setImmediate(async () => {
            try {
                await sendVerificationEmail(email, firstName, verificationToken);
            } catch (emailError) {
                console.error("Failed to send verification email:", emailError);
                // User can resend later from the verification prompt
            }
        });

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

/**
 * Authenticate user with email and password.
 * Validates credentials, checks email verification, and returns JWT token.
 * 
 * @async
 * @function login
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with token and user data
 * 
 * @throws {401} Invalid credentials (user not found or password mismatch)
 * @throws {403} User blocked or email not verified
 */
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

/**
 * Handle Google OAuth callback after successful authentication.
 * Generates JWT token and redirects to frontend with token.
 * 
 * @async
 * @function googleAuthCallback
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from Passport
 * @param {Object} res - Express response object
 * @returns {void} Redirects to frontend with token or error
 */
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

/**
 * Get current authenticated user's data.
 * Retrieves user info with populated profile from JWT token.
 * 
 * @async
 * @function getCurrentUser
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from auth middleware
 * @param {string} req.user.id - Authenticated user's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user data and profile
 * 
 * @requires protect middleware
 */
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

/**
 * Log out the current user.
 * For JWT-based auth, logout is primarily client-side (token removal).
 * This endpoint can be used for logging, analytics, or future token blacklisting.
 * 
 * @async
 * @function logoutUser
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming logout
 * 
 * @requires protect middleware
 */
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

/**
 * Verify user's email address using verification token.
 * Marks email as verified and clears verification token fields.
 * 
 * @async
 * @function verifyEmail
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.token - Email verification token
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with verification status
 * 
 * @throws {400} Token missing, invalid, or expired
 */
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

/**
 * Resend email verification link to user.
 * Generates new token and sends verification email.
 * Returns success even if user not found (prevents email enumeration).
 * 
 * @async
 * @function resendVerificationEmail
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with send status
 * 
 * @throws {400} Email already verified or Google OAuth account
 */
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

        // Send verification email in background (non-blocking)
        setImmediate(async () => {
            try {
                await sendVerificationEmail(email, user.firstName, verificationToken);
            } catch (emailError) {
                console.error("Failed to resend verification email:", emailError);
            }
        });

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

/**
 * Request password reset email.
 * Generates reset token and sends email to user.
 * Returns success even if user not found (prevents email enumeration).
 * 
 * @async
 * @function forgotPassword
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with send status
 */
export const forgotPassword = async (req, res) => {
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
                message: "If an account exists with this email, a password reset link has been sent."
            });
        }

        if (user.authProvider !== "LOCAL") {
            return res.status(400).json({
                message: "This account uses Google sign-in. Password reset is not available."
            });
        }

        // Generate password reset token
        const resetToken = generateVerificationToken();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetExpires;
        await user.save();

        // Send password reset email in background (non-blocking)
        setImmediate(async () => {
            try {
                await sendPasswordResetEmail(email, user.firstName, resetToken);
            } catch (emailError) {
                console.error("Failed to send password reset email:", emailError);
            }
        });

        res.status(200).json({
            success: true,
            message: "If an account exists with this email, a password reset link has been sent."
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to process password reset request: " + error
        });
    }
};

/**
 * Reset user's password using reset token.
 * Validates token, updates password, and clears reset token fields.
 * 
 * @async
 * @function resetPassword
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.token - Password reset token
 * @param {Object} req.body - Request body
 * @param {string} req.body.password - New password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with reset status
 * 
 * @throws {400} Token missing, invalid, expired, or password not provided
 */
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Reset token is required"
            });
        }

        if (!password) {
            return res.status(400).json({
                message: "New password is required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long"
            });
        }

        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        }).select("+passwordResetToken +passwordResetExpires");

        if (!user) {
            return res.status(400).json({
                message: "Password reset link is invalid or has expired. Please request a new one.",
                code: "INVALID_TOKEN"
            });
        }

        // Hash new password and update user
        const hashedPassword = await bcrypt.hash(password, 12);
        
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully. You can now log in with your new password."
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to reset password: " + error
        });
    }
};