const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'pdf', 'link', 'text'],
    default: 'video'
  },
  duration: {
    type: String,
    default: '10:00'
  },
  content: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
});

const SectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  lessons: [LessonSchema],
  order: {
    type: Number,
    default: 0
  }
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // For school courses (Class 1-12)
  classNumber: {
    type: Number,
    min: 1,
    max: 12
  },
  subjects: [{
    type: String
  }],
  stream: {
    type: String,
    enum: ['PCM', 'PCB', 'Commerce', null],
    default: null
  },
  
  // For general courses
  category: {
    type: String,
    required: true,
    default: 'General'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'Beginner', 'Intermediate', 'Advanced', 'Primary', 'Middle', 'Senior Secondary'],
    required: true
  },
  
  // Common fields
  price: {
    type: Number,
    required: true,
    default: 0
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
  },
  instructor: {
    type: String,
    default: 'Teacher'
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Course content
  sections: [SectionSchema],
  totalLessons: {
    type: Number,
    default: 0
  },
  lessonsCount: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: '0 hours'
  },
  
  // Stats
  studentsEnrolled: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  // Legacy field for school courses
  color: {
    type: String,
    default: '#2563EB'
  }
}, {
  timestamps: true
});

// Calculate total lessons before saving
CourseSchema.pre('save', function(next) {
  if (this.sections && this.sections.length > 0) {
    this.totalLessons = this.sections.reduce((total, section) => {
      return total + (section.lessons ? section.lessons.length : 0);
    }, 0);
    this.lessonsCount = this.totalLessons;
  }
  next();
});

module.exports = mongoose.model("Course", CourseSchema);
