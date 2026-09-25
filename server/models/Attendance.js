import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
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
  totalHours: {
    type: Number,
    required: true,
    min: 1
  },
  attendedHours: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    default: function() {
      return Math.round((this.attendedHours / this.totalHours) * 100);
    }
  },
  status: {
    type: String,
    enum: ['Eligible (Good)', 'Shortage Warning', 'Critical Detained'],
    default: 'Eligible (Good)'
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

export const MongooseAttendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
export default MongooseAttendance;
