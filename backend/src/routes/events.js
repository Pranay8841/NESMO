import express from "express";
import { protect, authorize } from "../middleware/auth.js";

import {
    requestEventCreation,
    createEvent,
    registerForEvent,
    getEvents,
    getEventById,
    getMyEventRequests,
    getMyRegistrations,
    getRegistrationStatus,
    getMyEvents,
    eventDashboard,
    createEventPaymentOrder,
    verifyEventPayment
} from "../controllers/events.js"

import {
    reviewEventRequest
} from "../controllers/admin.js";

const router = express.Router();

/* Public - static routes first */
router.get("/", getEvents);

/* Protected - User routes (static paths before dynamic) */
router.post("/request", protect, requestEventCreation);
router.get("/user/my-requests", protect, getMyEventRequests);
router.get("/user/my-registrations", protect, getMyRegistrations);

/* Event Lead routes (static paths before dynamic) */
router.get("/lead/my-events", protect, authorize("EVENT_LEAD", "ADMIN"), getMyEvents);
router.post("/create", protect, authorize("EVENT_LEAD", "ADMIN"), createEvent);

/* Payment verify (static path) */
router.post("/payment/verifyEventPayment", protect, verifyEventPayment);

/* Admin (static path) */
router.put(
    "/admin/request/:id",
    protect,
    authorize("ADMIN"),
    reviewEventRequest
);

/* Dynamic routes with :id MUST come last */
router.get("/:id", getEventById);
router.get("/:id/registration-status", protect, getRegistrationStatus);
router.post("/:id/register", protect, registerForEvent);
router.post("/:id/payment/create-order", protect, createEventPaymentOrder);
router.get("/:id/dashboard", protect, authorize("EVENT_LEAD", "ADMIN"), eventDashboard);

export default router;