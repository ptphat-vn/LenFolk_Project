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
const { Subscription, UserSubscription } = require('./Subscription');
const TransactionRecord = require('./TransactionRecord');
const Notification = require('./Notification');
const ModeratorLog = require('./ModeratorLog');
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
  Subscription,
  UserSubscription,
  TransactionRecord,
  Notification,
  ModeratorLog,
  AuditLog,
  Coupon,
  Wallet,
  PayoutRequest,
};
