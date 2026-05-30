/**
 * @fileoverview Community Knowledge & Guidance System Controller
 * Handles real-time group chat, knowledge base curation, and smart alumni matching.
 *
 * @module controllers/community
 *
 * @description
 * All message writes go through this controller (not direct Firestore client writes) so that:
 *  - Author profile data is denormalized server-side (trusted source)
 *  - @mentions are parsed and stored
 *  - Auto-category is silently detected via keyword matching
 *  - Smart alumni matching runs against the alumni profile DB
 *  - Blocked users are rejected by the protect middleware before reaching here
 */

import {
  addDocument,
  getDocument,
  getDocuments,
  updateDocument,
} from "../config/firestore.js";
import { sendNotifications } from "../service/notification.js";
import { hasAITrigger, handleAIQuery } from "../service/aiAgent.js";

/* ─────────────────────────────────────────────
   KEYWORD MAPS FOR AUTO-CATEGORY DETECTION
───────────────────────────────────────────── */

const CATEGORY_KEYWORDS = {
  HEALTH: [
    "doctor", "hospital", "medicine", "disease", "illness", "surgery",
    "medical", "health", "kidney", "cancer", "blood", "treatment", "clinic",
    "specialist", "pain", "fever", "injury", "patient", "pharmacy",
  ],
  EDUCATION: [
    "college", "university", "admission", "jee", "neet", "degree", "course",
    "study", "exam", "result", "marks", "rank", "scholarship", "12th", "10th",
    "board", "engineering", "mbbs", "btech", "mtech", "phd",
  ],
  CAREER: [
    "job", "internship", "placement", "resume", "interview", "salary", "offer",
    "company", "startup", "hiring", "work", "employee", "career", "profession",
    "promotion", "upsc", "ias", "ips", "ssc", "bank", "government job",
  ],
  GOVT_EXAMS: [
    "upsc", "ias", "ips", "ssc", "bank po", "railway", "defence", "nda",
    "cds", "state psc", "ibps", "clerk", "government exam", "civil services",
  ],
  MENTAL_SUPPORT: [
    "stress", "anxiety", "depression", "mental health", "counseling",
    "therapy", "pressure", "burnout", "support", "struggling", "help me",
    "lonely", "sad", "worried", "mental",
  ],
  MIGRATION: [
    "migration", "abroad", "foreign", "visa", "ms", "masters", "us", "uk",
    "canada", "australia", "germany", "gre", "ielts", "toefl", "immigration",
    "passport", "settle",
  ],
  NETWORKING: [
    "connect", "network", "linkedin", "mentor", "mentorship", "guidance",
    "meet", "alumni network", "contact", "collaboration",
  ],
  DOCUMENTS: [
    "document", "certificate", "caste", "income", "domicile", "affidavit",
    "marksheet", "transfer", "noc", "notary", "attestation", "verification",
  ],
  OPPORTUNITIES: [
    "opportunity", "funding", "grant", "fellowship", "hackathon", "competition",
    "prize", "award", "opening", "vacancy", "referral",
  ],
};

/**
 * Detect the most relevant category from message text using keyword matching.
 * Returns null if no category matches (will fall back to GENERAL on frontend).
 *
 * @param {string} text - Message text
 * @returns {string|null} Detected category
 */
function detectCategory(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = keywords.filter((kw) => lower.includes(kw)).length;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : "GENERAL";
}

/* ─────────────────────────────────────────────
   SMART ALUMNI MATCHING
   Extracts location + sector/topic hints from
   message text, then queries alumni profiles.
───────────────────────────────────────────── */

const LOCATION_KEYWORDS = [
  "nagpur", "mumbai", "pune", "delhi", "bangalore", "hyderabad", "chennai",
  "kolkata", "ahmedabad", "jaipur", "lucknow", "bhopal", "indore", "gadchiroli",
  "chandrapur", "amravati", "wardha", "yavatmal", "akola", "nanded",
];

const SECTOR_HINTS = {
  HEALTH: ["doctor", "physician", "surgeon", "nurse", "healthcare", "medical", "kidney", "hospital"],
  EDUCATION: ["professor", "teacher", "lecturer", "faculty", "coaching", "tutor", "school"],
  LEGAL: ["lawyer", "advocate", "attorney", "legal", "court", "judge"],
  FINANCE: ["bank", "ca", "accountant", "finance", "chartered", "investment"],
  TECHNOLOGY: ["software", "engineer", "developer", "it", "tech", "programmer"],
  GOVERNMENT: ["ias", "ips", "ifs", "collector", "officer", "bureaucrat", "upsc"],
};

/**
 * Extract location and sector hints from a message for smart alumni matching.
 *
 * @param {string} text
 * @returns {{ locations: string[], sectors: string[] }}
 */
function extractSmartMatchHints(text) {
  const lower = text.toLowerCase();
  const locations = LOCATION_KEYWORDS.filter((loc) => lower.includes(loc));
  const sectors = [];
  for (const [sector, keywords] of Object.entries(SECTOR_HINTS)) {
    if (keywords.some((kw) => lower.includes(kw))) sectors.push(sector);
  }
  return { locations, sectors };
}

/**
 * Find alumni whose profile matches the extracted hints.
 * Returns up to 5 matched alumni.
 *
 * @param {string[]} locations
 * @param {string[]} sectors
 * @returns {Promise<Array>}
 */
async function findMatchingAlumni(locations, sectors) {
  if (!locations.length && !sectors.length) return [];

  try {
    // Fetch all active users (Firestore doesn't support OR across fields easily,
    // so we fetch active users and filter in-memory)
    const users = await getDocuments("users", [
      { field: "status", operator: "==", value: "ACTIVE" },
    ]);

    const matches = [];

    for (const user of users) {
      if (!user.profile) continue;
      try {
        const profile = await getDocument("profiles", user.profile);
        if (!profile) {
          continue;
        }

        const cityMatch =
          locations.length === 0 ||
          locations.some((loc) =>
            (profile.currentAddress || "").toLowerCase().includes(loc)
          );

        const sectorMap = {
          HEALTH: ["doctor", "physician", "surgeon", "healthcare", "medical", "nurse"],
          EDUCATION: ["teacher", "professor", "lecturer", "faculty"],
          LEGAL: ["lawyer", "advocate", "attorney"],
          FINANCE: ["ca", "accountant", "finance", "bank", "chartered"],
          TECHNOLOGY: ["software", "engineer", "developer", "it", "tech"],
          GOVERNMENT: ["ias", "ips", "ifs", "collector", "officer"],
        };

        const occupationLower = (profile.occupation || "").toLowerCase();
        const sectorLower = (profile.sector || "").toLowerCase();
        const sectorMatch =
          sectors.length === 0 ||
          sectors.some((sector) => {
            const hints = sectorMap[sector] || [];
            return (
              hints.some((h) => occupationLower.includes(h)) ||
              sectorLower.includes(sector.toLowerCase())
            );
          });

        if (cityMatch && sectorMatch) {
          matches.push({
            id: user.uid || user.id,
            name: `${user.firstName} ${user.lastName}`,
            occupation: profile.occupation || "",
            organization: profile.organization || "",
            location: profile.currentAddress || "",
            sector: profile.sector || "",
            profilePhoto: profile.profilePhoto || "",
            batch: profile.passoutBatch || "",
          });
        }

        if (matches.length >= 5) break;
      } catch (err) {
        console.error(`[findMatchingAlumni Debug] Error parsing profile for user: ${user.firstName} ${user.lastName}`, err);
      }
    }

    return matches;
  } catch (error) {
    console.error("Smart match query failed:", error);
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   ENDPOINTS
═══════════════════════════════════════════════════════════════ */

/**
 * GET /api/community/messages
 * Fetch the latest 50 messages (initial load for the chat screen).
 * Firestore onSnapshot handles real-time after this.
 */
export const getMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const messages = await getDocuments("community_messages", [
      { field: "isDeleted", operator: "==", value: false },
    ], {
      orderBy: { field: "createdAt", direction: "desc" },
      limit,
    });

    // Reverse so newest is last (FlatList inverted renders from bottom)
    const ordered = [...messages].reverse();

    res.status(200).json({ success: true, data: ordered });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

/**
 * POST /api/community/messages
 * Post a new message. Validates, denormalizes author, detects category,
 * runs smart-match, writes to Firestore.
 *
 * Body: { text: string, replyTo?: string }
 */
export const postMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { text, replyTo, mentions } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    if (text.length > 2000) {
      return res.status(400).json({ success: false, message: "Message too long (max 2000 chars)" });
    }

    /* ── 1. Fetch author profile ── */
    const userDoc = await getDocument("users", userId);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profileDoc = userDoc.profile
      ? await getDocument("profiles", userDoc.profile)
      : null;

    /* ── 2. Parse @mentions & everyone tag ── */
    let finalMentions = Array.isArray(mentions) ? mentions : [];
    const lowerText = text.toLowerCase();
    const isEveryoneMentioned = lowerText.includes("@everyone");

    if (isEveryoneMentioned && !finalMentions.includes("everyone")) {
      finalMentions.push("everyone");
    }

    /* ── 3. Auto-detect category (silent) ── */
    const autoCategory = detectCategory(text);

    /* ── 4. Resolve replyTo preview ── */
    let replyToPreview = null;
    if (replyTo) {
      const parentMsg = await getDocument("community_messages", replyTo);
      if (parentMsg && !parentMsg.isDeleted) {
        replyToPreview = parentMsg.text.slice(0, 80);
      }
    }

    /* ── 5. Build message document ── */
    const now = new Date();
    const messageData = {
      text: text.trim(),
      authorId: userId,
      authorName: `${userDoc.firstName} ${userDoc.lastName}`,
      authorPhoto: profileDoc?.profilePhoto || "",
      authorBatch: profileDoc?.passoutBatch || "",
      authorOccupation: profileDoc?.occupation || "",
      authorLocation: profileDoc?.currentAddress || "",
      mentions: finalMentions,
      attachments: [],
      reactions: [],
      replyTo: replyTo || null,
      replyToPreview,
      isPinned: false,
      isKnowledgeEntry: false,
      knowledgeTags: [],
      autoCategory,
      isDeleted: false,
      isSystemMessage: false,
      editedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const messageId = await addDocument("community_messages", messageData);

    /* ── 5.1 AI Agent: handle @AI mentions ── */
    (async () => {
      try {
        if (hasAITrigger(text)) {
          await handleAIQuery({
            messageId,
            userId,
            text,
            authorName: `${userDoc.firstName} ${userDoc.lastName}`,
            autoCategory,
          });
        }
      } catch (aiErr) {
        console.error("AI Agent error (non-blocking):", aiErr);
      }
    })();

    /* ── 5.5 Send Notifications to Mentioned Users ── */
    (async () => {
      try {
        let recipientIds = [];
        if (isEveryoneMentioned) {
          // Fetch all active users
          const activeUsers = await getDocuments("users", [
            { field: "status", operator: "==", value: "ACTIVE" }
          ]);
          recipientIds = activeUsers.map(u => u.uid || u.id); // Include everyone, even sender for testing
        } else if (finalMentions.length > 0) {
          recipientIds = finalMentions; // Include sender if they tagged themselves for testing
        }

        if (recipientIds.length > 0) {
          const senderName = `${userDoc.firstName} ${userDoc.lastName}`;
          await sendNotifications({
            title: isEveryoneMentioned ? "NESMO Community Broadcast" : "Tagged in Community",
            message: `${senderName}: ${text.trim().slice(0, 80)}`,
            type: "SYSTEM",
            recipients: recipientIds,
            link: "/community",
            meta: { messageId }
          });
        }
      } catch (notifErr) {
        console.error("Failed to send community mentions notifications:", notifErr);
      }
    })();

    /* ── 6. Smart alumni matching ── */
    const { locations, sectors } = extractSmartMatchHints(text);

    if (locations.length > 0 || sectors.length > 0) {
      const matchedAlumni = await findMatchingAlumni(locations, sectors);

      if (matchedAlumni.length > 0) {
        const sectorLabel = sectors.length > 0
          ? sectors[0].charAt(0) + sectors[0].slice(1).toLowerCase()
          : "professionals";
        const locationLabel = locations.length > 0
          ? locations.map((l) => l.charAt(0).toUpperCase() + l.slice(1)).join("/")
          : "your area";

        const systemMsg = {
          text: `${matchedAlumni.length} ${sectorLabel} member${matchedAlumni.length > 1 ? "s" : ""} from ${locationLabel} in your network may be able to help!`,
          authorId: "SYSTEM",
          authorName: "NESMO Community",
          authorPhoto: "",
          authorBatch: "",
          authorOccupation: "",
          authorLocation: "",
          mentions: [],
          attachments: [],
          reactions: [],
          replyTo: messageId,
          replyToPreview: text.slice(0, 80),
          isPinned: false,
          isKnowledgeEntry: false,
          knowledgeTags: [],
          autoCategory,
          isDeleted: false,
          isSystemMessage: true,
          matchedAlumni,       // Store matched alumni data in the system message
          editedAt: null,
          createdAt: new Date(now.getTime() + 500), // Slightly after the original
          updatedAt: new Date(now.getTime() + 500),
        };

        await addDocument("community_messages", systemMsg);
      }
    }

    res.status(201).json({
      success: true,
      message: "Message posted",
      data: { id: messageId, ...messageData },
    });
  } catch (error) {
    console.error("postMessage error:", error);
    res.status(500).json({ success: false, message: "Failed to post message" });
  }
};

/**
 * PATCH /api/community/messages/:id
 * Edit own message (within 15 minutes of posting).
 *
 * Body: { text: string }
 */
export const editMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const message = await getDocument("community_messages", id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    if (message.isDeleted) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    if (message.authorId !== userId) {
      return res.status(403).json({ success: false, message: "Not your message" });
    }
    if (message.isSystemMessage) {
      return res.status(403).json({ success: false, message: "Cannot edit system messages" });
    }

    // 15-minute edit window
    const createdAt = message.createdAt?.toDate
      ? message.createdAt.toDate()
      : new Date(message.createdAt);
    const ageMs = Date.now() - createdAt.getTime();
    if (ageMs > 15 * 60 * 1000) {
      return res.status(403).json({ success: false, message: "Edit window expired (15 minutes)" });
    }

    const newCategory = detectCategory(text);

    await updateDocument("community_messages", id, {
      text: text.trim(),
      autoCategory: newCategory,
      editedAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(200).json({ success: true, message: "Message updated" });
  } catch (error) {
    console.error("editMessage error:", error);
    res.status(500).json({ success: false, message: "Failed to edit message" });
  }
};

/**
 * DELETE /api/community/messages/:id
 * Soft-delete: own message or admin.
 */
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id } = req.params;

    const message = await getDocument("community_messages", id);

    if (!message || message.isDeleted) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.authorId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this message" });
    }

    await updateDocument("community_messages", id, {
      isDeleted: true,
      updatedAt: new Date(),
    });

    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("deleteMessage error:", error);
    res.status(500).json({ success: false, message: "Failed to delete message" });
  }
};

/**
 * POST /api/community/messages/:id/react
 * Toggle an emoji reaction on a message.
 *
 * Body: { emoji: string }
 */
export const reactToMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ success: false, message: "Emoji is required" });
    }

    const message = await getDocument("community_messages", id);
    if (!message || message.isDeleted) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const reactions = message.reactions || [];
    const existing = reactions.find((r) => r.emoji === emoji);

    if (existing) {
      // Toggle: add or remove the user from this emoji's list
      if (existing.userIds.includes(userId)) {
        existing.userIds = existing.userIds.filter((uid) => uid !== userId);
      } else {
        existing.userIds.push(userId);
      }
    } else {
      reactions.push({ emoji, userIds: [userId] });
    }

    // Clean up reactions with 0 users
    const cleaned = reactions.filter((r) => r.userIds.length > 0);

    await updateDocument("community_messages", id, {
      reactions: cleaned,
      updatedAt: new Date(),
    });

    res.status(200).json({ success: true, data: cleaned });
  } catch (error) {
    console.error("reactToMessage error:", error);
    res.status(500).json({ success: false, message: "Failed to react to message" });
  }
};

/**
 * POST /api/community/messages/:id/report
 * Report a message for inappropriate content.
 *
 * Body: { reason: string }
 */
export const reportMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Reason is required" });
    }

    const message = await getDocument("community_messages", id);
    if (!message || message.isDeleted) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    await addDocument("community_reports", {
      messageId: id,
      reportedBy: userId,
      reason,
      createdAt: new Date(),
      status: "OPEN",
    });

    res.status(201).json({ success: true, message: "Report submitted. Thank you." });
  } catch (error) {
    console.error("reportMessage error:", error);
    res.status(500).json({ success: false, message: "Failed to report message" });
  }
};



/**
 * GET /api/community/smart-match?q=
 * Returns alumni profiles that match a topic+location query.
 * Used by the smart suggestion strip in MessageInput.
 */
export const smartMatchAlumni = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Query required" });
    }

    const { locations, sectors } = extractSmartMatchHints(q);
    const matchedAlumni = await findMatchingAlumni(locations, sectors);

    res.status(200).json({
      success: true,
      count: matchedAlumni.length,
      data: matchedAlumni,
    });
  } catch (error) {
    console.error("smartMatchAlumni error:", error);
    res.status(500).json({ success: false, message: "Smart match failed" });
  }
};

/* ─────────────────────────────────────────────
   KNOWLEDGE BASE (ADMIN-CURATED)
───────────────────────────────────────────── */

/**
 * GET /api/community/knowledge
 * List curated knowledge entries, optionally filtered by search query.
 */
export const getKnowledgeEntries = async (req, res) => {
  try {
    const { q, category } = req.query;
    const filters = [];
    if (category) filters.push({ field: "category", operator: "==", value: category });

    let entries = await getDocuments("knowledge_entries", filters, {
      orderBy: { field: "createdAt", direction: "desc" },
      limit: 50,
    });

    if (q) {
      const lower = q.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.title?.toLowerCase().includes(lower) ||
          e.summary?.toLowerCase().includes(lower) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(lower))
      );
    }

    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    console.error("getKnowledgeEntries error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch knowledge entries" });
  }
};

/**
 * POST /api/community/knowledge
 * ADMIN ONLY: Pin a message thread as a knowledge entry.
 *
 * Body: { questionMessageId, answerMessageIds[], title, summary, tags[], category }
 */
export const createKnowledgeEntry = async (req, res) => {
  try {
    const {
      questionMessageId,
      answerMessageIds = [],
      title,
      summary,
      tags = [],
      category,
    } = req.body;

    if (!questionMessageId || !title) {
      return res.status(400).json({
        success: false,
        message: "questionMessageId and title are required",
      });
    }

    const questionMsg = await getDocument("community_messages", questionMessageId);
    if (!questionMsg) {
      return res.status(404).json({ success: false, message: "Question message not found" });
    }

    // Collect contributor IDs from answer messages
    const contributorIds = new Set();
    for (const msgId of answerMessageIds) {
      const msg = await getDocument("community_messages", msgId);
      if (msg && msg.authorId !== "SYSTEM") {
        contributorIds.add(msg.authorId);
        // Mark the message as a knowledge entry in Firestore
        await updateDocument("community_messages", msgId, { isKnowledgeEntry: true });
      }
    }

    // Mark the question too
    await updateDocument("community_messages", questionMessageId, {
      isKnowledgeEntry: true,
      isPinned: true,
    });

    const entryData = {
      questionMessageId,
      answerMessageIds,
      title,
      summary: summary || "",
      category: category || questionMsg.autoCategory || "GENERAL",
      tags,
      contributorIds: [...contributorIds],
      viewCount: 0,
      helpfulVotes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const entryId = await addDocument("knowledge_entries", entryData);

    res.status(201).json({
      success: true,
      message: "Knowledge entry created",
      data: { id: entryId, ...entryData },
    });
  } catch (error) {
    console.error("createKnowledgeEntry error:", error);
    res.status(500).json({ success: false, message: "Failed to create knowledge entry" });
  }
};

/**
 * GET /api/community/users
 * Returns list of active registered users for tagging/mentions autocomplete.
 */
export const getMentionableUsers = async (req, res) => {
  try {
    const users = await getDocuments("users", [
      { field: "status", operator: "==", value: "ACTIVE" }
    ]);
    
    // Fetch all profiles in parallel to get their profile photos
    const profileIds = users.filter(u => u.profile).map(u => u.profile);
    const profilePromises = profileIds.map(id => getDocument("profiles", id));
    const profiles = await Promise.all(profilePromises);
    const profileMap = {};
    profiles.forEach(p => {
      if (p) profileMap[p.id] = p;
    });
    
    const data = users.map(user => {
      const profile = profileMap[user.profile] || {};
      return {
        id: user.uid || user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        photo: profile.profilePhoto || "",
        batch: profile.passoutBatch || "",
      };
    });
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getMentionableUsers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users for tagging" });
  }
};

/**
 * POST /api/community/mentorship/request
 * Send a push notification to mentor and return their WhatsApp contact details.
 * Body: { mentorId }
 */
export const requestMentorship = async (req, res) => {
  try {
    const juniorId = req.user.id;
    const { mentorId } = req.body;

    if (!mentorId) {
      return res.status(400).json({ success: false, message: "Mentor ID is required" });
    }

    if (juniorId === mentorId) {
      return res.status(400).json({ success: false, message: "You cannot request mentorship from yourself" });
    }

    // 1. Fetch Junior User and Profile
    const juniorDoc = await getDocument("users", juniorId);
    if (!juniorDoc) {
      return res.status(404).json({ success: false, message: "Junior user not found" });
    }
    const juniorProfileDoc = juniorDoc.profile
      ? await getDocument("profiles", juniorDoc.profile)
      : null;

    // 2. Fetch Mentor User and Profile
    const mentorDoc = await getDocument("users", mentorId);
    if (!mentorDoc) {
      return res.status(404).json({ success: false, message: "Mentor user not found" });
    }
    const mentorProfileDoc = mentorDoc.profile
      ? await getDocument("profiles", mentorDoc.profile)
      : null;

    if (!mentorProfileDoc || !mentorProfileDoc.phone) {
      return res.status(400).json({
        success: false,
        message: "This alumnus does not have a phone number registered for WhatsApp contact.",
      });
    }

    const juniorName = `${juniorDoc.firstName} ${juniorDoc.lastName}`.trim();
    const juniorBatch = juniorProfileDoc?.passoutBatch || "N/A";
    const mentorName = `${mentorDoc.firstName} ${mentorDoc.lastName}`.trim();
    const mentorSector = mentorProfileDoc.sector || mentorProfileDoc.occupation || "your sector";

    const batchSuffix = juniorBatch !== "N/A" ? `'${juniorBatch.slice(-2)}` : "N/A";

    // 3. Send Push Notification to Mentor
    const notificationMessage = `Hi ${mentorName}, ${juniorName} (Batch ${batchSuffix}) is looking for guidance in ${mentorSector}. Would you like to connect?`;
    await sendNotifications({
      title: "Mentorship Request",
      message: notificationMessage,
      type: "SYSTEM",
      recipients: [mentorId],
      link: "/community",
      meta: { juniorId }
    });

    // 4. Generate WhatsApp Prefilled Message Text
    const whatsappMessage = `Hi ${mentorName}, I am ${juniorName} from JNV Gadchiroli (Batch ${batchSuffix}). I saw your profile in the NESMO community list for ${mentorSector} and would love to connect for guidance!`;

    res.status(200).json({
      success: true,
      phone: mentorProfileDoc.phone,
      message: whatsappMessage,
    });
  } catch (error) {
    console.error("requestMentorship error:", error);
    res.status(500).json({ success: false, message: "Failed to process mentorship request" });
  }
};


