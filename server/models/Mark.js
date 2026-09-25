import mongoose from 'mongoose';

const MarkSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  studentRegisterNumber: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  subjectCode: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  internalMark: {
    type: Number,
    required: true,
    min: 0,
    max: 40
  },
  semesterMark: {
    type: Number,
    required: true,
    min: 0,
    max: 60
  },
  total: {
    type: Number,
    default: function() {
      return (this.internalMark || 0) + (this.semesterMark || 0);
    }
  },
  grade: {
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'RA'],
    default: 'A'
  },
  semester: {
    type: Number,
    default: 7
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const MongooseMark = mongoose.models.Mark || mongoose.model('Mark', MarkSchema);
export default MongooseMark;
