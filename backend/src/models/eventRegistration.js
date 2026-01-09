import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    /* PAYMENT */
    isPaid: {
        type: Boolean,
        default: false
    },
    amount: Number,

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,


    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "FAILED"],
        default: "PENDING"
    }
}, { timestamps: true });

eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model("EventRegistration", eventRegistrationSchema);
