import User from "../models/user.js";

/**
 * One-time Admin Bootstrap
 * Works ONLY if no admin exists
 */
export const bootstrapAdmin = async (req, res) => {
  const adminExists = await User.findOne({ role: "ADMIN" });

  if (adminExists) {
    return res.status(403).json({
      message: "Admin already exists. Bootstrap disabled."
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = "ADMIN";
  await user.save();

  res.json({
    message: "Admin bootstrap successful",
    adminId: user._id
  });
};

/**
 * Assign or change role (ADMIN only)
 */
export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const validRoles = ["VISITOR", "MEMBER", "EVENT_LEAD", "ADMIN"];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = role;
  user.isMember = role === "MEMBER" || role === "ADMIN";
  await user.save();

  res.json({
    message: "User role updated successfully"
  });
};

/**
 * Block or Unblock User
 */
export const updateUserStatus = async (req, res) => {
  const { status } = req.body;
  if (!["ACTIVE", "BLOCKED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.status = status;
  await user.save();

  res.json({
    message: `User ${status.toLowerCase()} successfully`
  });
};

/**
 * List users (Admin view)
 */
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};
