import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import MongooseUser from './User.js';
import MongooseStudentProfile from './StudentProfile.js';
import MongooseFacultyProfile from './FacultyProfile.js';
import MongooseMark from './Mark.js';
import MongooseAttendance from './Attendance.js';
import MongooseAuditLog from './AuditLog.js';
import { LocalCollection } from '../data/storageEngine.js';

// Local collections
const localUsers = new LocalCollection('users');
const localStorageStudents = new LocalCollection('studentProfiles');
const localStorageFaculty = new LocalCollection('facultyProfiles');
const localStorageMarks = new LocalCollection('marks');
const localStorageAttendance = new LocalCollection('attendances');
const localStorageAuditLogs = new LocalCollection('auditLogs');

const isMongooseActive = () => mongoose.connection.readyState === 1;

// Wrapper for User model to support matchPassword in fallback mode
export const User = {
  async findOne(query) {
    if (isMongooseActive()) {
      return await MongooseUser.findOne(query).select('+password');
    }
    const user = await localUsers.findOne(query);
    if (user && !user.matchPassword) {
      user.matchPassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      };
    }
    return user;
  },
  async findById(id) {
    if (isMongooseActive()) {
      return await MongooseUser.findById(id).select('-password');
    }
    const user = await localUsers.findById(id);
    if (user) {
      const copy = { ...user };
      delete copy.password;
      return copy;
    }
    return null;
  },
  async find(query = {}) {
    if (isMongooseActive()) {
      return await MongooseUser.find(query).select('-password');
    }
    const users = await localUsers.find(query);
    return users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
  },
  async create(data) {
    if (isMongooseActive()) {
      return await MongooseUser.create(data);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const userDoc = {
      ...data,
      password: hashedPassword
    };
    return await localUsers.create(userDoc);
  },
  async findByIdAndUpdate(id, data, options) {
    if (isMongooseActive()) {
      return await MongooseUser.findByIdAndUpdate(id, data, options);
    }
    return await localUsers.findByIdAndUpdate(id, data, options);
  },
  async deleteOne(query) {
    if (isMongooseActive()) return await MongooseUser.deleteOne(query);
    return await localUsers.deleteOne(query);
  },
  async deleteMany(query) {
    if (isMongooseActive()) return await MongooseUser.deleteMany(query);
    return await localUsers.deleteMany(query);
  },
  async countDocuments(query) {
    if (isMongooseActive()) return await MongooseUser.countDocuments(query);
    return await localUsers.countDocuments(query);
  }
};

export const StudentProfile = {
  async findOne(query) {
    if (isMongooseActive()) return await MongooseStudentProfile.findOne(query);
    return await localStorageStudents.findOne(query);
  },
  async findById(id) {
    if (isMongooseActive()) return await MongooseStudentProfile.findById(id);
    return await localStorageStudents.findById(id);
  },
  async find(query = {}) {
    if (isMongooseActive()) return await MongooseStudentProfile.find(query);
    return await localStorageStudents.find(query);
  },
  async create(data) {
    if (isMongooseActive()) return await MongooseStudentProfile.create(data);
    return await localStorageStudents.create(data);
  },
  async findByIdAndUpdate(id, data, options) {
    if (isMongooseActive()) return await MongooseStudentProfile.findByIdAndUpdate(id, data, options);
    return await localStorageStudents.findByIdAndUpdate(id, data, options);
  },
  async deleteMany(query) {
    if (isMongooseActive()) return await MongooseStudentProfile.deleteMany(query);
    return await localStorageStudents.deleteMany(query);
  },
  async countDocuments(query) {
    if (isMongooseActive()) return await MongooseStudentProfile.countDocuments(query);
    return await localStorageStudents.countDocuments(query);
  }
};

export const FacultyProfile = {
  async findOne(query) {
    if (isMongooseActive()) return await MongooseFacultyProfile.findOne(query);
    return await localStorageFaculty.findOne(query);
  },
  async findById(id) {
    if (isMongooseActive()) return await MongooseFacultyProfile.findById(id);
    return await localStorageFaculty.findById(id);
  },
  async find(query = {}) {
    if (isMongooseActive()) return await MongooseFacultyProfile.find(query);
    return await localStorageFaculty.find(query);
  },
  async create(data) {
    if (isMongooseActive()) return await MongooseFacultyProfile.create(data);
    return await localStorageFaculty.create(data);
  },
  async findByIdAndUpdate(id, data, options) {
    if (isMongooseActive()) return await MongooseFacultyProfile.findByIdAndUpdate(id, data, options);
    return await localStorageFaculty.findByIdAndUpdate(id, data, options);
  },
  async deleteMany(query) {
    if (isMongooseActive()) return await MongooseFacultyProfile.deleteMany(query);
    return await localStorageFaculty.deleteMany(query);
  },
  async countDocuments(query) {
    if (isMongooseActive()) return await MongooseFacultyProfile.countDocuments(query);
    return await localStorageFaculty.countDocuments(query);
  }
};

export const Mark = {
  async findOne(query) {
    if (isMongooseActive()) return await MongooseMark.findOne(query);
    return await localStorageMarks.findOne(query);
  },
  async findById(id) {
    if (isMongooseActive()) return await MongooseMark.findById(id);
    return await localStorageMarks.findById(id);
  },
  async find(query = {}) {
    if (isMongooseActive()) return await MongooseMark.find(query);
    return await localStorageMarks.find(query);
  },
  async create(data) {
    if (isMongooseActive()) return await MongooseMark.create(data);
    return await localStorageMarks.create(data);
  },
  async findByIdAndUpdate(id, data, options) {
    if (isMongooseActive()) return await MongooseMark.findByIdAndUpdate(id, data, options);
    return await localStorageMarks.findByIdAndUpdate(id, data, options);
  },
  async deleteMany(query) {
    if (isMongooseActive()) return await MongooseMark.deleteMany(query);
    return await localStorageMarks.deleteMany(query);
  },
  async countDocuments(query) {
    if (isMongooseActive()) return await MongooseMark.countDocuments(query);
    return await localStorageMarks.countDocuments(query);
  }
};

export const Attendance = {
  async findOne(query) {
    if (isMongooseActive()) return await MongooseAttendance.findOne(query);
    return await localStorageAttendance.findOne(query);
  },
  async findById(id) {
    if (isMongooseActive()) return await MongooseAttendance.findById(id);
    return await localStorageAttendance.findById(id);
  },
  async find(query = {}) {
    if (isMongooseActive()) return await MongooseAttendance.find(query);
    return await localStorageAttendance.find(query);
  },
  async create(data) {
    if (isMongooseActive()) return await MongooseAttendance.create(data);
    return await localStorageAttendance.create(data);
  },
  async findByIdAndUpdate(id, data, options) {
    if (isMongooseActive()) return await MongooseAttendance.findByIdAndUpdate(id, data, options);
    return await localStorageAttendance.findByIdAndUpdate(id, data, options);
  },
  async deleteMany(query) {
    if (isMongooseActive()) return await MongooseAttendance.deleteMany(query);
    return await localStorageAttendance.deleteMany(query);
  },
  async countDocuments(query) {
    if (isMongooseActive()) return await MongooseAttendance.countDocuments(query);
    return await localStorageAttendance.countDocuments(query);
  }
};

export const AuditLog = {
  async find(query = {}) {
    if (isMongooseActive()) {
      return await MongooseAuditLog.find(query).sort({ timestamp: -1 });
    }
    const logs = await localStorageAuditLogs.find(query);
    return logs.sort({ timestamp: -1 });
  },
  async create(data) {
    if (isMongooseActive()) return await MongooseAuditLog.create(data);
    return await localStorageAuditLogs.create(data);
  },
  async deleteMany(query) {
    if (isMongooseActive()) return await MongooseAuditLog.deleteMany(query);
    return await localStorageAuditLogs.deleteMany(query);
  },
  async countDocuments(query) {
    if (isMongooseActive()) return await MongooseAuditLog.countDocuments(query);
    return await localStorageAuditLogs.countDocuments(query);
  }
};
