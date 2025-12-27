import User from "../models/user.js";
import Profile from "../models/profile.js";
import uploadImageToCloudinary from "../utils/imageUploader.js";

/**
 * UPDATE PROFILE
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      about,
      phone,
      city,
      occupation,
      jnvBatch,
      bloodGroup
    } = req.body;

    const user = await User.findById(userId).populate("profile");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      user.profile._id,
      {
        about,
        phone,
        currentAddress: city,
        occupation,
        jnvBatch,
        bloodGroup
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update profile"
    });
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

export const getProfileCompleteness = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("profile");

    let score = 0;
    const profile = user.profile;

    if (profile.profilePhoto) score += 20;
    if (profile.phone) score += 20;
    if (profile.currentAddress) score += 20;
    if (profile.occupation) score += 20;
    if (profile.about) score += 20;

    res.status(200).json({
      success: true,
      completeness: score
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to calculate profile completeness"
    });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    const displayPicture = req.files.profilePhoto
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};