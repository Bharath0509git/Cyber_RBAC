import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';
import { seedDatabase } from './utils/seedData.js';
import { User } from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Informational and Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    project: 'Secure College Portal - Role-Based Access Control (RBAC)',
    specification: 'Cybersecurity Engineering Learning Program - RBAC Implementation',
    timestamp: new Date(),
    database: getDBStatus()
  });
});

// Formal Role-Permission Matrix Endpoint (Documentation & UI Reference)
app.get('/api/rbac/matrix', (req, res) => {
  res.status(200).json({
    success: true,
    description: 'Enforced Server-Side Access Control Policy Matrix',
    matrix: [
      { resource: 'View Own Student Profile', student: true, faculty: true, admin: true, enforcement: 'authenticateUser + verifyStudentOwnership' },
      { resource: 'View Own Marks', student: true, faculty: false, admin: true, enforcement: 'authenticateUser + verifyStudentOwnership' },
      { resource: 'View Own Attendance', student: true, faculty: false, admin: true, enforcement: 'authenticateUser + verifyStudentOwnership' },
      { resource: 'View Peer Student Records', student: false, faculty: false, admin: true, enforcement: 'verifyStudentOwnership (403 Forbidden)' },
      { resource: 'View Assigned Cohort', student: false, faculty: true, admin: true, enforcement: 'authorize("faculty", "admin")' },
      { resource: 'Update Student Marks', student: false, faculty: true, admin: true, enforcement: 'authorize("faculty", "admin") + auditLogger' },
      { resource: 'Update Attendance', student: false, faculty: true, admin: true, enforcement: 'authorize("faculty", "admin") + auditLogger' },
      { resource: 'Manage User Accounts', student: false, faculty: false, admin: true, enforcement: 'authorize("admin")' },
      { resource: 'Modify User Roles', student: false, faculty: false, admin: true, enforcement: 'authorize("admin")' },
      { resource: 'Deactivate / Enable Users', student: false, faculty: false, admin: true, enforcement: 'authorize("admin")' },
      { resource: 'View Audit Logs & Forensics', student: false, faculty: false, admin: true, enforcement: 'authorize("admin")' },
      { resource: 'View System Analytics', student: false, faculty: false, admin: true, enforcement: 'authorize("admin")' }
    ]
  });
});

// Mount Protected API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit', auditRoutes);

// Deny-by-Default Fallback for Unmatched Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'ROUTE_NOT_FOUND',
    message: `Resource endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});

// Safe Error Handling Middleware (No Stack Traces Leaked)
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]', err.message);
  
  res.status(err.status || 500).json({
    success: false,
    code: 'SERVER_ERROR',
    message: 'An internal server security or processing error occurred safely.'
  });
});

// Start Server & Initialize Database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed synthetic users if database is fresh
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[INIT] Empty database detected. Auto-seeding initial synthetic test data...');
      await seedDatabase();
    } else {
      console.log(`[INIT] Database initialized with ${userCount} existing registered users.`);
    }

    app.listen(PORT, () => {
      console.log(`\x1b[32m[SERVER RUNNING]\x1b[0m Secure College Portal API listening at http://localhost:${PORT}`);
      console.log(`\x1b[36m[RBAC READY]\x1b[0m Security policies active: Student, Faculty, Administrator`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
  }
};

startServer();

export default app;
