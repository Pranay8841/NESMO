import { addDocument, getDocument, getDocuments } from "../config/firestore.js";
import { getGeminiModel } from "../config/gemini.js";

const cooldowns = new Map();
const COOLDOWN_MS = 30000; // 30 seconds

const STOPWORDS = new Set([
  "the", "and", "for", "you", "that", "this", "with", "have", "from", "are", "was", "were", 
  "but", "not", "how", "what", "who", "whom", "where", "when", "why", "can", "will", "would", 
  "should", "could", "about", "there", "their", "here", "someone", "anyone", "anybody", 
  "somebody", "please", "help", "know", "want", "find", "need", "like", "love", "look", 
  "good", "best", "some", "many", "more", "very", "much"
]);

/**
 * Check if the text contains a trigger for the AI agent (e.g. "@AI")
 * @param {string} text - Message text
 * @returns {boolean}
 */
export function hasAITrigger(text) {
  if (!text) return false;
  return /\b@ai\b/i.test(text) || text.toLowerCase().includes("@ai");
}

/**
 * Build context for Gemini from matching alumni profiles
 * @param {string} text - User's question
 * @returns {Promise<string>} Formatted list of relevant profiles
 */
async function buildKnowledgeContext(text) {
  try {
    // Extract query words
    const queryWords = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOPWORDS.has(word) && word !== "ai");

    if (queryWords.length === 0) {
      return "No specific search keywords extracted from user query.";
    }

    // Fetch all active users
    const users = await getDocuments("users", [
      { field: "status", operator: "==", value: "ACTIVE" }
    ]);

    const matches = [];

    for (const user of users) {
      if (!user.profile) continue;
      try {
        const profile = await getDocument("profiles", user.profile);
        if (!profile) continue;

        const fieldsToSearch = [
          user.firstName,
          user.lastName,
          profile.occupation,
          profile.organization,
          profile.sector,
          profile.currentAddress,
          profile.about,
          profile.joinBatch,
          profile.passoutBatch
        ];

        const searchStr = fieldsToSearch.filter(Boolean).join(" ").toLowerCase();
        
        let score = 0;
        for (const word of queryWords) {
          if (searchStr.includes(word)) {
            score += 1;
          }
        }

        if (score > 0) {
          matches.push({
            score,
            user,
            profile
          });
        }
      } catch (profileErr) {
        // Skip individual failed profiles
      }
    }

    // Sort descending by match score
    matches.sort((a, b) => b.score - a.score);

    const topMatches = matches.slice(0, 10);

    if (topMatches.length > 0) {
      return topMatches.map((m, idx) => {
        const u = m.user;
        const p = m.profile;
        return `${idx + 1}. Name: ${u.firstName} ${u.lastName} | Occupation: ${p.occupation || "N/A"} | Organization: ${p.organization || "N/A"} | Location: ${p.currentAddress || "N/A"} | Batch: Join ${p.joinBatch || "N/A"}, Passout ${p.passoutBatch || "N/A"} | Sector: ${p.sector || "N/A"} | Bio: ${p.about || "N/A"}`;
      }).join("\n");
    }

    return "No direct matching alumni profiles found in the community database.";
  } catch (err) {
    console.error("Error building knowledge context:", err);
    return "Error querying alumni knowledge base.";
  }
}

/**
 * Handle AI Agent query: fetch context, ask Gemini, and write the response
 * @param {Object} params
 * @param {string} params.messageId - Original message document ID
 * @param {string} params.userId - Author user ID
 * @param {string} params.text - User message text
 * @param {string} params.authorName - Author full name
 * @param {string} params.autoCategory - Category detected
 */
export async function handleAIQuery({ messageId, userId, text, authorName, autoCategory }) {
  try {
    // Cooldown check to prevent abuse
    const now = Date.now();
    const lastRequest = cooldowns.get(userId);
    if (lastRequest && (now - lastRequest < COOLDOWN_MS)) {
      console.log(`User ${userId} requested AI too quickly. Sending cooldown warning.`);
      const cooldownMsg = {
        text: "Please wait 30 seconds before asking NESMO AI again.",
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
        autoCategory: autoCategory || "GENERAL",
        isDeleted: false,
        isSystemMessage: true,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await addDocument("community_messages", cooldownMsg);
      return;
    }

    cooldowns.set(userId, now);

    const model = getGeminiModel();
    if (!model) {
      console.warn("Google Gemini model is not initialized/configured.");
      return;
    }

    // Build the context from matched profiles
    const contextText = await buildKnowledgeContext(text);

    // Build prompt for Gemini
    const prompt = `
ALUMNI DATABASE CONTEXT:
${contextText}

USER MESSAGE (from ${authorName}):
"${text}"

Please provide a helpful response. If alumni profiles match the query, mention them by name so the user can connect with them in the community. Follow all system instructions.
`;

    const result = await model.generateContent(prompt);
    const replyText = result.response.text();

    if (!replyText || replyText.trim().length === 0) {
      throw new Error("Empty reply text generated by Gemini model");
    }

    // Add response message to Firestore
    const systemMsg = {
      text: replyText.trim(),
      authorId: "AI_AGENT",
      authorName: "NESMO AI",
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
      autoCategory: autoCategory || "GENERAL",
      isDeleted: false,
      isSystemMessage: true,
      isAIResponse: true, // Tag as AI response for UI distinction
      editedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const aiResponseId = await addDocument("community_messages", systemMsg);

    // Log the AI response for analytics/auditing
    try {
      await addDocument("ai_responses", {
        questionId: messageId,
        responseId: aiResponseId,
        userId,
        question: text,
        response: replyText,
        createdAt: new Date()
      });
    } catch (logErr) {
      console.error("Failed to log AI response to analytics collection:", logErr);
    }

  } catch (error) {
    console.error("Error handling handleAIQuery:", error);
    // Write a generic fallback error message to the thread so users know it failed
    try {
      const errorMsg = {
        text: "Sorry, I encountered an error while processing your request. Please try again later.",
        authorId: "AI_AGENT",
        authorName: "NESMO AI",
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
        autoCategory: autoCategory || "GENERAL",
        isDeleted: false,
        isSystemMessage: true,
        isAIResponse: true,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await addDocument("community_messages", errorMsg);
    } catch (fallbackErr) {
      console.error("Failed to post fallback AI agent error message:", fallbackErr);
    }
  }
}
