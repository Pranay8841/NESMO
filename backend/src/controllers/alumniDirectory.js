import User from "../models/user.js";

/**
 * GET /api/alumni-directory
 * Access: Authenticated users only
 * Filters: city, occupation, jnvBatch, bloodGroup, isMember, search
 * Pagination: page, limit
 */
export const getAlumniDirectory = async (req, res) => {
  try {
    /* ------------------ Pagination ------------------ */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    /* ------------------ Build Aggregation Pipeline ------------------ */
    const pipeline = [];

    // Stage 1: Match active users
    const userMatch = { status: "ACTIVE" };
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

    if (req.query.jnvBatch) {
      profileMatch["profileData.jnvBatch"] = req.query.jnvBatch;
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
      batch: user.profile?.jnvBatch || null,
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
