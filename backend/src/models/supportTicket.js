import mongoose from "mongoose";

const helperActionSchema = new mongoose.Schema(
    {
        helper: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "DECLINED"],
            default: "PENDING"
        },

        respondedAt: {
            type: Date
        },

        note: {
            type: String
        }
    },
    { _id: false }
);

const supportTicketSchema = new mongoose.Schema(
    {
        /* =========================
           WHO CREATED THE TICKET
        ========================== */
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        /* =========================
           COMMON FIELDS (ALL)
        ========================== */
        category: {
            type: String,
            enum: ["MEDICAL", "FINANCIAL", "CAREER", "GENERAL"],
            required: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        priority: {
            type: String,
            enum: ["LOW", "NORMAL", "HIGH", "EMERGENCY"],
            default: "NORMAL"
        },

        cities: [{
            type: String,
            required: true
        }],

        /* =========================
           HELPER SELECTION
        ========================== */
        selectedHelpers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        
        helperActions: [helperActionSchema],
        
        acceptedHelpers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        /* =========================
           CATEGORY-SPECIFIC DATA
        ========================== */
        medicalData: {
            patientName: String,
            age: Number,
            problemType: String,
            hospitalPreference: String,
            urgencyNotes: String
        },

        financialData: {
            amountRequired: Number,
            purpose: String,
            deadline: Date
        },

        careerData: {
            sector: String,
            experienceLevel: String,
            preferredRoles: [String]
        },

        /* =========================
           TICKET STATE
        ========================== */
        status: {
            type: String,
            enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
            default: "OPEN"
        }
    },
    { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
