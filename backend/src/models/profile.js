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

        joinBatch: {
            type: String
        },

        passoutBatch: {
            type: String
        },

        occupation: {
            type: String
        },

        organization: {
            type: String  // Company/School/Hospital name
        },

        sector: {
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

profileSchema.index({ currentAddress: 1 });
profileSchema.index({ occupation: 1 });
profileSchema.index({ organization: 1 });
profileSchema.index({ joinBatch: 1 });
profileSchema.index({ passoutBatch: 1 });
profileSchema.index({ bloodGroup: 1 });

export default mongoose.model("Profile", profileSchema);