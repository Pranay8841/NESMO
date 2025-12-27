// src/models/membership.js
import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        planId: {
            type: String,
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        paymentProvider: {
            type: String,
            enum: ["RAZORPAY"],
            default: "RAZORPAY"
        },

        razorpay: {
            orderId: String,
            paymentId: String,
            signature: String
        },

        status: {
            type: String,
            enum: ["PENDING", "ACTIVE", "EXPIRED", "FAILED"],
            default: "PENDING"
        },

        startDate: Date,
        endDate: Date
    },
    { timestamps: true }
);

export default mongoose.model("Membership", membershipSchema);
