import mongoose from 'mongoose';

const StudentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  registerNumber: {
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
    required: true,
    default: 'Computer Science and Engineering'
  },
  year: {
    type: String,
    default: 'IV Year'
  },
  semester: {
    type: Number,
    default: 7
  },
  section: {
    type: String,
    default: 'A'
  },
  mentorFacultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const MongooseStudentProfile = mongoose.models.StudentProfile || mongoose.model('StudentProfile', StudentProfileSchema);
export default MongooseStudentProfile;
