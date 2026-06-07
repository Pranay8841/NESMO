/**
 * @fileoverview Alumni Directory Controller - Firestore Version
 * Handles fetching and filtering the alumni directory with pagination.
 * 
 * @module controllers/alumniDirectory
 */

import { getDocuments, getDocument } from "../config/firestore.js";

/**
 * Get paginated alumni directory with filtering and search (Firestore version).
 * Fetches users with profile data and applies filters in-memory.
 * 
 * @async
 * @function getAlumniDirectory
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {number} [req.query.page=1] - Page number (min: 1)
 * @param {number} [req.query.limit=20] - Items per page (max: 50)
 * @param {string} [req.query.city] - Filter by city (case-insensitive)
 * @param {string} [req.query.occupation] - Filter by occupation (case-insensitive)
 * @param {string} [req.query.joinBatch] - Filter by JNV joining batch
 * @param {string} [req.query.passoutBatch] - Filter by JNV passout batch
 * @param {string} [req.query.bloodGroup] - Filter by blood group
 * @param {string} [req.query.isMember] - Filter by NESMO membership ("true"/"false")
 * @param {string} [req.query.search] - Search across name, email, city, occupation
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with alumni list, pagination info
 * 
 * @requires protect middleware
 */
export const getAlumniDirectory = async (req, res) => {
  try {
    /* ------------------ Pagination & Limits ------------------ */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    /* ------------------ Fetch Active Users (Basic Filter) ------------------ */
    let userFilters = [
      { field: 'status', operator: '==', value: 'ACTIVE' }
    ];

    const allUsers = await getDocuments('users', userFilters);

    // Filter out current user (if authenticated)
    let users = req.user?.id ? allUsers.filter(u => u.uid !== req.user.id) : allUsers;

    /* ------------------ Enrich with Profile Data & Apply Profile Filters ------------------ */
    let enrichedUsers = [];

    for (const user of users) {
      try {
        const profile = user.profile ? await getDocument('profiles', user.profile) : {};

        // Apply profile-based filters
        let matchesFilters = true;

        if (req.query.city) {
          const trimmedCity = req.query.city.trim();
          if (trimmedCity) {
            if (!profile.currentAddress || !profile.currentAddress.toLowerCase().includes(trimmedCity.toLowerCase())) {
              matchesFilters = false;
            }
          }
        }

        if (req.query.organization) {
          const trimmedQuery = req.query.organization.trim();
          if (trimmedQuery) {
            const orgRegex = new RegExp(`\\b${trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            const matchesCurrentOrg = profile.organization && orgRegex.test(profile.organization);
            const matchesEducationOrg = Array.isArray(profile.educationHistory) &&
              profile.educationHistory.some(edu => edu.institution && orgRegex.test(edu.institution));
            if (!matchesCurrentOrg && !matchesEducationOrg) {
              matchesFilters = false;
            }
          }
        }

        if (req.query.joinBatch) {
          const trimmedJoin = req.query.joinBatch.trim();
          if (trimmedJoin && profile.joinBatch !== trimmedJoin) {
            matchesFilters = false;
          }
        }

        if (req.query.passoutBatch) {
          const trimmedPassout = req.query.passoutBatch.trim();
          if (trimmedPassout && profile.passoutBatch !== trimmedPassout) {
            matchesFilters = false;
          }
        }

        if (req.query.bloodGroup) {
          const trimmedBlood = req.query.bloodGroup.trim();
          if (trimmedBlood) {
            const normalizedBlood = trimmedBlood.replace(/\s/g, '+').toUpperCase();
            if (!profile.bloodGroup || profile.bloodGroup.toUpperCase() !== normalizedBlood) {
              matchesFilters = false;
            }
          }
        }

        // Apply search filter (searches across name, email, city, occupation, organization)
        if (req.query.search) {
          const searchTrimmed = req.query.search.trim();
          if (searchTrimmed) {
            const searchLower = searchTrimmed.toLowerCase();
            const nameMatch = (`${user.firstName} ${user.lastName}`).toLowerCase().includes(searchLower);
            const emailMatch = user.email.toLowerCase().includes(searchLower);
            const cityMatch = profile.currentAddress?.toLowerCase().includes(searchLower);
            const occMatch = profile.occupation?.toLowerCase().includes(searchLower);
            const orgRegex = new RegExp(`\\b${searchTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            const matchesCurrentOrg = profile.organization ? orgRegex.test(profile.organization) : false;
            const matchesEducationOrg = Array.isArray(profile.educationHistory)
              ? profile.educationHistory.some(edu => edu.institution && orgRegex.test(edu.institution))
              : false;
            const orgMatch = matchesCurrentOrg || matchesEducationOrg;

            if (!nameMatch && !emailMatch && !cityMatch && !occMatch && !orgMatch) {
              matchesFilters = false;
            }
          }
        }

        if (matchesFilters) {
          enrichedUsers.push({ user, profile });
        }
      } catch (err) {
        console.warn(`Failed to load profile for user ${user.uid}:`, err);
      }
    }

    /* ------------------ Pagination & Response Mapping ------------------ */
    const totalCount = enrichedUsers.length;
    const paginatedUsers = enrichedUsers.slice(skip, skip + limit);

    const directory = paginatedUsers.map(({ user, profile }) => ({
      id: user.uid,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: profile?.phone || null,
      city: profile?.currentAddress || null,
      occupation: profile?.occupation || null,
      organization: profile?.organization || null,
      sector: profile?.sector || null,
      joinBatch: profile?.joinBatch || null,
      passoutBatch: profile?.passoutBatch || null,
      bloodGroup: profile?.bloodGroup || null,
      about: profile?.about || null,
      photo: profile?.profilePhoto || null,
      educationHistory: Array.isArray(profile?.educationHistory) ? profile.educationHistory : [],
      role: user.role,
      isMember: user.isMember || false
    }));

    /* ------------------ Response ------------------ */
    res.status(200).json({
      success: true,
      page,
      limit,
      count: directory.length,
      totalCount,
      data: directory
    });

  } catch (error) {
    console.error('Alumni Directory Error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to load alumni directory'
    });
  }
};
