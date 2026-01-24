import User from "../models/user.js";
import EventRequest from "../models/eventRequest.js";
import News from "../models/news.js";
import { sendNotifications } from "../service/notification.js";

/**
 * One-time Admin Bootstrap
 * Works ONLY if no admin exists
 */
export const bootstrapAdmin = async (req, res) => {
  const adminExists = await User.findOne({ role: "ADMIN" });

  if (adminExists) {
    return res.status(403).json({
      message: "Admin already exists. Bootstrap disabled."
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = "ADMIN";
  await user.save();

  res.json({
    message: "Admin bootstrap successful",
    adminId: user._id
  });
};

/**
 * Assign or change role (ADMIN only)
 */
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const validRoles = ["ALUMNI", "MEMBER", "EVENT_LEAD", "ADMIN"];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = role;
  user.isMember = role === "MEMBER" || role === "ADMIN";
  await user.save();

  res.json({
    message: "User role updated successfully"
  });
};

/**
 * Block or Unblock User
 */
export const updateUserStatus = async (req, res) => {
  const { status } = req.body;
  if (!["ACTIVE", "BLOCKED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.status = status;
  await user.save();

  res.json({
    message: `User ${status.toLowerCase()} successfully`
  });
};

/**
 * List users (Admin view)
 */
export const getAllUsers = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const query = {};
  if (req.query.status === "blocked") query.isBlocked = true;

  const users = await User.find(query)
    .select("firstName lastName email isMember isBlocked isVerified createdAt")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    page,
    total,
    users
  });
};

export const blockUser = async (req, res) => {
  const { reason } = req.body;

  await User.findByIdAndUpdate(req.params.id, {
    isBlocked: true,
    blockedReason: reason,
    blockedAt: new Date()
  });

  res.json({
    success: true,
    message: "User blocked successfully"
  });
};

export const unblockUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    isBlocked: false,
    blockedReason: null,
    blockedAt: null
  });

  res.json({
    success: true,
    message: "User unblocked successfully"
  });
};

export const verifyUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, {
    isVerified: true
  });

  res.json({
    success: true,
    message: "User verified successfully"
  });
};

export const getAllPayments = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 20;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const payments = await Payment.find(filter)
    .populate("user", "firstName lastName email")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Payment.countDocuments(filter);

  res.json({
    success: true,
    total,
    payments
  });
};

export const manualVerifyPayment = async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found" });
  }

  payment.status = "SUCCESS";
  payment.verifiedAt = new Date();
  await payment.save();

  await User.findByIdAndUpdate(payment.user, {
    isMember: true
  });

  res.json({
    success: true,
    message: "Payment verified manually"
  });
};

/** List Support Tickets (Admin)
 */
export const getAllSupportTickets = async (req, res) => {
  try {
    const {
      category,
      status,
      priority,
      city,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (city) {
      query.cities = { $in: [city] };
    }

    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find(query)
      .populate("createdBy", "firstName lastName email")
      .populate("assignedHelper", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SupportTicket.countDocuments(query);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      data: tickets
    });

  } catch (error) {
    console.error("Admin Ticket List Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch tickets"
    });
  }
};

/**
 * Admin: Approve / Reject event request
 * PUT /api/admin/events/request/:id
 */
export const reviewEventRequest = async (req, res) => {
  const { status, adminRemark } = req.body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const request = await EventRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found" });

  request.status = status;
  request.adminRemark = adminRemark;
  await request.save();

  if (status === "APPROVED") {
    await User.findByIdAndUpdate(request.requestedBy, {
      role: "EVENT_LEAD"
    });
  }

  res.json({ success: true, message: "Request processed" });
};

export const createNews = async (req, res) => {
  const news = await News.create({
    ...req.body,
    createdBy: req.user.id
  });

  res.status(201).json({
    success: true,
    data: news
  });
};

export const publishNews = async (req, res) => {
  const news = await News.findById(req.params.id);
  if (!news) {
    return res.status(404).json({ success: false });
  }

  news.status = "PUBLISHED";
  news.publishedAt = new Date();
  await news.save();

  const userQuery = { status: "ACTIVE" };

  if (news.audience === "ALUMNI") {
    userQuery.isMember = true;
  }

  if (news.cities?.length) {
    userQuery["profile.city"] = { $in: news.cities };
  }

  const users = await User.find(userQuery).select("_id");

  await sendNotifications({
    title: "NESMO News",
    message: news.title,
    type: "NEWS",
    recipients: users.map(u => u._id),
    link: `/news/${news._id}`,
    meta: { newsId: news._id }
  });

  res.json({
    success: true,
    message: "News published successfully"
  });
};

export const getAllNewsAdmin = async (req, res) => {
  const news = await News.find()
    .populate("createdBy", "firstName lastName")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: news
  });
};

export const broadcastNotification = async (req, res) => {
  const { title, message, role } = req.body;

  const users = await User.find({
    status: "ACTIVE",
    ...(role && { role })
  }).select("_id");

  await sendNotifications({
    title,
    message,
    type: "SYSTEM",
    recipients: users.map(u => u._id)
  });

  res.json({
    success: true,
    message: "Broadcast sent"
  });
};