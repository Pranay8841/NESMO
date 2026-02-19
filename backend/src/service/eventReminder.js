/**
 * @fileoverview Event Reminder Service
 * Handles sending email and in-app notifications for upcoming events.
 * Reminders are sent 1 day before and 1 hour before event start.
 * 
 * @module service/eventReminder
 */

import Event from "../models/event.js";
import EventRegistration from "../models/eventRegistration.js";
import User from "../models/user.js";
import Profile from "../models/profile.js";
import { sendNotifications } from "./notification.js";
import { Resend } from "resend";
import Brevo from "@getbrevo/brevo";

// Initialize email clients
let brevoClient = null;
if (process.env.BREVO_API_KEY) {
    brevoClient = new Brevo.TransactionalEmailsApi();
    brevoClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Format date for display in email
 */
const formatEventDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

/**
 * Generate event reminder email HTML template
 */
const getEventReminderHtml = (firstName, event, reminderType) => {
    const isOneHour = reminderType === "oneHour";
    const timeMessage = isOneHour 
        ? "starts in <strong>1 hour</strong>" 
        : "is happening <strong>tomorrow</strong>";
    
    const locationInfo = event.mode === "ONLINE" 
        ? `<p style="margin: 8px 0; color: #4b5563;">
            <strong>Join Online:</strong> ${event.meetingLink ? `<a href="${event.meetingLink}" style="color: #4F46E5;">Click here to join</a>` : "Link will be shared soon"}
           </p>`
        : `<p style="margin: 8px 0; color: #4b5563;">
            <strong>Venue:</strong> ${event.venue || "TBA"}
            ${event.location?.address ? `<br><span style="color: #6b7280; font-size: 14px;">${event.location.address}</span>` : ""}
            ${event.location?.lat ? `<br><a href="https://www.google.com/maps?q=${event.location.lat},${event.location.lng}" style="color: #4F46E5; font-size: 14px;">View on Google Maps →</a>` : ""}
           </p>`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">NESMO</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Event Reminder</p>
            </td>
          </tr>
          ${event.imageUrl ? `
          <tr>
            <td style="padding: 0;">
              <img src="${event.imageUrl}" alt="${event.title}" style="width: 100%; max-height: 200px; object-fit: cover;">
            </td>
          </tr>
          ` : ""}
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 22px; font-weight: 600;">Hi ${firstName}!</h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Just a friendly reminder that the event you registered for ${timeMessage}!
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #D97706; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <h3 style="margin: 0 0 8px; color: #92400e; font-size: 18px; font-weight: 600;">${event.title}</h3>
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  📅 ${formatEventDate(event.eventDate)}
                </p>
              </div>

              <div style="background-color: #f9fafb; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                ${locationInfo}
                <p style="margin: 8px 0 0; color: #4b5563;">
                  <strong>Type:</strong> ${event.type} • ${event.mode === "ONLINE" ? "🌐 Online" : "📍 In-Person"}
                </p>
              </div>

              ${isOneHour ? `
              <table role="presentation" style="margin: 24px auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); border-radius: 8px;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/events" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      View Event Details
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
              <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6; text-align: center;">
                We look forward to seeing you there! 🎉
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} NESMO Alumni Network. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

/**
 * Send reminder email to a single user
 */
const sendReminderEmail = async (email, firstName, event, reminderType) => {
    const isOneHour = reminderType === "oneHour";
    const subject = isOneHour 
        ? `⏰ Starting in 1 Hour: ${event.title}`
        : `📅 Tomorrow: ${event.title} - Don't Forget!`;
    
    const html = getEventReminderHtml(firstName, event, reminderType);
    const text = `Hi ${firstName}, this is a reminder that "${event.title}" ${isOneHour ? "starts in 1 hour" : "is happening tomorrow"} on ${formatEventDate(event.eventDate)}. ${event.mode === "ONLINE" ? `Join: ${event.meetingLink || "Link coming soon"}` : `Venue: ${event.venue || "TBA"}`}`;

    // Try Brevo first
    if (brevoClient) {
        try {
            const sendSmtpEmail = new Brevo.SendSmtpEmail();
            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = html;
            sendSmtpEmail.textContent = text;
            sendSmtpEmail.sender = { 
                name: "NESMO Events", 
                email: process.env.BREVO_FROM_EMAIL || process.env.SMTP_FROM 
            };
            sendSmtpEmail.to = [{ email, name: firstName }];

            await brevoClient.sendTransacEmail(sendSmtpEmail);
            return true;
        } catch (error) {
            console.error("Brevo reminder email error:", error.response?.body || error);
        }
    }

    // Try Resend as fallback
    if (resend) {
        try {
            const { error } = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || "NESMO <onboarding@resend.dev>",
                to: email,
                subject,
                html,
                text,
            });
            if (!error) return true;
        } catch (error) {
            console.error("Resend reminder email error:", error);
        }
    }

    console.warn(`Could not send reminder email to ${email} - no email provider available`);
    return false;
};

/**
 * Send reminders to all registered users for an event
 */
const sendEventReminders = async (event, reminderType) => {
    // Get all confirmed registrations for this event
    const registrations = await EventRegistration.find({
        event: event._id,
        status: "CONFIRMED"
    }).populate({
        path: "user",
        select: "email profile",
        populate: {
            path: "profile",
            select: "firstName"
        }
    });

    if (registrations.length === 0) {
        console.log(`No confirmed registrations for event: ${event.title}`);
        return { emailsSent: 0, notificationsSent: 0 };
    }

    let emailsSent = 0;
    const userIds = [];

    // Send email to each registered user
    for (const registration of registrations) {
        const user = registration.user;
        if (!user?.email) continue;

        const firstName = user.profile?.firstName || "Alumni";
        userIds.push(user._id);

        try {
            const sent = await sendReminderEmail(user.email, firstName, event, reminderType);
            if (sent) emailsSent++;
        } catch (error) {
            console.error(`Failed to send reminder to ${user.email}:`, error);
        }
    }

    // Send in-app notifications
    const isOneHour = reminderType === "oneHour";
    await sendNotifications({
        title: isOneHour ? "Event Starting Soon!" : "Event Tomorrow!",
        message: isOneHour 
            ? `"${event.title}" starts in 1 hour. Get ready!`
            : `Don't forget! "${event.title}" is happening tomorrow.`,
        type: "EVENT",
        recipients: userIds,
        link: `/events`,
        meta: { eventId: event._id }
    });

    return { emailsSent, notificationsSent: userIds.length };
};

/**
 * Process all events that need reminders
 * Call this function periodically (e.g., every 15 minutes via cron)
 */
export const processEventReminders = async () => {
    const now = new Date();
    
    // Time windows for reminders
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneDayWindow = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 24-25 hours
    
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourWindow = new Date(now.getTime() + 75 * 60 * 1000); // 60-75 minutes

    const results = {
        oneDayReminders: { processed: 0, emailsSent: 0 },
        oneHourReminders: { processed: 0, emailsSent: 0 }
    };

    // Find events happening in ~24 hours that haven't received 1-day reminder
    const oneDayEvents = await Event.find({
        status: "ACTIVE",
        eventDate: { $gte: oneDayFromNow, $lt: oneDayWindow },
        "remindersSent.oneDayBefore": false
    });

    for (const event of oneDayEvents) {
        console.log(`Sending 1-day reminders for: ${event.title}`);
        const { emailsSent } = await sendEventReminders(event, "oneDay");
        
        // Mark reminder as sent
        event.remindersSent.oneDayBefore = true;
        await event.save();
        
        results.oneDayReminders.processed++;
        results.oneDayReminders.emailsSent += emailsSent;
    }

    // Find events happening in ~1 hour that haven't received 1-hour reminder
    const oneHourEvents = await Event.find({
        status: "ACTIVE",
        eventDate: { $gte: oneHourFromNow, $lt: oneHourWindow },
        "remindersSent.oneHourBefore": false
    });

    for (const event of oneHourEvents) {
        console.log(`Sending 1-hour reminders for: ${event.title}`);
        const { emailsSent } = await sendEventReminders(event, "oneHour");
        
        // Mark reminder as sent
        event.remindersSent.oneHourBefore = true;
        await event.save();
        
        results.oneHourReminders.processed++;
        results.oneHourReminders.emailsSent += emailsSent;
    }

    return results;
};

/**
 * Manually trigger reminder for a specific event (admin use)
 */
export const sendManualReminder = async (eventId, reminderType = "oneHour") => {
    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");
    if (event.status !== "ACTIVE") throw new Error("Event is not active");

    return await sendEventReminders(event, reminderType);
};

export default {
    processEventReminders,
    sendManualReminder
};
