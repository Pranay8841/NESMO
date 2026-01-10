// models/album.js
import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            maxlength: 500
        },

        visibility: {
            type: String,
            enum: ["PUBLIC", "PRIVATE"],
            default: "PUBLIC"
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

albumSchema.index({ visibility: 1, createdAt: -1 });

export default mongoose.model("Album", albumSchema);
