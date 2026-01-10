// models/media.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        album: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
            required: true
        },

        url: {
            type: String,
            required: true
        },

        publicId: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: ["IMAGE", "VIDEO"],
            required: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        isApproved: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

mediaSchema.index({ album: 1 });

export default mongoose.model("Media", mediaSchema);
