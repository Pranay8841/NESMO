import "./config/env.js";

import express from "express";
import cors from "cors";
import passport from "passport";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import profileRoutes from "./routes/profile.js";
import connectDB from "./config/mongodb.js";
import "./config/passport.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/alumni-directory", profileRoutes);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
