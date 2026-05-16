// src/controllers/membership.controller.js
import razorpay from "../config/razorpay.js";
import Membership from "../models/membership.js";
import { MEMBERSHIP_PLANS } from "../config/membershipPlans.js";
import crypto from "crypto";
import User from "../models/user.js";

export const createMembershipOrder = async (req, res) => {
  try {
    const userId = req.user._id;
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

    await Membership.create({
      user: userId,
      planId,
      amount: plan.amount,
      razorpay: { orderId: order.id }
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

    const membership = await Membership.findOne({
      "razorpay.orderId": razorpay_order_id
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    membership.status = "ACTIVE";
    membership.startDate = startDate;
    membership.endDate = endDate;
    membership.razorpay.paymentId = razorpay_payment_id;
    membership.razorpay.signature = razorpay_signature;

    await membership.save();

    await User.findByIdAndUpdate(membership.user, {
      isMember: true
    });

    res.json({ success: true, message: "Membership activated" });
  } catch (error) {
    console.error("Error verifying membership payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};