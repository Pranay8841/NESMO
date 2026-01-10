// models/news.js
import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    summary: {
        type: String,
        required: true,
        maxlength: 300
    },

    content: {
        type: String,
        required: true
    },

    coverImage: {
        type: String
    },

    status: {
        type: String,
        enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
        default: "DRAFT"
    },

    audience: {
        type: String,
        enum: ["ALL", "ALUMNI"],
        default: "ALL"
    },

    cities: [{
        type: String
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    publishedAt: Date

}, { timestamps: true });

newsSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.model("News", newsSchema);
