import { addDocument } from "../config/firestore.js";

export const sendNotifications = async ({
    title,
    message,
    type,
    recipients,
    link,
    meta
}) => {
    if (!recipients || !recipients.length) return;

    const now = new Date();
    const promises = recipients.map(userId => {
        const docData = {
            title,
            message,
            type,
            recipient: userId,
            link: link || "",
            isRead: false,
            createdAt: now,
            updatedAt: now,
            meta: meta || {}
        };
        return addDocument("notifications", docData);
    });

    try {
        await Promise.all(promises);
    } catch (error) {
        console.error("Failed to send notifications to Firestore:", error);
    }
};

