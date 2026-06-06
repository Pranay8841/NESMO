import { addDocument, getDocuments, getDocument, updateDocument, batchWrite } from "../config/firestore.js";
import { sendNotifications } from "../service/notification.js";

/**
 * Get Admin Dashboard Stats
 * Returns aggregated statistics for the admin dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    // User Statistics
    const allUsers = await getDocuments('users', []);
    const totalUsers = allUsers.length;

    const usersByRole = {};
    const blockedUsers = allUsers.filter(u => u.status === 'BLOCKED').length;
    const unverifiedUsers = allUsers.filter(u => !u.isEmailVerified).length;

    allUsers.forEach(u => {
      usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
    });

    // Payment Statistics
    const allPayments = await getDocuments('payments', []);
    const totalPayments = allPayments.length;
    const paymentsByStatus = {};
    let totalPaymentAmount = 0;

    allPayments.forEach(p => {
      paymentsByStatus[p.status] = paymentsByStatus[p.status] || { count: 0, total: 0 };
      paymentsByStatus[p.status].count += 1;
      paymentsByStatus[p.status].total += (p.amount || 0);

      if (p.status === 'SUCCESS') {
        totalPaymentAmount += (p.amount || 0);
      }
    });

    // Support Ticket Statistics
    const allTickets = await getDocuments('supportTickets', []);
    const totalTickets = allTickets.length;
    const ticketsByPriority = {};
    const openTickets = allTickets.filter(t => ['OPEN', 'IN_PROGRESS'].includes(t.status)).length;
    const emergencyTickets = allTickets.filter(t => t.priority === 'EMERGENCY').length;

    allTickets.forEach(t => {
      ticketsByPriority[t.priority] = (ticketsByPriority[t.priority] || 0) + 1;
    });

    // News Statistics
    const allNews = await getDocuments('news', []);
    const totalNews = allNews.length;
    const publishedNews = allNews.filter(n => n.status === 'PUBLISHED').length;
    const draftNews = allNews.filter(n => n.status === 'DRAFT').length;

    // Recent Activity (last 10 items from various collections)
    const recentUsers = allUsers
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(u => ({
        id: u.id,
        timestamp: u.createdAt,
        eventType: "New Registration",
        userEntity: `${u.firstName} ${u.lastName} (${u.role})`,
        status: u.isEmailVerified ? "Verified" : "Pending"
      }));

    const recentPayments = allPayments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        timestamp: p.createdAt,
        eventType: "Payment Received",
        userEntity: `TXN-${p.id.slice(-4)} (${p.userId || 'Unknown'})`,
        status: p.status
      }));

    const recentTickets = allTickets
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        timestamp: t.createdAt,
        eventType: "Support Ticket",
        userEntity: t.subject,
        status: t.priority === "EMERGENCY" ? "Emergency" : t.status
      }));

    const recentNewsItems = allNews
      .filter(n => n.status === 'PUBLISHED')
      .sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
      .slice(0, 5)
      .map(n => ({
        id: n.id,
        timestamp: n.publishedAt || n.createdAt,
        eventType: "Article Published",
        userEntity: n.title,
        status: "Active"
      }));

    const recentActivity = [
      ...recentUsers,
      ...recentPayments,
      ...recentTickets,
      ...recentNewsItems
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
          blocked: blockedUsers,
          unverified: unverifiedUsers
        },
        payments: {
          total: totalPayments,
          byStatus: paymentsByStatus,
          totalAmount: totalPaymentAmount
        },
        tickets: {
          total: totalTickets,
          open: openTickets,
          emergency: emergencyTickets,
          byPriority: ticketsByPriority
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
  try {
    const adminUsers = await getDocuments('users', [
      { field: 'role', operator: '==', value: 'ADMIN' }
    ]);

    if (adminUsers.length > 0) {
      return res.status(403).json({
        message: "Admin already exists. Bootstrap disabled."
      });
    }

    const { email } = req.body;

    const users = await getDocuments('users', [
      { field: 'email', operator: '==', value: email }
    ]);

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    await updateDocument('users', user.id, {
      role: 'ADMIN'
    });

    res.json({
      message: "Admin bootstrap successful",
      adminId: user.id
    });
  } catch (error) {
    console.error("Bootstrap Error:", error);
    res.status(500).json({ message: "Bootstrap failed" });
  }
};

/**
 * Assign or change role (ADMIN only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ["MEMBER", "BATCH_REP", "ADMIN"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await getDocument('users', req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await updateDocument('users', req.params.id, {
      role: role,
      isMember: role === "ADMIN" || role === "BATCH_REP" ? true : user.isMember || false,
      updatedAt: new Date()
    });

    // Send system and in-app notification for role change
    const roleLabels = {
      MEMBER: "Member",
      BATCH_REP: "Batch Representative",
      ADMIN: "Admin"
    };

    try {
      await sendNotifications({
        title: "Role Change Alert",
        message: `Your role has been updated to ${roleLabels[role] || role} by an Administrator.`,
        type: "SYSTEM",
        recipients: [req.params.id],
        link: "/dashboard",
        meta: { newRole: role }
      });
    } catch (err) {
      console.error("Failed to send role update notification:", err);
    }

    res.json({
      message: "User role updated successfully"
    });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ message: "Failed to update role" });
  }
};

/**
 * Block or Unblock User
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["ACTIVE", "BLOCKED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await getDocument('users', req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await updateDocument('users', req.params.id, {
      status: status,
      updatedAt: new Date()
    });

    res.json({
      message: `User ${status.toLowerCase()} successfully`
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/**
 * List users (Admin view) with advanced filtering
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { status, role, search, verified } = req.query;

    let users = await getDocuments('users', []);

    // Apply filters
    if (status === "blocked") {
      users = users.filter(u => u.status === "BLOCKED");
    } else if (status === "active") {
      users = users.filter(u => u.status === "ACTIVE");
    }

    if (role && ["MEMBER", "BATCH_REP", "ADMIN"].includes(role)) {
      users = users.filter(u => u.role === role);
    }

    if (verified === "true") {
      users = users.filter(u => u.isEmailVerified === true);
    } else if (verified === "false") {
      users = users.filter(u => u.isEmailVerified === false);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(u =>
        u.firstName?.toLowerCase().includes(searchLower) ||
        u.lastName?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = users.length;
    const skip = (page - 1) * limit;
    const paginatedUsers = users.slice(skip, skip + limit);

    // Enrich with profile data
    let enrichedUsers = [];
    for (const user of paginatedUsers) {
      try {
        const profile = user.profile ? await getDocument('profiles', user.profile) : {};
        enrichedUsers.push({
          ...user,
          profilePhoto: profile.profilePhoto,
          city: profile.city,
          currentCompany: profile.currentCompany
        });
      } catch (err) {
        enrichedUsers.push(user);
      }
    }

    res.json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      users: enrichedUsers
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

    const user = await getDocument('users', userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent blocking other admins
    if (user.role === "ADMIN") {
      return res.status(403).json({ success: false, message: "Cannot block an admin user" });
    }

    const adminUser = req.user;
    await updateDocument('users', userId, {
      status: "BLOCKED",
      blockedReason: reason || "No reason provided",
      blockedAt: new Date(),
      blockedBy: adminUser.id || adminUser.uid,
      blockedByRole: adminUser.role,
      blockedByName: `${adminUser.firstName} ${adminUser.lastName}`.trim(),
      blockedByBatch: ""
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

    const user = await getDocument('users', userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await updateDocument('users', userId, {
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

    const user = await getDocument('users', userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await updateDocument('users', userId, {
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
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const { status } = req.query;

    let filters = [];
    if (status) {
      filters.push({ field: 'status', operator: '==', value: status });
    }

    let payments = await getDocuments('payments', filters);
    const total = payments.length;

    // Pagination
    const skip = (page - 1) * limit;
    const paginatedPayments = payments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    res.json({
      success: true,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      payments: paginatedPayments
    });
  } catch (error) {
    console.error("Get All Payments Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};

export const manualVerifyPayment = async (req, res) => {
  try {
    const payment = await getDocument('payments', req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    await updateDocument('payments', req.params.id, {
      status: "SUCCESS",
      verifiedAt: new Date()
    });

    await updateDocument('users', payment.user, {
      isMember: true
    });

    res.json({
      success: true,
      message: "Payment verified manually"
    });
  } catch (error) {
    console.error("Manual Verify Payment Error:", error);
    res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
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

    let tickets = await getDocuments('supportTickets', []);

    // Apply filters
    if (category) {
      tickets = tickets.filter(t => t.category === category);
    }
    if (status) {
      tickets = tickets.filter(t => t.status === status);
    }
    if (priority) {
      tickets = tickets.filter(t => t.priority === priority);
    }
    if (city) {
      tickets = tickets.filter(t => t.cities && t.cities.includes(city));
    }

    const total = tickets.length;
    const skip = (page - 1) * limit;
    const paginatedTickets = tickets
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      data: paginatedTickets
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
  try {
    const { status, adminRemark } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await getDocument('eventRequests', req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    await updateDocument('eventRequests', req.params.id, {
      status: status,
      adminRemark: adminRemark
    });

    res.json({ success: true, message: "Request processed" });
  } catch (error) {
    console.error("Review Event Request Error:", error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

export const createNews = async (req, res) => {
  try {
    const newsId = await addDocument('news', {
      ...req.body,
      createdBy: req.user.id,
      status: 'DRAFT',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: { id: newsId, ...req.body }
    });
  } catch (error) {
    console.error("Create News Error:", error);
    res.status(500).json({ success: false, message: "Failed to create news" });
  }
};

export const publishNews = async (req, res) => {
  try {
    const news = await getDocument('news', req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: "News not found" });
    }

    await updateDocument('news', req.params.id, {
      status: "PUBLISHED",
      publishedAt: new Date(),
      updatedAt: new Date()
    });

    // Send notifications to relevant users
    let userFilters = [{ field: 'status', operator: '==', value: 'ACTIVE' }];
    if (news.audience === "ALUMNI") {
      userFilters.push({ field: 'isMember', operator: '==', value: true });
    }

    let users = await getDocuments('users', userFilters);

    // Filter by city if specified
    if (news.cities && news.cities.length > 0) {
      // Filter users with matching cities - would need profile lookup
      // For now, just send to all active users
    }

    await sendNotifications({
      title: "NESMO News",
      message: news.title,
      type: "NEWS",
      recipients: users.map(u => u.id),
      link: `/news/${req.params.id}`,
      meta: { newsId: req.params.id }
    });

    res.json({
      success: true,
      message: "News published successfully"
    });
  } catch (error) {
    console.error("Publish News Error:", error);
    res.status(500).json({ success: false, message: "Failed to publish news" });
  }
};

export const getAllNewsAdmin = async (req, res) => {
  try {
    const news = await getDocuments('news', []);
    const sorted = news.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      data: sorted
    });
  } catch (error) {
    console.error("Get All News Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
};

export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, role } = req.body;

    let filters = [{ field: 'status', operator: '==', value: 'ACTIVE' }];
    if (role) {
      filters.push({ field: 'role', operator: '==', value: role });
    }

    const users = await getDocuments('users', filters);

    await sendNotifications({
      title,
      message,
      type: "SYSTEM",
      recipients: users.map(u => u.id)
    });

    res.json({
      success: true,
      message: "Broadcast sent"
    });
  } catch (error) {
    console.error("Broadcast Notification Error:", error);
    res.status(500).json({ success: false, message: "Failed to send broadcast" });
  }
};