import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
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

    about: {
      type: String,
      maxlength: 500
    },

    phone: {
      type: String
    },

    jnvBatch: {
      type: String
    },

    occupation: {
      type: String
    },

    currentAddress: {
      type: String
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
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

    directoryVisibility: {
      type: Boolean,
      default: true
    },

    showPhone: {
      type: Boolean,
      default: false
    },

    showEmail: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);