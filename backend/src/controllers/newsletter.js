/**
 * @fileoverview Newsletter Controller
 * Handles newsletter subscription management
 * @module controllers/newsletter
 */

import { addDocument, getDocuments, updateDocument, deleteDocument } from "../config/firestore.js";

/**
 * Subscribe to newsletter
 * POST /api/newsletter/subscribe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // Email validation
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    // Check if email already exists
    const existingSubscriber = await getDocuments('newsletter', [
      { field: 'email', operator: '==', value: email.toLowerCase() }
    ]);

    if (existingSubscriber.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed to our newsletter"
      });
    }

    // Add to newsletter collection
    const subscriberId = await addDocument('newsletter', {
      email: email.toLowerCase(),
      subscribedAt: new Date(),
      status: 'ACTIVE',
      unsubscribedAt: null
    });

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter!",
      data: { subscriberId, email: email.toLowerCase() }
    });

  } catch (error) {
    console.error("Newsletter Subscribe Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to subscribe to newsletter. Please try again."
    });
  }
};

/**
 * Unsubscribe from newsletter
 * POST /api/newsletter/unsubscribe
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const subscribers = await getDocuments('newsletter', [
      { field: 'email', operator: '==', value: email.toLowerCase() }
    ]);

    if (subscribers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found in our newsletter"
      });
    }

    const subscriberId = subscribers[0].id;

    // Update status to unsubscribed
    await updateDocument('newsletter', subscriberId, {
      status: 'UNSUBSCRIBED',
      unsubscribedAt: new Date()
    });

    res.json({
      success: true,
      message: "Successfully unsubscribed from newsletter"
    });

  } catch (error) {
    console.error("Newsletter Unsubscribe Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to unsubscribe from newsletter"
    });
  }
};

/**
 * Get all active newsletter subscribers (Admin only)
 * GET /api/newsletter/subscribers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getNewsletterSubscribers = async (req, res) => {
  try {
    const subscribers = await getDocuments('newsletter', [
      { field: 'status', operator: '==', value: 'ACTIVE' }
    ]);

    res.json({
      success: true,
      data: {
        total: subscribers.length,
        subscribers: subscribers.map(sub => ({
          id: sub.id,
          email: sub.email,
          subscribedAt: sub.subscribedAt,
          status: sub.status
        }))
      }
    });

  } catch (error) {
    console.error("Get Subscribers Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch newsletter subscribers"
    });
  }
};

/**
 * Get newsletter statistics (Admin only)
 * GET /api/newsletter/stats
 */
export const getNewsletterStats = async (req, res) => {
  try {
    const allSubscribers = await getDocuments('newsletter', []);
    const activeSubscribers = allSubscribers.filter(sub => sub.status === 'ACTIVE');
    const unsubscribedCount = allSubscribers.filter(sub => sub.status === 'UNSUBSCRIBED').length;

    res.json({
      success: true,
      data: {
        total: allSubscribers.length,
        active: activeSubscribers.length,
        unsubscribed: unsubscribedCount,
        growthRate: ((activeSubscribers.length / allSubscribers.length) * 100).toFixed(2) + '%'
      }
    });

  } catch (error) {
    console.error("Newsletter Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch newsletter statistics"
    });
  }
};
