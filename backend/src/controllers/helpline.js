import SupportTicket from "../models/supportTicket.js";
import User from "../models/user.js";

/**
 * CREATE SUPPORT TICKET
 * POST /api/support/tickets
 */
export const createSupportTicket = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            category,
            subject,
            description,
            priority,
            cities = [],
            selectedHelpers = [],
            medicalData,
            financialData,
            careerData
        } = req.body;

        /* ============================
           BASIC VALIDATIONS (ALL)
        ============================= */
        if (!category || !subject || !description) {
            return res.status(400).json({
                success: false,
                message: "Category, subject and description are required"
            });
        }

        /* ============================
           CATEGORY-SPECIFIC VALIDATION
        ============================= */
        switch (category) {

            /* ===== MEDICAL ===== */
            case "MEDICAL":
                if (!cities.length) {
                    return res.status(400).json({
                        success: false,
                        message: "At least one city is required for medical emergency"
                    });
                }

                if (!medicalData || !medicalData.problemType) {
                    return res.status(400).json({
                        success: false,
                        message: "Medical problem details are required"
                    });
                }

                break;

            /* ===== FINANCIAL ===== */
            case "FINANCIAL":
                if (!financialData || !financialData.amountRequired) {
                    return res.status(400).json({
                        success: false,
                        message: "Amount is required for financial emergency"
                    });
                }
                break;

            /* ===== CAREER ===== */
            case "CAREER":
                if (!cities.length) {
                    return res.status(400).json({
                        success: false,
                        message: "City selection is required for career support"
                    });
                }

                if (!careerData || !careerData.sector) {
                    return res.status(400).json({
                        success: false,
                        message: "Career sector is required"
                    });
                }
                break;

            /* ===== GENERAL ===== */
            case "GENERAL":
                // No extra validation
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid support category"
                });
        }

        /* ============================
           VALIDATE SELECTED HELPERS
        ============================= */
        if (selectedHelpers.length > 0) {
            const helpers = await User.find({
                _id: { $in: selectedHelpers },
                status: "ACTIVE"
            });

            if (helpers.length !== selectedHelpers.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more selected helpers are invalid or inactive"
                });
            }
        }

        /* ============================
           CREATE TICKET
        ============================= */
        const ticket = await SupportTicket.create({
            createdBy: userId,

            category,
            subject,
            description,
            priority,
            cities,

            selectedHelpers,

            medicalData: category === "MEDICAL" ? medicalData : undefined,
            financialData: category === "FINANCIAL" ? financialData : undefined,
            careerData: category === "CAREER" ? careerData : undefined
        });

        res.status(201).json({
            success: true,
            message: "Support ticket created successfully",
            data: ticket
        });

    } catch (error) {
        console.error("Create Ticket Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create support ticket"
        });
    }
};

/**
 * SEARCH HELPERS (ALUMNI ONLY)
 * GET /api/helpers/search
 */
export const searchHelpers = async (req, res) => {
    try {
        const {
            city,
            occupation,
            sector,
            limit = 20
        } = req.query;

        const query = {
            status: "ACTIVE",
            role: "MEMBER",
            isMember: true
        };

        /* City */
        if (city) {
            query["profile.city"] = { $in: city.split(",") };
        }

        /* Occupation */
        if (occupation) {
            query["profile.occupation"] = {
                $regex: occupation,
                $options: "i"
            };
        }

        /* Sector (Career) */
        if (sector) {
            query["profile.sector"] = {
                $regex: sector,
                $options: "i"
            };
        }


        const helpers = await User.find(query)
            .populate("profile", "city occupation sector")
            .select("firstName lastName email profile")
            .limit(Number(limit))
            .lean();

        res.status(200).json({
            success: true,
            count: helpers.length,
            data: helpers
        });

    } catch (error) {
        console.error("Helper Search Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to search helpers"
        });
    }
};

/**
 * HELPER ACCEPT / DECLINE TICKET
 * POST /api/support/tickets/:ticketId/respond
 */
export const respondToTicket = async (req, res) => {
    try {
        const helperId = req.user.id;
        const { ticketId } = req.params;
        const { action, note } = req.body;

        if (!["ACCEPT", "DECLINE"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action"
            });
        }

        const ticket = await SupportTicket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (!ticket.selectedHelpers.includes(helperId)) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this ticket"
            });
        }

        let helperAction = ticket.helperActions.find(
            h => h.helper.toString() === helperId
        );

        if (!helperAction) {
            helperAction = {
                helper: helperId
            };
            ticket.helperActions.push(helperAction);
        }

        if (helperAction.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "You already responded to this ticket"
            });
        }

        helperAction.status = action === "ACCEPT" ? "ACCEPTED" : "DECLINED";
        helperAction.respondedAt = new Date();
        helperAction.note = note;

        if (action === "ACCEPT" && !ticket.assignedHelper) {
            ticket.assignedHelper = helperId;
            ticket.status = "IN_PROGRESS";
        }

        await ticket.save();

        res.status(200).json({
            success: true,
            message: `Ticket ${action.toLowerCase()}ed successfully`
        });

    } catch (error) {
        console.error("Respond Ticket Error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to respond to ticket"
        });
    }
};