import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { Course, CourseDocument } from '../course/entities/course.entity';
import { Lesson, LessonDocument } from '../lesson/entities/lesson.entity';
import {
  TransactionRecord,
  TransactionDocument,
  TransactionStatus,
} from '../payment/entities/transaction.entity';
import {
  PracticeSession,
  PracticeSessionDocument,
  PracticeStatus,
} from '../practice/entities/practice-session.entity';
import { AuditLog, AuditLogDocument } from './entities/audit-log.entity';
import { QueryDashboardDto } from './dto/query-dashboard.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(TransactionRecord.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(PracticeSession.name)
    private practiceModel: Model<PracticeSessionDocument>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async getDashboard(query: QueryDashboardDto) {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisMonth,
      totalCourses,
      publishedLessons,
      totalLessons,
      sessionsToday,
      recentSignups,
      recentTransactions,
    ] = await Promise.all([
      this.userModel.countDocuments({ isDeleted: false }),
      this.userModel.countDocuments({
        isDeleted: false,
        createdAt: { $gte: todayStart },
      }),
      this.userModel.countDocuments({
        isDeleted: false,
        createdAt: { $gte: monthStart },
      }),
      this.courseModel.countDocuments({ isDeleted: false }),
      this.lessonModel.countDocuments({ isDeleted: false, isPublished: true }),
      this.lessonModel.countDocuments({ isDeleted: false }),
      this.practiceModel.countDocuments({ createdAt: { $gte: todayStart } }),
      this.userModel
        .find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(query.recentSignupsLimit ?? 5)
        .lean(),
      this.transactionModel
        .find({ status: TransactionStatus.SUCCESS })
        .sort({ paidAt: -1 })
        .limit(query.recentTransactionsLimit ?? 5)
        .lean(),
    ]);

    return {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisMonth: newUsersThisMonth,
      },
      content: { totalCourses, totalLessons, publishedLessons },
      practice: { sessionsToday },
      recentSignups,
      recentTransactions,
    };
  }

  async getSystemHealth() {
    const mongoConnected = this.connection.readyState === 1;

    return {
      mongoConnected,
      redisConnected: false, // TODO: check Redis connection
      s3Connected: false, // TODO: check S3 connection
      aiQueueDepth: 0, // TODO: check BullMQ queue depth
      timestamp: new Date().toISOString(),
    };
  }

  async getAuditLogs() {
    return this.auditLogModel
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('adminId', 'email fullName')
      .lean();
  }

  async createAuditLog(
    adminId: string,
    action: string,
    targetResource: string,
    targetId?: string,
    oldValue?: Record<string, unknown>,
    newValue?: Record<string, unknown>,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.auditLogModel.create({
      adminId,
      action,
      targetResource,
      targetId,
      oldValue,
      newValue,
      ip,
      userAgent,
    });
  }
}
