import mongoose from "mongoose";

const eventRequestSchema = new mongoose.Schema({
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["MEETUP", "SESSION", "CAMP"],
        required: true
    },

    mode: {
        type: String,
        enum: ["ONLINE", "OFFLINE"],
        required: true
    },

    venue: String,

    eventDate: {
        type: Date,
        required: true
    },

    expectedCapacity: Number,

    isPaid: {
        type: Boolean,
        default: false
    },

    price: Number,

    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING"
    },

    adminRemark: String
}, { timestamps: true });

export default mongoose.model("EventRequest", eventRequestSchema);
