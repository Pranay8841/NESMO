import User from "../models/user.js";
import EventRequest from "../models/eventRequest.js";
import Event from "../models/event.js";
import News from "../models/news.js";
import Payment from "../models/payment.js";
import SupportTicket from "../models/supportTicket.js";
import { sendNotifications } from "../service/notification.js";

/**
 * Get Admin Dashboard Stats
 * Returns aggregated statistics for the admin dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    // User Statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    const blockedUsers = await User.countDocuments({ status: "BLOCKED" });
    const unverifiedUsers = await User.countDocuments({ isEmailVerified: false });

    // Payment Statistics
    const totalPayments = await Payment.countDocuments();
    const paymentsByStatus = await Payment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } }
    ]);
    const totalPaymentAmount = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Support Ticket Statistics
    const totalTickets = await SupportTicket.countDocuments();
    const ticketsByPriority = await SupportTicket.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);
    const openTickets = await SupportTicket.countDocuments({ 
      status: { $in: ["OPEN", "IN_PROGRESS"] } 
    });
    const emergencyTickets = await SupportTicket.countDocuments({ priority: "EMERGENCY" });

    // News Statistics
    const totalNews = await News.countDocuments();
    const publishedNews = await News.countDocuments({ status: "PUBLISHED" });
    const draftNews = await News.countDocuments({ status: "DRAFT" });

    // Recent Activity (last 10 items from various collections)
    const recentUsers = await User.find()
      .select("firstName lastName role createdAt isEmailVerified")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find()
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTickets = await SupportTicket.find()
      .populate("createdBy", "firstName lastName")
      .select("subject priority status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentNews = await News.find()
      .select("title status publishedAt createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    // Build recent activity feed
    const recentActivity = [
      ...recentUsers.map(u => ({
        id: u._id,
        timestamp: u.createdAt,
        eventType: "New Registration",
        userEntity: `${u.firstName} ${u.lastName} (${u.role})`,
        status: u.isEmailVerified ? "Verified" : "Pending"
      })),
      ...recentPayments.map(p => ({
        id: p._id,
        timestamp: p.createdAt,
        eventType: "Payment Received",
        userEntity: `TXN-${p._id.toString().slice(-4)} (${p.user?.firstName || 'Unknown'} ${p.user?.lastName?.charAt(0) || ''})`,
        status: p.status === "SUCCESS" ? "Success" : p.status === "FAILED" ? "Failed" : "Pending"
      })),
      ...recentTickets.map(t => ({
        id: t._id,
        timestamp: t.createdAt,
        eventType: "Support Ticket",
        userEntity: t.subject,
        status: t.priority === "EMERGENCY" ? "Emergency" : t.status === "OPEN" ? "Active" : "Pending"
      })),
      ...recentNews.filter(n => n.status === "PUBLISHED").map(n => ({
        id: n._id,
        timestamp: n.publishedAt || n.createdAt,
        eventType: "Article Published",
        userEntity: n.title,
        status: "Active"
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
          blocked: blockedUsers,
          unverified: unverifiedUsers
        },
        payments: {
          total: totalPayments,
          byStatus: paymentsByStatus.reduce((acc, p) => ({ ...acc, [p._id]: { count: p.count, total: p.total } }), {}),
          totalAmount: totalPaymentAmount[0]?.total || 0
        },
        tickets: {
          total: totalTickets,
          open: openTickets,
          emergency: emergencyTickets,
          byPriority: ticketsByPriority.reduce((acc, t) => ({ ...acc, [t._id]: t.count }), {})
        },
        news: {
          total: totalNews,
          published: publishedNews,
          draft: draftNews
        },
        recentActivity
      }
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard stats"
    });
  }
};

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
 * List users (Admin view) with advanced filtering
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { status, role, search, verified } = req.query;

    const query = {};
    
    // Filter by blocked status
    if (status === "blocked") query.status = "BLOCKED";
    else if (status === "active") query.status = "ACTIVE";
    
    // Filter by role
    if (role && ["ALUMNI", "MEMBER", "EVENT_LEAD", "ADMIN"].includes(role)) {
      query.role = role;
    }
    
    // Filter by email verification
    if (verified === "true") query.isEmailVerified = true;
    else if (verified === "false") query.isEmailVerified = false;
    
    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("firstName lastName email role isMember status isEmailVerified blockedReason blockedAt createdAt")
      .populate("profile", "profilePhoto city currentCompany")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      users
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch users"
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent blocking other admins
    if (user.role === "ADMIN") {
      return res.status(403).json({ success: false, message: "Cannot block an admin user" });
    }

    await User.findByIdAndUpdate(userId, {
      status: "BLOCKED",
      blockedReason: reason || "No reason provided",
      blockedAt: new Date()
    });

    res.json({
      success: true,
      message: "User blocked successfully"
    });
  } catch (error) {
    console.error("Block User Error:", error);
    res.status(500).json({ success: false, message: "Failed to block user" });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndUpdate(userId, {
      status: "ACTIVE",
      blockedReason: null,
      blockedAt: null
    });

    res.json({
      success: true,
      message: "User unblocked successfully"
    });
  } catch (error) {
    console.error("Unblock User Error:", error);
    res.status(500).json({ success: false, message: "Failed to unblock user" });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await User.findByIdAndUpdate(userId, {
      isEmailVerified: true
    });

    res.json({
      success: true,
      message: "User email verified successfully"
    });
  } catch (error) {
    console.error("Verify User Error:", error);
    res.status(500).json({ success: false, message: "Failed to verify user" });
  }
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
 * Admin: Get all event requests
 * GET /api/admin/events/requests
 */
export const getAllEventRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const requests = await EventRequest.find(query)
      .populate("requestedBy", "firstName lastName email")
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch event requests" });
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
    // Promote user to EVENT_LEAD if not already
    await User.findByIdAndUpdate(request.requestedBy, {
      role: "EVENT_LEAD"
    });

    // Create the actual Event from the approved request
    await Event.create({
      createdBy: request.requestedBy,
      title: request.title,
      description: request.description,
      type: request.type,
      mode: request.mode,
      venue: request.venue,
      eventDate: request.eventDate,
      capacity: request.expectedCapacity,
      isPaid: request.isPaid,
      price: request.price,
      status: "ACTIVE"
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

/**
 * Migration: Create events from approved requests that don't have events yet.
 * POST /api/admin/events/migrate-approved
 */
export const migrateApprovedRequests = async (req, res) => {
  try {
    // Find all approved event requests
    const approvedRequests = await EventRequest.find({ status: "APPROVED" });
    
    let created = 0;
    let skipped = 0;
    
    for (const request of approvedRequests) {
      // Check if event already exists for this request
      const existingEvent = await Event.findOne({
        createdBy: request.requestedBy,
        title: request.title,
        eventDate: request.eventDate
      });
      
      if (existingEvent) {
        skipped++;
        continue;
      }
      
      // Create the event
      await Event.create({
        createdBy: request.requestedBy,
        title: request.title,
        description: request.description,
        type: request.type,
        mode: request.mode,
        venue: request.venue,
        eventDate: request.eventDate,
        capacity: request.expectedCapacity,
        isPaid: request.isPaid,
        price: request.price,
        status: "ACTIVE"
      });
      created++;
    }
    
    res.json({
      success: true,
      message: `Migration complete: ${created} events created, ${skipped} already existed`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Migration failed", error: error.message });
  }
};