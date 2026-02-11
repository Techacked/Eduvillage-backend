const Notification = require("../models/Notification");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

exports.courseAddedToCart = async (req, res) => {
  try {
    const { userId, courseName, price } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Save notification in DB
    const notification = await Notification.create({
      userId,
      title: "Course added to cart",
      message: `You added ${courseName} (₹${price}) to your cart.`,
    });

    // Send Email
    await sendEmail(
      user.email,
      "Course Added to Cart",
      `Hi ${user.name},\n\nYou added ${courseName} (₹${price}) to your cart.\n\nThank you for using EduVillage.`
    );

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
