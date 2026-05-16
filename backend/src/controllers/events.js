import { addDocument, getDocuments, getDocument, updateDocument } from "../config/firestore.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

/**
 * Request to create event
 * POST /api/events/request
 */
export const requestEventCreation = async (req, res) => {
    try {
        const requestId = await addDocument('eventRequests', {
            requestedBy: req.user.id,
            status: 'PENDING',
            adminRemark: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...req.body
        });

        res.status(201).json({
            success: true,
            message: "Event request submitted for admin approval",
            data: { id: requestId, ...req.body }
        });

    } catch (err) {
        console.error("Event Request Error:", err);
        res.status(500).json({ success: false, message: "Unable to submit request" });
    }
};

/**
 * Create Event (EVENT_LEAD only)
 * POST /api/events
 */
export const createEvent = async (req, res) => {
    try {
        const eventId = await addDocument('events', {
            createdBy: req.user.id,
            status: 'ACTIVE',
            totalCollected: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...req.body
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: { id: eventId, ...req.body }
        });
    } catch (error) {
        console.error("Create Event Error:", error);
        res.status(500).json({ success: false, message: "Unable to create event" });
    }
};

/**
 * Get all public events
 * GET /api/events
 */
export const getEvents = async (req, res) => {
    try {
        const events = await getDocuments('events', [
            { field: 'status', operator: '==', value: 'ACTIVE' }
        ]);

        // Sort by eventDate
        const sorted = events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        res.json({ success: true, data: sorted });
    } catch (error) {
        console.error("Get Events Error:", error);
        res.status(500).json({ success: false, message: "Unable to fetch events" });
    }
};

/**
 * Event registrations overview (Event Lead)
 * GET /api/events/:id/dashboard
 */
export const eventDashboard = async (req, res) => {
    try {
        const eventId = req.params.id;

        const registrations = await getDocuments('eventRegistrations', [
            { field: 'event', operator: '==', value: eventId }
        ]);

        const totalAmount = registrations.reduce(
            (sum, r) => sum + (r.amountPaid || 0), 0
        );

        res.json({
            success: true,
            totalRegistrations: registrations.length,
            totalAmount
        });
    } catch (error) {
        console.error("Event Dashboard Error:", error);
        res.status(500).json({ success: false, message: "Unable to fetch dashboard" });
    }
};

/**
 * Register for event
 * POST /api/events/:id/register
 */
export const registerForEvent = async (req, res) => {
    try {
        const event = await getDocument('events', req.params.id);
        
        if (!event || event.status !== 'ACTIVE') {
            return res.status(400).json({ message: "Event not available" });
        }

        const registrationId = await addDocument('eventRegistrations', {
            event: req.params.id,
            user: req.user.id,
            paymentId: req.body.paymentId,
            amountPaid: req.body.amountPaid || 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: "Registered successfully",
            data: { id: registrationId }
        });
    } catch (error) {
        console.error("Register Event Error:", error);
        res.status(500).json({ success: false, message: "Unable to register" });
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

        const event = await getDocument('events', eventId);
        if (!event || !event.isPaid) {
            return res.status(400).json({ success: false, message: "Invalid paid event" });
        }

        const registrationId = await addDocument('eventRegistrations', {
            event: eventId,
            user: userId,
            amount: event.price,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const order = await razorpay.orders.create({
            amount: event.price * 100,
            currency: event.currency || 'INR',
            receipt: `event_${eventId}_${registrationId}`
        });

        await updateDocument('eventRegistrations', registrationId, {
            razorpayOrderId: order.id
        });

        res.status(200).json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                registrationId,
                key: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error("Create Payment Order Error:", error);
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

        const registration = await getDocument('eventRegistrations', registrationId);
        if (!registration) {
            return res.status(404).json({ success: false, message: "Registration not found" });
        }

        await updateDocument('eventRegistrations', registrationId, {
            status: 'CONFIRMED',
            isPaid: true,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            updatedAt: new Date()
        });

        // Update event total collected
        const event = await getDocument('events', registration.event);
        const newTotal = (event.totalCollected || 0) + (registration.amount || 0);
        await updateDocument('events', registration.event, {
            totalCollected: newTotal
        });

        res.status(200).json({
            success: true,
            message: "Payment successful & registration confirmed"
        });

    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: "Payment verification error" });
    }
};