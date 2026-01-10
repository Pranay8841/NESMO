// services/notification.service.js
import Notification from "../models/notification.js";

export const sendNotifications = async ({
    title,
    message,
    type,
    recipients,
    link,
    meta
}) => {

    if (!recipients || !recipients.length) return;

    const payload = recipients.map(userId => ({
        title,
        message,
        type,
        recipient: userId,
        link,
        meta
    }));

    await Notification.insertMany(payload);
};
