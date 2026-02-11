const express = require("express");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const auth = require("../middleware/auth.middleware");
const router = express.Router();

// GET: Get user's enrollments
router.get("/", auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate('courseId')
      .sort({ lastAccessedAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST: Enroll in a course
router.post("/", auth, async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId: courseId
    });

    await enrollment.populate('courseId');
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT: Update progress
router.put("/:id/progress", auth, async (req, res) => {
  try {
    const { progress, lessonId } = req.body;

    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    enrollment.progress = progress;
    enrollment.lastAccessedAt = new Date();

    if (lessonId) {
      // Check if lesson is already completed
      const lessonExists = enrollment.completedLessons.find(
        lesson => lesson.lessonId === lessonId
      );

      if (!lessonExists) {
        enrollment.completedLessons.push({ lessonId });
      }
    }

    // Update status based on progress
    if (progress >= 100) {
      enrollment.status = 'completed';
    } else if (progress > 0) {
      enrollment.status = 'in_progress';
    }

    await enrollment.save();
    await enrollment.populate('courseId');

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE: Unenroll from course
router.delete("/:id", auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json({ message: "Successfully unenrolled from course" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
