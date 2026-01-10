import Notification from "../models/notification.js";

export const getMyNotifications = async (req, res) => {
    const notifications = await Notification.find({
        recipient: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: notifications
    });
};

export const markNotificationRead = async (req, res) => {
    await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user.id },
        { isRead: true }
    );

    res.json({ success: true });
};