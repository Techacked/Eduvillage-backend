const mongoose = require("mongoose");
const Course = require("./src/models/Course");
require("dotenv").config();

const schoolCourses = [
  // Primary (Class 1-5)
  { classNumber: 1, subjects: ['Maths', 'EVS'], totalLessons: 48, color: 'bg-success', price: 50, level: 'Primary' },
  { classNumber: 2, subjects: ['Maths', 'EVS'], totalLessons: 52, color: 'bg-success', price: 50, level: 'Primary' },
  { classNumber: 3, subjects: ['Maths', 'EVS'], totalLessons: 56, color: 'bg-success', price: 50, level: 'Primary' },
  { classNumber: 4, subjects: ['Maths', 'EVS'], totalLessons: 60, color: 'bg-success', price: 50, level: 'Primary' },
  { classNumber: 5, subjects: ['Maths', 'Science'], totalLessons: 64, color: 'bg-success', price: 50, level: 'Primary' },
  // Middle (Class 6-10)
  { classNumber: 6, subjects: ['Maths', 'Science', 'Social Science'], totalLessons: 72, color: 'bg-primary', price: 75, level: 'Middle' },
  { classNumber: 7, subjects: ['Maths', 'Science', 'Social Science'], totalLessons: 76, color: 'bg-primary', price: 75, level: 'Middle' },
  { classNumber: 8, subjects: ['Maths', 'Science', 'Social Science'], totalLessons: 80, color: 'bg-primary', price: 75, level: 'Middle' },
  { classNumber: 9, subjects: ['Maths', 'Science', 'Social Science'], totalLessons: 84, color: 'bg-primary', price: 75, level: 'Middle' },
  { classNumber: 10, subjects: ['Maths', 'Science', 'Social Science'], totalLessons: 88, color: 'bg-primary', price: 75, level: 'Middle' },
  // Senior Secondary (Class 11-12)
  { classNumber: 11, subjects: ['Physics', 'Chemistry', 'Maths'], stream: 'PCM', totalLessons: 96, color: 'bg-warning', price: 100, level: 'Senior Secondary' },
  { classNumber: 11, subjects: ['Physics', 'Chemistry', 'Biology'], stream: 'PCB', totalLessons: 96, color: 'bg-destructive', price: 100, level: 'Senior Secondary' },
  { classNumber: 11, subjects: ['Accounts', 'Economics', 'Business Studies'], stream: 'Commerce', totalLessons: 90, color: 'bg-secondary-foreground', price: 100, level: 'Senior Secondary' },
  { classNumber: 12, subjects: ['Physics', 'Chemistry', 'Maths'], stream: 'PCM', totalLessons: 102, color: 'bg-warning', price: 100, level: 'Senior Secondary' },
  { classNumber: 12, subjects: ['Physics', 'Chemistry', 'Biology'], stream: 'PCB', totalLessons: 102, color: 'bg-destructive', price: 100, level: 'Senior Secondary' },
  { classNumber: 12, subjects: ['Accounts', 'Economics', 'Business Studies'], stream: 'Commerce', totalLessons: 96, color: 'bg-secondary-foreground', price: 100, level: 'Senior Secondary' },
];

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing courses
    await Course.deleteMany({});
    console.log("Cleared existing courses");

    // Add titles and descriptions to courses
    const coursesWithDetails = schoolCourses.map(course => ({
      ...course,
      title: course.stream
        ? `Class ${course.classNumber} - ${course.stream}`
        : `Class ${course.classNumber}`,
      description: `Complete curriculum for ${course.stream ? `Class ${course.classNumber} ${course.stream} stream` : `Class ${course.classNumber}`} including ${course.subjects.join(', ')}.`
    }));

    // Insert courses
    await Course.insertMany(coursesWithDetails);
    console.log("Courses seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding courses:", error);
    process.exit(1);
  }
};

seedCourses();