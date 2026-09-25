import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'ANONYMOUS'
  },
  userName: {
    type: String,
    default: 'Unauthenticated User'
  },
  role: {
    type: String,
    default: 'NONE'
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  method: {
    type: String,
    default: 'GET'
  },
  status: {
    type: String,
    enum: ['ALLOWED', 'DENIED', 'ERROR'],
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: 'Operation authorized normally'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  userAgent: {
    type: String,
    default: 'Web Browser'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const MongooseAuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export default MongooseAuditLog;
