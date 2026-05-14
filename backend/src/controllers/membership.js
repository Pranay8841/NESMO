// src/controllers/membership.controller.js - Firestore Version
import razorpay from "../config/razorpay.js";
import { MEMBERSHIP_PLANS } from "../config/membershipPlans.js";
import crypto from "crypto";
import { addDocument, getDocuments, updateDocument } from "../config/firestore.js";

export const createMembershipOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId } = req.body;

    const plan = MEMBERSHIP_PLANS[planId];
    if (!plan) {
      return res.status(400).json({ message: "Invalid membership plan" });
    }

    const order = await razorpay.orders.create({
      amount: plan.amount * 100,
      currency: "INR",
      receipt: `nesmo_${Date.now()}`
    });

    await addDocument('memberships', {
      user: userId,
      planId,
      amount: plan.amount,
      razorpay: { orderId: order.id },
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      orderId: order.id,
      amount: plan.amount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Error creating membership order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyMembershipPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const memberships = await getDocuments('memberships', [
      { field: 'razorpay.orderId', operator: '==', value: razorpay_order_id }
    ]);

    if (!memberships || memberships.length === 0) {
      return res.status(404).json({ message: "Membership record not found" });
    }

    const membership = memberships[0];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    await updateDocument('memberships', membership.id, {
      status: 'ACTIVE',
      startDate,
      endDate,
      'razorpay.paymentId': razorpay_payment_id,
      'razorpay.signature': razorpay_signature,
      updatedAt: new Date()
    });

    await updateDocument('users', membership.user, {
      isMember: true,
      updatedAt: new Date()
    });

    res.json({ success: true, message: "Membership activated" });
  } catch (error) {
    console.error("Error verifying membership payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};