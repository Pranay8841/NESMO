import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (
    req,
    res,
    next
) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            message: "Not authorized - no token"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId, role: decoded.role };

        const userExists = await User.findById(decoded.userId);
        if (!userExists || userExists.status === "BLOCKED") {
            return res.status(403).json({ message: "Access denied" });
        }
        
        if (req.user.status === "BLOCKED") {
            return res.status(403).json({ message: "Account is blocked" });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Not authorized - invalid token"
        });
    }
}

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