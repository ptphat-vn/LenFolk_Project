import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLog, AuditLogSchema } from './entities/audit-log.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { Course, CourseSchema } from '../course/entities/course.entity';
import { Lesson, LessonSchema } from '../lesson/entities/lesson.entity';
import {
  TransactionRecord,
  TransactionSchema,
} from '../payment/entities/transaction.entity';
import {
  PracticeSession,
  PracticeSessionSchema,
} from '../practice/entities/practice-session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: TransactionRecord.name, schema: TransactionSchema },
      { name: PracticeSession.name, schema: PracticeSessionSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
