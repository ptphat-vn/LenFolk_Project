import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Progress,
  ProgressDocument,
  ProgressStatus,
} from './entities/progress.entity';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async startLesson(
    userId: string,
    lessonId: Types.ObjectId,
    courseId: string,
  ): Promise<ProgressDocument> {
    const progress = await this.progressModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), lessonId },
      {
        $setOnInsert: { courseId: new Types.ObjectId(courseId) },
        $set: {
          status: ProgressStatus.IN_PROGRESS,
          lastAccessedAt: new Date(),
        },
        $inc: { attemptCount: 1 },
      },
      { upsert: true, new: true },
    );
    return progress;
  }

  async updateProgress(
    userId: string,
    lessonId: Types.ObjectId,
    dto: UpdateProgressDto,
  ): Promise<ProgressDocument> {
    const progress = await this.progressModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), lessonId },
      {
        $set: {
          ...dto,
          lastAccessedAt: new Date(),
        },
      },
      { new: true },
    );
    return progress!;
  }

  async completeLesson(
    userId: string,
    lessonId: Types.ObjectId,
  ): Promise<ProgressDocument> {
    const progress = await this.progressModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), lessonId },
      {
        $set: {
          status: ProgressStatus.COMPLETED,
          completionPercent: 100,
          completedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      },
      { new: true },
    );

    this.eventEmitter.emit('lesson.completed', { userId, lessonId });
    return progress!;
  }

  async getCourseProgress(userId: string, courseId: Types.ObjectId) {
    const records = await this.progressModel
      .find({ userId: new Types.ObjectId(userId), courseId })
      .populate('lessonId', 'title order duration')
      .lean();

    const completed = records.filter(
      (r) => r.status === ProgressStatus.COMPLETED,
    ).length;
    return { courseId, total: records.length, completed, records };
  }

  async getSummary(userId: string) {
    const records = await this.progressModel
      .find({ userId: new Types.ObjectId(userId) })
      .lean();

    const totalLessons = records.length;
    const completedLessons = records.filter(
      (r) => r.status === ProgressStatus.COMPLETED,
    ).length;
    const overallCompletionPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return { totalLessons, completedLessons, overallCompletionPercent };
  }
}
