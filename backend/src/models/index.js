const User = require('./User');
const { Permission, RolePermission } = require('./Permission');
const InstructorProfile = require('./InstructorProfile');
const Course = require('./Course');
const Performance = require('./Performance');
const Lesson = require('./Lesson');
const PracticeSession = require('./PracticeSession');
const { Badge, UserBadge } = require('./Badge');
const Streak = require('./Streak');
const Progress = require('./Progress');
const CoursePlan = require('./CoursePlan');
const Enrollment = require('./Enrollment');
const TransactionRecord = require('./TransactionRecord');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');
const Coupon = require('./Coupon');
const Wallet = require('./Wallet');
const PayoutRequest = require('./PayoutRequest');

module.exports = {
  User,
  Permission,
  RolePermission,
  InstructorProfile,
  Course,
  Performance,
  Lesson,
  PracticeSession,
  Badge,
  UserBadge,
  Streak,
  Progress,
  CoursePlan,
  Enrollment,
  TransactionRecord,
  Notification,
  AuditLog,
  Coupon,
  Wallet,
  PayoutRequest,
};
