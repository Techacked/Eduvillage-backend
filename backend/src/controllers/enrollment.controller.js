const Enrollment = require("../models/Enrollment");

exports.enroll = async (req, res) => {
  await Enrollment.create({
    userId: req.user.id,
    courseId: req.params.courseId
  });
  res.json({ message: "Enrolled successfully" });
};

exports.myCourses = async (req, res) => {
  const data = await Enrollment.findAll({
    where: { userId: req.user.id }
  });
  res.json(data);
};
