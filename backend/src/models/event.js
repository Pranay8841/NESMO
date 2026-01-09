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
    }
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
