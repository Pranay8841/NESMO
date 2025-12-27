import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      select: false
    },

    authProvider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL"
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    role: {
      type: String,
      enum: ["VISITOR", "MEMBER", "EVENT_LEAD", "ADMIN"],
      default: "VISITOR"
    },

    isMember: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE"
    },

    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    }
  },
  { timestamps: true }
);

userSchema.index({ status: 1, isMember: 1 });

export default mongoose.model("User", userSchema);