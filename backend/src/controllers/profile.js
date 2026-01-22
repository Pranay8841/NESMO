import User from "../models/user.js";
import Profile from "../models/profile.js";
import uploadImageToCloudinary from "../utils/imageUploader.js";
import News from "../models/news.js";

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
      organization,
      sector,
      joinBatch,
      passoutBatch,
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
        organization,
        sector,
        joinBatch,
        passoutBatch,
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

    let filledFields = 0;
    const profile = user.profile;
    
    // Count filled fields (10 total fields in profile)
    if (profile.profilePhoto) filledFields++;
    if (profile.phone) filledFields++;
    if (profile.currentAddress) filledFields++;
    if (profile.occupation) filledFields++;
    if (profile.organization) filledFields++;
    if (profile.sector) filledFields++;
    if (profile.about) filledFields++;
    if (profile.joinBatch) filledFields++;
    if (profile.passoutBatch) filledFields++;
    if (profile.bloodGroup) filledFields++;
    
    // Calculate percentage (10 fields = 100%)
    const completeness = Math.round((filledFields / 10) * 100);

    res.status(200).json({
      success: true,
      completeness: completeness
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
    const displayPicture = req.files.profilePhoto;
    const userId = req.user.id;
    
    // Upload image to Cloudinary
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    
    // Get user to find their profile ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Update the Profile model's profilePhoto field
    const updatedProfile = await Profile.findByIdAndUpdate(
      user.profile,
      { profilePhoto: image.secure_url },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      profilePhoto: image.secure_url,
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPublishedNews = async (req, res) => {
  const news = await News.find({
    status: "PUBLISHED"
  }).sort({ publishedAt: -1 });

  res.json({
    success: true,
    data: news
  });
};
