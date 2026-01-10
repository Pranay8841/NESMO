// models/notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["NEWS", "EVENT", "SUPPORT", "PAYMENT", "SYSTEM"],
        required: true
    },

    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    link: String,

    isRead: {
        type: Boolean,
        default: false
    },

    meta: Object

}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
