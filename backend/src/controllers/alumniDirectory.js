import User from "../models/user.js";

export const getAlumniDirectory = async (req, res) => {
  try {
    const { city, occupation, jnvBatch, bloodGroup, isMember } = req.query;

    const users = await User.find({ status: "ACTIVE" })
      .populate("profile")
      .select("firstName lastName email isMember profile");

    let result = users;

    if (city) {
      result = result.filter(u =>
        u.profile?.currentAddress?.toLowerCase() === city.toLowerCase()
      );
    }

    if (occupation) {
      result = result.filter(u =>
        u.profile?.occupation?.toLowerCase().includes(occupation.toLowerCase())
      );
    }

    if (jnvBatch) {
      result = result.filter(u =>
        u.profile?.jnvBatch === jnvBatch
      );
    }

    if (bloodGroup) {
      const normalizedBloodGroup = bloodGroup.replace(/\s/g, "+").toUpperCase();
      result = result.filter(u =>
        u.profile?.bloodGroup === normalizedBloodGroup
      );

    }

    if (isMember !== undefined) {
      result = result.filter(u =>
        String(u.isMember) === String(isMember)
      );
    }

    const directory = result.map(user => ({
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.profile?.phone,
      city: user.profile?.currentAddress,
      occupation: user.profile?.occupation,
      batch: user.profile?.jnvBatch,
      bloodGroup: user.profile?.bloodGroup,
      about: user.profile?.about,
      photo: user.profile?.profilePhoto,
      nesmoStatus: user.isMember ? "NESMO Member" : "JNV Alumni"
    }));

    res.status(200).json({
      success: true,
      count: directory.length,
      data: directory
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load alumni directory"
    });
  }
};
