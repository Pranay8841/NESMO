import { getDocuments, updateDocument } from "../config/firestore.js";

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await getDocuments('notifications', [
            { field: 'recipient', operator: '==', value: req.user.id }
        ]);
        const sorted = notifications.sort((a, b) => {
            const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
            const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
            return timeB - timeA;
        });

        res.json({ success: true, data: sorted });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const notifId = req.params.id;
        await updateDocument('notifications', notifId, { isRead: true, updatedAt: new Date() });

        res.json({ success: true });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ success: false, message: 'Failed to mark notification' });
    }
};