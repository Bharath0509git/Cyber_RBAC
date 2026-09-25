import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { 
  User, 
  StudentProfile, 
  FacultyProfile, 
  Mark, 
  Attendance, 
  AuditLog 
} from '../models/index.js';

export const seedDatabase = async () => {
  console.log('\x1b[36m[SEEDER]\x1b[0m Starting synthetic database seed for Secure College Portal RBAC...');
  
  await connectDB();

  // Clear existing records
  await User.deleteMany({});
  await StudentProfile.deleteMany({});
  await FacultyProfile.deleteMany({});
  await Mark.deleteMany({});
  await Attendance.deleteMany({});
  await AuditLog.deleteMany({});

  console.log('[SEEDER] Prior test records purged.');

  // 1. Create Administrator
  const adminUser = await User.create({
    name: 'Administrator (SecOps)',
    email: 'admin@college.local',
    password: 'Admin@12345',
    role: 'admin',
    isActive: true
  });

  // 2. Create Faculty
  const facultyUser = await User.create({
    name: 'Dr. Alan Turing',
    email: 'faculty@college.local',
    password: 'Faculty@12345',
    role: 'faculty',
    isActive: true
  });

  const facultyProfile = await FacultyProfile.create({
    userId: facultyUser._id || facultyUser.id,
    employeeId: 'FAC001',
    name: 'Dr. Alan Turing',
    email: 'faculty@college.local',
    department: 'Computer Science and Engineering',
    designation: 'Associate Professor & Cyber Lab Lead',
    assignedSubjects: ['CS8701', 'CS8702', 'CS8703', 'CS8704']
  });

  // 3. Create Student 1 (Student A - Bharath)
  const student1User = await User.create({
    name: 'Bharath K',
    email: 'student1@college.local',
    password: 'Student@12345',
    role: 'student',
    isActive: true
  });

  const student1Profile = await StudentProfile.create({
    userId: student1User._id || student1User.id,
    registerNumber: 'STU001',
    name: 'Bharath K',
    email: 'student1@college.local',
    department: 'Computer Science and Engineering',
    year: 'IV Year',
    semester: 7,
    section: 'A',
    mentorFacultyId: facultyUser._id || facultyUser.id
  });

  // 4. Create Student 2 (Student B - Peer)
  const student2User = await User.create({
    name: 'Priya Sharma',
    email: 'student2@college.local',
    password: 'Student@12345',
    role: 'student',
    isActive: true
  });

  const student2Profile = await StudentProfile.create({
    userId: student2User._id || student2User.id,
    registerNumber: 'STU002',
    name: 'Priya Sharma',
    email: 'student2@college.local',
    department: 'Computer Science and Engineering',
    year: 'IV Year',
    semester: 7,
    section: 'A',
    mentorFacultyId: facultyUser._id || facultyUser.id
  });

  // 5. Create Student 3 (Deactivated Student Account for Testing)
  const student3User = await User.create({
    name: 'Arun Kumar (Deactivated)',
    email: 'student3@college.local',
    password: 'Student@12345',
    role: 'student',
    isActive: false // Deactivated
  });

  await StudentProfile.create({
    userId: student3User._id || student3User.id,
    registerNumber: 'STU003',
    name: 'Arun Kumar',
    email: 'student3@college.local',
    department: 'Computer Science and Engineering',
    year: 'IV Year',
    semester: 7,
    section: 'B'
  });

  // 6. Seed Academic Marks for STU001 (Bharath)
  const stu1Marks = [
    {
      studentId: student1Profile._id || student1Profile.id,
      studentRegisterNumber: 'STU001',
      studentName: 'Bharath K',
      subjectCode: 'CS8701',
      subjectName: 'Cloud Computing Architecture',
      internalMark: 36,
      semesterMark: 54,
      total: 90,
      grade: 'O',
      semester: 7,
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student1Profile._id || student1Profile.id,
      studentRegisterNumber: 'STU001',
      studentName: 'Bharath K',
      subjectCode: 'CS8702',
      subjectName: 'Cryptography & Network Security',
      internalMark: 38,
      semesterMark: 56,
      total: 94,
      grade: 'O',
      semester: 7,
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student1Profile._id || student1Profile.id,
      studentRegisterNumber: 'STU001',
      studentName: 'Bharath K',
      subjectCode: 'CS8703',
      subjectName: 'Role-Based Access Control Lab',
      internalMark: 39,
      semesterMark: 58,
      total: 97,
      grade: 'O',
      semester: 7,
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student1Profile._id || student1Profile.id,
      studentRegisterNumber: 'STU001',
      studentName: 'Bharath K',
      subjectCode: 'CS8704',
      subjectName: 'Distributed Systems & Microservices',
      internalMark: 34,
      semesterMark: 50,
      total: 84,
      grade: 'A+',
      semester: 7,
      updatedBy: facultyUser._id || facultyUser.id
    }
  ];

  for (const m of stu1Marks) {
    await Mark.create(m);
  }

  // 7. Seed Academic Marks for STU002 (Priya)
  const stu2Marks = [
    {
      studentId: student2Profile._id || student2Profile.id,
      studentRegisterNumber: 'STU002',
      studentName: 'Priya Sharma',
      subjectCode: 'CS8701',
      subjectName: 'Cloud Computing Architecture',
      internalMark: 28,
      semesterMark: 44,
      total: 72,
      grade: 'A',
      semester: 7,
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student2Profile._id || student2Profile.id,
      studentRegisterNumber: 'STU002',
      studentName: 'Priya Sharma',
      subjectCode: 'CS8702',
      subjectName: 'Cryptography & Network Security',
      internalMark: 31,
      semesterMark: 48,
      total: 79,
      grade: 'A',
      semester: 7,
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student2Profile._id || student2Profile.id,
      studentRegisterNumber: 'STU002',
      studentName: 'Priya Sharma',
      subjectCode: 'CS8703',
      subjectName: 'Role-Based Access Control Lab',
      internalMark: 35,
      semesterMark: 52,
      total: 87,
      grade: 'A+',
      semester: 7,
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student2Profile._id || student2Profile.id,
      studentRegisterNumber: 'STU002',
      studentName: 'Priya Sharma',
      subjectCode: 'CS8704',
      subjectName: 'Distributed Systems & Microservices',
      internalMark: 26,
      semesterMark: 40,
      total: 66,
      grade: 'B+',
      semester: 7,
      updatedBy: facultyUser._id || facultyUser.id
    }
  ];

  for (const m of stu2Marks) {
    await Mark.create(m);
  }

  // 8. Seed Attendance for STU001
  const stu1Attendance = [
    {
      studentId: student1Profile._id || student1Profile.id,
      studentRegisterNumber: 'STU001',
      studentName: 'Bharath K',
      subjectCode: 'CS8701',
      subjectName: 'Cloud Computing Architecture',
      totalHours: 50,
      attendedHours: 45,
      percentage: 90,
      status: 'Eligible (Good)',
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student1Profile._id || student1Profile.id,
      studentRegisterNumber: 'STU001',
      studentName: 'Bharath K',
      subjectCode: 'CS8702',
      subjectName: 'Cryptography & Network Security',
      totalHours: 50,
      attendedHours: 48,
      percentage: 96,
      status: 'Eligible (Good)',
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student1Profile._id || student1Profile.id,
      studentRegisterNumber: 'STU001',
      studentName: 'Bharath K',
      subjectCode: 'CS8703',
      subjectName: 'Role-Based Access Control Lab',
      totalHours: 30,
      attendedHours: 30,
      percentage: 100,
      status: 'Eligible (Good)',
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student1Profile._id || student1Profile.id,
      studentRegisterNumber: 'STU001',
      studentName: 'Bharath K',
      subjectCode: 'CS8704',
      subjectName: 'Distributed Systems & Microservices',
      totalHours: 50,
      attendedHours: 42,
      percentage: 84,
      status: 'Eligible (Good)',
      updatedBy: facultyUser._id || facultyUser.id
    }
  ];

  for (const a of stu1Attendance) {
    await Attendance.create(a);
  }

  // 9. Seed Attendance for STU002
  const stu2Attendance = [
    {
      studentId: student2Profile._id || student2Profile.id,
      studentRegisterNumber: 'STU002',
      studentName: 'Priya Sharma',
      subjectCode: 'CS8701',
      subjectName: 'Cloud Computing Architecture',
      totalHours: 50,
      attendedHours: 36,
      percentage: 72,
      status: 'Shortage Warning',
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student2Profile._id || student2Profile.id,
      studentRegisterNumber: 'STU002',
      subjectCode: 'CS8702',
      subjectName: 'Cryptography & Network Security',
      totalHours: 50,
      attendedHours: 40,
      percentage: 80,
      status: 'Eligible (Good)',
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student2Profile._id || student2Profile.id,
      studentRegisterNumber: 'STU002',
      subjectCode: 'CS8703',
      subjectName: 'Role-Based Access Control Lab',
      totalHours: 30,
      attendedHours: 26,
      percentage: 87,
      status: 'Eligible (Good)',
      updatedBy: facultyUser._id || facultyUser.id
    },
    {
      studentId: student2Profile._id || student2Profile.id,
      studentRegisterNumber: 'STU002',
      subjectCode: 'CS8704',
      subjectName: 'Distributed Systems & Microservices',
      totalHours: 50,
      attendedHours: 35,
      percentage: 70,
      status: 'Shortage Warning',
      updatedBy: facultyUser._id || facultyUser.id
    }
  ];

  for (const a of stu2Attendance) {
    await Attendance.create(a);
  }

  // 10. Seed Initial Audit Logs
  await AuditLog.create({
    userId: adminUser._id || adminUser.id,
    userName: adminUser.name,
    role: 'admin',
    action: 'SYSTEM_INITIALIZATION',
    resource: '/system/seed',
    status: 'ALLOWED',
    statusCode: 200,
    reason: 'Synthetic baseline test accounts and RBAC matrix loaded.',
    ipAddress: '127.0.0.1',
    userAgent: 'SystemSeeder/1.0',
    timestamp: new Date()
  });

  console.log('\x1b[32m[SEEDER COMPLETED]\x1b[0m Synthetic test data seeded successfully:');
  console.log('  -> Admin:   admin@college.local    / Admin@12345');
  console.log('  -> Faculty: faculty@college.local  / Faculty@12345');
  console.log('  -> Student: student1@college.local / Student@12345 (STU001 - Bharath)');
  console.log('  -> Student: student2@college.local / Student@12345 (STU002 - Priya)');
  console.log('  -> Student: student3@college.local / Student@12345 (STU003 - Deactivated)');
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase().then(() => {
    console.log('[SEEDER] Exiting process.');
    process.exit(0);
  }).catch(err => {
    console.error('[SEEDER ERROR]', err);
    process.exit(1);
  });
}
