import { addDocument, getDocuments, getDocument, updateDocument } from "../config/firestore.js";

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
            for (const helperId of selectedHelpers) {
                const helper = await getDocument('users', helperId);
                if (!helper || helper.status !== 'ACTIVE') {
                    return res.status(400).json({
                        success: false,
                        message: "One or more selected helpers are invalid or inactive"
                    });
                }
            }
        }

        /* ============================
           CREATE TICKET
        ============================= */
        const ticketData = {
            createdBy: userId,
            category,
            subject,
            description,
            priority,
            cities,
            selectedHelpers,
            status: 'OPEN',
            createdAt: new Date(),
            updatedAt: new Date(),
            helperActions: []
        };

        if (category === 'MEDICAL') ticketData.medicalData = medicalData;
        if (category === 'FINANCIAL') ticketData.financialData = financialData;
        if (category === 'CAREER') ticketData.careerData = careerData;

        const ticketId = await addDocument('supportTickets', ticketData);

        res.status(201).json({
            success: true,
            message: "Support ticket created successfully",
            data: { id: ticketId, ...ticketData }
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

        // Build filter for members
        const filters = [
            { field: 'status', operator: '==', value: 'ACTIVE' },
            { field: 'role', operator: '==', value: 'MEMBER' },
            { field: 'isMember', operator: '==', value: true }
        ];

        let helpers = await getDocuments('users', filters);

        // Enrich with profile and apply optional filters
        let enrichedHelpers = [];
        for (const helper of helpers.slice(0, parseInt(limit))) {
            try {
                const profile = helper.profile ? await getDocument('profiles', helper.profile) : {};

                // Apply optional filters
                if (city && !city.split(',').includes(profile.currentAddress)) continue;
                if (occupation && (!profile.occupation || !profile.occupation.toLowerCase().includes(occupation.toLowerCase()))) continue;
                if (sector && (!profile.sector || !profile.sector.toLowerCase().includes(sector.toLowerCase()))) continue;

                enrichedHelpers.push({
                    id: helper.uid,
                    firstName: helper.firstName,
                    lastName: helper.lastName,
                    email: helper.email,
                    profile: {
                        city: profile.currentAddress,
                        occupation: profile.occupation,
                        sector: profile.sector
                    }
                });
            } catch (err) {
                console.warn(`Failed to load profile for helper ${helper.uid}:`, err);
            }
        }

        res.status(200).json({
            success: true,
            count: enrichedHelpers.length,
            data: enrichedHelpers
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

        const ticket = await getDocument('supportTickets', ticketId);

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

        let helperAction = ticket.helperActions?.find(
            h => h.helper === helperId
        );

        if (!helperAction) {
            helperAction = { helper: helperId, status: 'PENDING' };
            ticket.helperActions = [...(ticket.helperActions || []), helperAction];
        }

        if (helperAction.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: "You already responded to this ticket"
            });
        }

        helperAction.status = action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';
        helperAction.respondedAt = new Date();
        helperAction.note = note;

        if (action === 'ACCEPT' && !ticket.assignedHelper) {
            ticket.assignedHelper = helperId;
            ticket.status = 'IN_PROGRESS';
        }

        await updateDocument('supportTickets', ticketId, {
            ...ticket,
            status: ticket.status,
            assignedHelper: ticket.assignedHelper,
            helperActions: ticket.helperActions,
            updatedAt: new Date()
        });

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