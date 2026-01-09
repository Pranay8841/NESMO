import express from "express";
import { protect, authorize } from "../middleware/auth.js";

import {
    requestEventCreation,
    createEvent,
    registerForEvent,
    getEvents,
    eventDashboard,
    createEventPaymentOrder,
    verifyEventPayment
} from "../controllers/events.js"

import {
    reviewEventRequest
} from "../controllers/admin.js";

const router = express.Router();
/* Event Request */
router.post("/request", protect, requestEventCreation);

/* Admin */
router.put(
    "/admin/request/:id",
    protect,
    authorize("ADMIN"),
    reviewEventRequest
);

/* Events */
router.post(
    "/",
    protect,
    authorize("EVENT_LEAD"),
    createEvent
);

router.get("/", getEvents);

router.post(
    "/:id/register",
    protect,
    registerForEvent
);

router.get(
    "/:id/dashboard",
    protect,
    authorize("EVENT_LEAD"),
    eventDashboard
);

router.post("/:id/pay", protect, createEventPaymentOrder);
router.post("/payment/verify", protect, verifyEventPayment);

export default router;