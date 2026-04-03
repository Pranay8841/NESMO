import "./config/env.js";

import express from "express";
import cors from "cors";
import passport from "passport";
import "./config/passport.js"; // Must be imported before routes that use passport

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import profileRoutes from "./routes/profile.js";
import membershipRoutes from "./routes/membership.js";
import helplineRoutes from "./routes/helpline.js";
import eventRoutes from "./routes/events.js";
import albumRoutes from "./routes/album.js";
import discussionRoutes from "./routes/discussion.js";

import connectDB from "./config/mongodb.js";
import fileUpload from "express-fileupload"
import cloudinaryConnect from "./config/cloudinary.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
  })
);

cloudinaryConnect();

// Health check endpoint (for warming up cold starts)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/alumni-directory", profileRoutes);
app.use("/api/membership", membershipRoutes);
app.use("/api/helpline", helplineRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/discussions", discussionRoutes);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
