const express = require("express");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const auth = require("../middleware/auth.middleware");
const router = express.Router();

// GET: Get all courses (public)
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ classNumber: 1, stream: 1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET: Get course by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET: Get user's enrolled courses with progress
router.get("/enrolled/my-courses", auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate('courseId')
      .sort({ lastAccessedAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST: Create a new course (admin/teacher only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add instructor information
    const courseData = {
      ...req.body,
      instructorId: req.user.id,
      instructor: req.user.name || 'Teacher'
    };

    // Calculate totals if sections provided
    if (courseData.sections && courseData.sections.length > 0) {
      courseData.totalLessons = courseData.sections.reduce((total, section) => {
        return total + (section.lessons ? section.lessons.length : 0);
      }, 0);
      courseData.lessonsCount = courseData.totalLessons;
    }

    const course = await Course.create(courseData);
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

// PUT: Update course (admin/teacher only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE: Delete course (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
