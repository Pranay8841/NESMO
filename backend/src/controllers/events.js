import EventRequest from "../models/eventRequest.js";
import Event from "../models/event.js";
import EventRegistration from "../models/eventRegistration.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

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
    const event = await Event.create({
        createdBy: req.user.id,
        ...req.body
    });

    res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: event
    });
};

/**
 * Get all public events
 * GET /api/events
 */
export const getEvents = async (req, res) => {
    const events = await Event.find({ status: "ACTIVE" })
        .sort({ eventDate: 1 });

    res.json({ success: true, data: events });
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
        amountPaid: req.body.amountPaid || 0
    });

    res.status(201).json({
        success: true,
        message: "Registered successfully",
        data: registration
    });
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