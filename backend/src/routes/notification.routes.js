const express = require("express");
const router = express.Router();
const { courseAddedToCart } = require("../controllers/notification.controller");

router.post("/cart", courseAddedToCart);
router.get("/user/:id", async (req, res) => {
  const notifications = await Notification.find({ userId: req.params.id }).sort({ createdAt: -1 });
  res.json(notifications);
});

module.exports = router;
