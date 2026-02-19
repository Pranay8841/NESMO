import EventRequest from "../models/eventRequest.js";
import Event from "../models/event.js";
import EventRegistration from "../models/eventRegistration.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import uploadImageToCloudinary from "../utils/imageUploader.js";
import { processEventReminders, sendManualReminder } from "../service/eventReminder.js";

/**
 * Request to create event
 * POST /api/events/request
 */
export const requestEventCreation = async (req, res) => {
    try {
        const request = await EventRequest.create({
            requestedBy: req.user.id,
            ...req.body
        });

        res.status(201).json({
            success: true,
            message: "Event request submitted for admin approval",
            data: request
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Unable to submit request" });
    }
};

/**
 * Create Event (EVENT_LEAD only)
 * POST /api/events
 */
export const createEvent = async (req, res) => {
    try {
        let imageUrl = null;
        
        // Handle image upload if provided
        if (req.files && req.files.image) {
            const result = await uploadImageToCloudinary(req.files.image, "event-images");
            imageUrl = result.secure_url;
        }

        const event = await Event.create({
            createdBy: req.user.id,
            ...req.body,
            imageUrl
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to create event" });
    }
};

/**
 * Update Event (EVENT_LEAD/ADMIN only - must be creator or admin)
 * PUT /api/events/:id
 */
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Check ownership (creator or admin)
        const isAdmin = req.user.role === "ADMIN";
        const isCreator = event.createdBy.toString() === req.user.id.toString();
        
        if (!isAdmin && !isCreator) {
            return res.status(403).json({ success: false, message: "Not authorized to update this event" });
        }

        // Handle image upload if provided
        if (req.files && req.files.image) {
            const result = await uploadImageToCloudinary(req.files.image, "event-images");
            req.body.imageUrl = result.secure_url;
        }

        // Update allowed fields
        const allowedUpdates = [
            "title", "description", "type", "mode", "venue", "meetingLink",
            "eventDate", "registrationDeadline", "capacity", "isPaid", "price",
            "currency", "status", "imageUrl", "location"
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                event[field] = req.body[field];
            }
        });

        await event.save();

        res.json({
            success: true,
            message: "Event updated successfully",
            data: event
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to update event" });
    }
};

/**
 * Delete Event (EVENT_LEAD/ADMIN only - must be creator or admin)
 * DELETE /api/events/:id
 */
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        // Check ownership (creator or admin)
        const isAdmin = req.user.role === "ADMIN";
        const isCreator = event.createdBy.toString() === req.user.id.toString();
        
        if (!isAdmin && !isCreator) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this event" });
        }

        // Check if event has confirmed paid registrations
        const paidRegistrations = await EventRegistration.countDocuments({
            event: req.params.id,
            isPaid: true,
            status: "CONFIRMED"
        });

        if (paidRegistrations > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete event with ${paidRegistrations} paid registrations. Cancel the event instead.`
            });
        }

        // Delete all registrations for this event
        await EventRegistration.deleteMany({ event: req.params.id });
        
        // Delete the event
        await Event.deleteOne({ _id: req.params.id });

        res.json({
            success: true,
            message: "Event deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to delete event" });
    }
};

/**
 * Get all public events
 * GET /api/events
 */
export const getEvents = async (req, res) => {
    const events = await Event.find({ status: "ACTIVE" })
        .populate("createdBy", "firstName lastName")
        .sort({ eventDate: 1 });

    res.json({ success: true, data: events });
};

/**
 * Get single event by ID
 * GET /api/events/:id
 */
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("createdBy", "firstName lastName");
        
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        res.json({ success: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to fetch event" });
    }
};

/**
 * Get user's own event requests
 * GET /api/events/my-requests
 */
export const getMyEventRequests = async (req, res) => {
    try {
        const requests = await EventRequest.find({ requestedBy: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to fetch requests" });
    }
};

/**
 * Get user's event registrations
 * GET /api/events/my-registrations
 */
export const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await EventRegistration.find({ user: req.user.id })
            .populate("event")
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to fetch registrations" });
    }
};

/**
 * Check if user is registered for an event
 * GET /api/events/:id/registration-status
 */
export const getRegistrationStatus = async (req, res) => {
    try {
        const registration = await EventRegistration.findOne({
            event: req.params.id,
            user: req.user.id
        });
        
        res.json({ 
            success: true, 
            isRegistered: !!registration,
            registration: registration || null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to check registration" });
    }
};

/**
 * Get events created by user (for Event Leads)
 * GET /api/events/my-events
 */
export const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: "Unable to fetch events" });
    }
};

/**
 * Event registrations overview (Event Lead)
 * GET /api/events/:id/dashboard
 */
export const eventDashboard = async (req, res) => {
    const eventId = req.params.id;

    const registrations = await EventRegistration.find({ event: eventId });

    const totalAmount = registrations.reduce(
        (sum, r) => sum + (r.amountPaid || 0), 0
    );

    res.json({
        success: true,
        totalRegistrations: registrations.length,
        totalAmount
    });
};

/**
 * Register for event
 * POST /api/events/:id/register
 */
export const registerForEvent = async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event || event.status !== "ACTIVE") {
        return res.status(400).json({ message: "Event not available" });
    }

    const registration = await EventRegistration.create({
        event: event._id,
        user: req.user.id,
        paymentId: req.body.paymentId,
        amountPaid: req.body.amountPaid || 0,
        status: event.isPaid ? "PENDING" : "CONFIRMED"
    });

    res.status(201).json({
        success: true,
        message: "Registered successfully",
        data: registration
    });
};

/**
 * Unregister from event
 * DELETE /api/events/:id/unregister
 */
export const unregisterFromEvent = async (req, res) => {
    try {
        const registration = await EventRegistration.findOne({
            event: req.params.id,
            user: req.user.id
        });

        if (!registration) {
            return res.status(404).json({ message: "Registration not found" });
        }

        // Don't allow unregistering from paid events that are confirmed
        if (registration.isPaid && registration.status === "CONFIRMED") {
            return res.status(400).json({ 
                message: "Cannot unregister from paid events. Please contact support for refund." 
            });
        }

        await EventRegistration.deleteOne({ _id: registration._id });

        res.json({
            success: true,
            message: "Successfully unregistered from event"
        });
    } catch (error) {
        res.status(500).json({ message: "Unable to unregister" });
    }
};

/**
 * CREATE PAYMENT ORDER
 * POST /api/events/:eventId/pay
 */
export const createEventPaymentOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event || !event.isPaid) {
            return res.status(400).json({ success: false, message: "Invalid paid event" });
        }

        const registration = await EventRegistration.create({
            event: eventId,
            user: userId,
            amount: event.price
        });

        const order = await razorpay.orders.create({
            amount: event.price * 100,
            currency: event.currency,
            receipt: `event_${eventId}_${registration._id}`
        });

        registration.razorpayOrderId = order.id;
        await registration.save();

        res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                registrationId: registration._id,
                key: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Payment initiation failed" });
    }
};

/**
 * VERIFY PAYMENT
 * POST /api/events/payment/verify
 */
export const verifyEventPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            registrationId
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        const registration = await EventRegistration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        registration.status = "CONFIRMED";
        registration.isPaid = true;
        registration.razorpayPaymentId = razorpay_payment_id;
        registration.razorpaySignature = razorpay_signature;
        await registration.save();

        /* Update event total */
        await Event.findByIdAndUpdate(registration.event, {
            $inc: { totalCollected: registration.amount }
        });

        res.status(200).json({
            success: true,
            message: "Payment successful & registration confirmed"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Payment verification error" });
    }
};

/**
 * Process Event Reminders (Cron endpoint)
 * POST /api/events/reminders/process
 * Can be called by external cron service or scheduled task
 * Protected by API key in header: x-cron-secret
 */
export const processReminders = async (req, res) => {
    try {
        // Simple security: check for cron secret (set in env)
        const cronSecret = req.headers["x-cron-secret"];
        if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const results = await processEventReminders();
        
        res.json({
            success: true,
            message: "Reminders processed",
            data: results
        });
    } catch (error) {
        console.error("Error processing reminders:", error);
        res.status(500).json({ success: false, message: "Failed to process reminders" });
    }
};

/**
 * Send Manual Reminder for Event (Admin only)
 * POST /api/events/:id/send-reminder
 */
export const triggerEventReminder = async (req, res) => {
    try {
        const { reminderType } = req.body; // "oneDay" or "oneHour"
        
        const results = await sendManualReminder(
            req.params.id, 
            reminderType || "oneHour"
        );
        
        res.json({
            success: true,
            message: `Reminder sent to ${results.emailsSent} users`,
            data: results
        });
    } catch (error) {
        console.error("Error sending manual reminder:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Failed to send reminder" 
        });
    }
};