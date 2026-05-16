/**
 * @fileoverview Newsletter Routes
 * Handle newsletter subscription endpoints
 * @module routes/newsletter
 */

import express from 'express';
import {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers,
  getNewsletterStats
} from '../controllers/newsletter.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Public Routes (No authentication required)
 */

/** POST - Subscribe to newsletter */
router.post('/subscribe', subscribeNewsletter);

/** POST - Unsubscribe from newsletter */
router.post('/unsubscribe', unsubscribeNewsletter);

/**
 * Protected Routes (Admin only)
 */

/** GET - Get all active subscribers */
router.get('/subscribers', protect, authorize('ADMIN'), getNewsletterSubscribers);

/** GET - Get newsletter statistics */
router.get('/stats', protect, authorize('ADMIN'), getNewsletterStats);

export default router;
