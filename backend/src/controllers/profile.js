import User from "../models/user.js";
import Profile from "../models/profile.js";

/**
 * UPDATE PROFILE
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedFields = [
      "about",
      "phone",
      "jnvBatch",
      "occupation",
      "currentAddress",
      "bloodGroup",
      "privacy"
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedProfile = await Profile.findByIdAndUpdate(
      user.profile,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });

  } catch (error) {
    return res.status(500).json({ message: "Profile update failed" });
  }
};

/**
 * GET MY PROFILE (USER + PROFILE)
 */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("profile")
      .select("-password");

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};
