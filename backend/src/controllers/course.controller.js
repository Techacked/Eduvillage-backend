const Course = require("../models/Course");

exports.createCourse = async (req, res) => {
  // Normalize level to title case to match enum
  if (req.body.level) {
    req.body.level = req.body.level.charAt(0).toUpperCase() + req.body.level.slice(1).toLowerCase();
  }

  const course = await Course.create({
    ...req.body,
    instructorId: req.user.id
  });
  res.status(201).json(course);
};

exports.getCourses = async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
};
