const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
 
    amount: Number,
    currency: String,

    status: {
        type: String,
        enum: ["CREATED", "SUCCESS", "FAILED"],
        default: "CREATED"
    },

    verifiedAt: Date,
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});
