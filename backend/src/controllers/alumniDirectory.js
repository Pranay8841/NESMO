/**
 * @fileoverview Alumni Directory Controller
 * Handles fetching and filtering the alumni directory with pagination.
 * 
 * @module controllers/alumniDirectory
 */

import User from "../models/user.js";
import mongoose from "mongoose";

/**
 * Get paginated alumni directory with filtering and search.
 * Uses MongoDB aggregation pipeline for efficient querying.
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
 * 
 * @example
 * // GET /api/profile/alumni?page=1&limit=10&city=Delhi&passoutBatch=2015
 * // Response
 * {
 *   "success": true,
 *   "page": 1,
 *   "limit": 10,
 *   "count": 5,
 *   "totalCount": 25,
 *   "data": [{ "id": "...", "name": "John Doe", ... }]
 * }
 */
export const getAlumniDirectory = async (req, res) => {
  try {
    /* ------------------ Pagination ------------------ */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    /* ------------------ Build Aggregation Pipeline ------------------ */
    const pipeline = [];

    // Stage 1: Match active users (excluding the current logged-in user)
    const userMatch = { 
      status: "ACTIVE",
      _id: { $ne: new mongoose.Types.ObjectId(req.user.id) } // Exclude current user
    };
    if (req.query.isMember !== undefined) {
      userMatch.isMember = req.query.isMember === "true";
    }
    pipeline.push({ $match: userMatch });

    // Stage 2: Lookup profile
    pipeline.push({
      $lookup: {
        from: "profiles",
        localField: "profile",
        foreignField: "_id",
        as: "profileData"
      }
    });

    // Stage 3: Unwind profile (convert array to object)
    pipeline.push({
      $unwind: {
        path: "$profileData",
        preserveNullAndEmptyArrays: false
      }
    });

    // Stage 4: Apply profile filters
    const profileMatch = {};

    if (req.query.city) {
      profileMatch["profileData.currentAddress"] = new RegExp(req.query.city, "i");
    }

    if (req.query.occupation) {
      profileMatch["profileData.occupation"] = new RegExp(req.query.occupation, "i");
    }

    if (req.query.joinBatch) {
      profileMatch["profileData.joinBatch"] = req.query.joinBatch;
    }

    if (req.query.passoutBatch) {
      profileMatch["profileData.passoutBatch"] = req.query.passoutBatch;
    }

    if (req.query.bloodGroup) {
      profileMatch["profileData.bloodGroup"] = req.query.bloodGroup
        .replace(/\s/g, "+")
        .toUpperCase();
    }

    // Stage 5: Apply search query (searches across name, email, city, occupation)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      profileMatch.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { "profileData.currentAddress": searchRegex },
        { "profileData.occupation": searchRegex }
      ];
    }

    if (Object.keys(profileMatch).length > 0) {
      pipeline.push({ $match: profileMatch });
    }

    // Stage 6: Facet for pagination and count
    pipeline.push({
      $facet: {
        metadata: [{ $count: "totalCount" }],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              email: 1,
              isMember: 1,
              profile: "$profileData"
            }
          }
        ]
      }
    });

    const result = await User.aggregate(pipeline);
    
    const totalCount = result[0]?.metadata[0]?.totalCount || 0;
    const users = result[0]?.data || [];

    /* ------------------ Response Mapping ------------------ */
    const directory = users.map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.profile?.phone || null,
      city: user.profile?.currentAddress || null,
      occupation: user.profile?.occupation || null,
      organization: user.profile?.organization || null,
      sector: user.profile?.sector || null,
      joinBatch: user.profile?.joinBatch || null,
      passoutBatch: user.profile?.passoutBatch || null,
      bloodGroup: user.profile?.bloodGroup || null,
      about: user.profile?.about || null,
      photo: user.profile?.profilePhoto || null,
      nesmoStatus: user.isMember
        ? "NESMO Member"
        : "JNV Alumni"
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
    console.error("Alumni Directory Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load alumni directory"
    });
  }
};
