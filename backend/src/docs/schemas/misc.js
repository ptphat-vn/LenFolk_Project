// Các schema phụ trợ: Badge, Notification, Progress, PracticeSession, Streak,
// InstructorProfile, Wallet, PayoutRequest, AuditLog, Permission
module.exports = {
  Badge: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      name: { type: 'string', example: 'Chăm chỉ 7 ngày' },
      icon: { type: 'string', example: 'https://.../badge.png' },
      description: { type: 'string', nullable: true },
      type: { type: 'string', enum: ['streak', 'completion', 'practice', 'achievement'] },
      conditionKey: { type: 'string', example: 'streak_days' },
      conditionValue: { type: 'number', example: 7 },
      isActive: { type: 'boolean', example: true },
    },
  },
  BadgeInput: {
    type: 'object',
    required: ['name', 'icon', 'type', 'conditionKey', 'conditionValue'],
    properties: {
      name: { type: 'string' },
      icon: { type: 'string' },
      description: { type: 'string' },
      type: { type: 'string', enum: ['streak', 'completion', 'practice', 'achievement'] },
      conditionKey: { type: 'string', example: 'streak_days' },
      conditionValue: { type: 'number', example: 7 },
      isActive: { type: 'boolean' },
    },
  },
  Notification: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      userId: { type: 'string' },
      title: { type: 'string' },
      body: { type: 'string' },
      type: { type: 'string', enum: ['lesson', 'badge', 'subscription', 'streak', 'moderation', 'system'] },
      isRead: { type: 'boolean', example: false },
      data: { type: 'object', nullable: true },
      readAt: { type: 'string', format: 'date-time', nullable: true },
    },
  },
  NotificationInput: {
    type: 'object',
    required: ['userId', 'title', 'body', 'type'],
    properties: {
      userId: { type: 'string' },
      title: { type: 'string' },
      body: { type: 'string' },
      type: { type: 'string', enum: ['lesson', 'badge', 'subscription', 'streak', 'moderation', 'system'] },
      data: { type: 'object' },
    },
  },
  Progress: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      userId: { type: 'string' },
      courseId: { type: 'string' },
      lessonId: { type: 'string', nullable: true },
      completed: { type: 'boolean', example: false },
      progressPercent: { type: 'number', example: 0 },
    },
  },
  PracticeSession: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      userId: { type: 'string' },
      durationMinutes: { type: 'number', example: 30 },
      score: { type: 'number', nullable: true },
      notes: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Streak: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      userId: { type: 'string' },
      currentStreak: { type: 'number', example: 7 },
      longestStreak: { type: 'number', example: 10 },
      totalActiveDays: { type: 'number', example: 25 },
      lastActiveDate: { type: 'string', format: 'date-time', nullable: true },
    },
  },
  InstructorProfile: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      userId: { type: 'string' },
      status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending', description: 'Trạng thái duyệt đơn giảng viên' },
      rejectReason: { type: 'string', nullable: true },
      reviewedBy: { type: 'string', nullable: true },
      reviewedAt: { type: 'string', format: 'date-time', nullable: true },
      bio: { type: 'string', nullable: true },
      expertise: { type: 'string', nullable: true },
      websiteUrl: { type: 'string', nullable: true },
      totalStudents: { type: 'number', example: 0 },
      totalCourses: { type: 'number', example: 0 },
      rating: { type: 'number', example: 0 },
      bankDetails: {
        type: 'object',
        properties: {
          bankName: { type: 'string', nullable: true },
          accountName: { type: 'string', nullable: true },
          accountNumber: { type: 'string', nullable: true },
        },
      },
    },
  },
  Wallet: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      instructorId: { type: 'string' },
      balance: { type: 'number', example: 139300 },
      totalEarned: { type: 'number', example: 139300 },
      currency: { type: 'string', example: 'VND' },
    },
  },
  BankInfoInput: {
    type: 'object',
    required: ['bankName', 'accountName', 'accountNumber'],
    properties: {
      bankName: { type: 'string', example: 'Vietcombank' },
      accountName: { type: 'string', example: 'NGUYEN VAN A' },
      accountNumber: { type: 'string', example: '0123456789' },
    },
  },
  PayoutRequest: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      instructorId: { type: 'string' },
      amount: { type: 'number', example: 100000 },
      status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
      bankDetails: {
        type: 'object',
        properties: {
          bankName: { type: 'string' },
          accountName: { type: 'string' },
          accountNumber: { type: 'string' },
        },
      },
      adminNote: { type: 'string', nullable: true },
      processedBy: { type: 'string', nullable: true },
      processedAt: { type: 'string', format: 'date-time', nullable: true },
    },
  },
  PayoutInput: {
    type: 'object',
    required: ['amount'],
    properties: {
      amount: { type: 'number', minimum: 100000, example: 100000, description: 'Tối thiểu 100.000 VND' },
    },
  },
  ProcessPayoutInput: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['approved', 'rejected'] },
      adminNote: { type: 'string' },
    },
  },
  AuditLog: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      actorId: { type: 'string' },
      actorRole: { type: 'string', enum: ['admin', 'instructor', 'user'] },
      action: { type: 'string', example: 'APPROVE' },
      resource: { type: 'string', example: 'TransactionRecord' },
      resourceId: { type: 'string', nullable: true },
      before: { type: 'object', nullable: true },
      after: { type: 'object', nullable: true },
      ipAddress: { type: 'string', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Permission: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      name: { type: 'string', example: 'course:create' },
      description: { type: 'string', nullable: true },
    },
  },
};
