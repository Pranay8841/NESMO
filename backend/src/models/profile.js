import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        about: {
            type: String,
            maxlength: 500
        },

        phone: {
            type: String
        },

        jnvBatch: {
            type: String
        },

        occupation: {
            type: String
        },

        currentAddress: {
            type: String
        },

        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        },

        profilePhoto: {
            type: String,
            default: "" // uploaded later
        }
    },
    { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);