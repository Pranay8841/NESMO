/**
 * @fileoverview Authentication Middleware
 * Provides JWT verification and role-based authorization for protected routes.
 * 
 * @module middleware/auth
 */

import jwt from 'jsonwebtoken';
import User from '../models/user.js';

/**
 * Protect middleware - Validates JWT token and attaches user to request.
 * Verifies Bearer token, checks if user exists and is not blocked.
 * 
 * @async
 * @function protect
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @throws {401} No token provided or invalid token
 * @throws {403} Account is blocked
 * 
 * @example
 * // Usage in routes
 * router.get('/protected-route', protect, controllerFunction);
 * 
 * // After middleware, req.user contains:
 * // { id: ObjectId, role: "VISITOR" | "MEMBER" | "EVENT_LEAD" | "ADMIN" }
 */
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized - no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("role status");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.status === "BLOCKED") {
            return res.status(403).json({ message: "Account is blocked" });
        }

        req.user = {
            id: user._id,
            role: user.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized - invalid token" });
    }
};


/**
 * Authorize middleware - Restricts access based on user roles.
 * Must be used after protect middleware.
 * 
 * @function authorize
 * @param {...string} roles - Allowed roles (e.g., "ADMIN", "EVENT_LEAD")
 * @returns {Function} Express middleware function
 * 
 * @throws {403} User role not authorized
 * 
 * @example
 * // Allow only ADMIN and EVENT_LEAD
 * router.post('/admin-action', protect, authorize('ADMIN', 'EVENT_LEAD'), controllerFunction);
 * 
 * // Allow only ADMIN
 * router.use(protect);
 * router.use(authorize('ADMIN'));
 */
export const authorize = (
    ...roles
) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            message: `User role '${req.user.role}' is not authorized to access this route`
        });
    }

    next();
}