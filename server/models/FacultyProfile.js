import mongoose from 'mongoose';

const FacultyProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  department: {
    type: String,
    default: 'Computer Science and Engineering'
  },
  designation: {
    type: String,
    default: 'Associate Professor'
  },
  assignedSubjects: [{
    type: String
  }],
  assignedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const MongooseFacultyProfile = mongoose.models.FacultyProfile || mongoose.model('FacultyProfile', FacultyProfileSchema);
export default MongooseFacultyProfile;
