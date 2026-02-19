import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: String,
    description: String,

    type: {
        type: String,
        enum: ["MEETUP", "SESSION", "CAMP"]
    },

    mode: {
        type: String,
        enum: ["ONLINE", "OFFLINE"]
    },

    venue: String,

    /** Location coordinates for offline events (Google Maps integration) */
    location: {
        address: String,
        lat: Number,
        lng: Number
    },

    /** Meeting link for online events (Zoom, Google Meet, etc.) */
    meetingLink: {
        type: String,
        trim: true
    },

    /** Event cover/banner image URL */
    imageUrl: {
        type: String,
        trim: true
    },

    eventDate: Date,
    registrationDeadline: Date,

    capacity: Number,

    isPaid: {
        type: Boolean,
        default: false
    },
    
    price: {
        type: Number,
        required: function () {
            return this.isPaid === true;
        }
    },
    currency: {
        type: String,
        default: "INR"
    },

    totalCollected: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["ACTIVE", "CLOSED", "CANCELLED"],
        default: "ACTIVE"
    },

    /** Track which reminders have been sent */
    remindersSent: {
        oneDayBefore: { type: Boolean, default: false },
        oneHourBefore: { type: Boolean, default: false }
    }
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
