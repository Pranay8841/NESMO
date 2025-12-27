import User from "../models/user.js";

/**
 * GET /api/alumni-directory
 * Access: Authenticated users only
 * Filters: city, occupation, jnvBatch, bloodGroup, isMember
 * Pagination: page, limit
 */
export const getAlumniDirectory = async (req, res) => {
  try {
    /* ------------------ Pagination ------------------ */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    /* ------------------ User filters ------------------ */
    const userQuery = { status: "ACTIVE" };

    if (req.query.isMember !== undefined) {
      userQuery.isMember = req.query.isMember === "true";
    }

    /* ------------------ Profile filters ------------------ */
    const profileMatch = {};

    if (req.query.city) {
      profileMatch.currentAddress = new RegExp(
        `^${req.query.city}$`,
        "i"
      );
    }

    if (req.query.occupation) {
      profileMatch.occupation = new RegExp(
        req.query.occupation,
        "i"
      );
    }

    if (req.query.jnvBatch) {
      profileMatch.jnvBatch = req.query.jnvBatch;
    }

    if (req.query.bloodGroup) {
      profileMatch.bloodGroup = req.query.bloodGroup
        .replace(/\s/g, "+")
        .toUpperCase();
    }

    /* ------------------ Query DB ------------------ */
    const users = await User.find(userQuery)
      .select("firstName lastName email isMember profile")
      .populate({
        path: "profile",
        match: profileMatch,
        select: `
          phone
          currentAddress
          occupation
          jnvBatch
          bloodGroup
          about
          profilePhoto
        `
      })
      .skip(skip)
      .limit(limit)
      .lean();

    /* Remove users whose profile didn't match filters */
    const filteredUsers = users.filter(u => u.profile);

    /* ------------------ Response Mapping ------------------ */
    const directory = filteredUsers.map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.profile.phone || null,
      city: user.profile.currentAddress || null,
      occupation: user.profile.occupation || null,
      batch: user.profile.jnvBatch || null,
      bloodGroup: user.profile.bloodGroup || null,
      about: user.profile.about || null,
      photo: user.profile.profilePhoto || null,
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
