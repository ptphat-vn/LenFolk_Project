import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  PracticeSession,
  PracticeSessionDocument,
  PracticeStatus,
} from './entities/practice-session.entity';
import { SubmitPracticeDto } from './dto/submit-practice.dto';
import { QueryPracticeDto } from './dto/query-practice.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class PracticeService {
  constructor(
    @InjectModel(PracticeSession.name)
    private practiceModel: Model<PracticeSessionDocument>,
    @InjectQueue('ai-practice') private aiQueue: Queue,
  ) {}

  async submit(
    userId: string,
    dto: SubmitPracticeDto,
  ): Promise<{ sessionId: string }> {
    const session = await this.practiceModel.create({
      userId: new Types.ObjectId(userId),
      lessonId: new Types.ObjectId(dto.lessonId),
      audioFileUrl: dto.audioFileUrl,
      duration: dto.duration ?? 0,
      status: PracticeStatus.PENDING,
    });

    await this.aiQueue.add('analyze-practice', {
      sessionId: session._id.toString(),
      audioFileUrl: dto.audioFileUrl,
      lessonId: dto.lessonId,
      userId,
    });

    return { sessionId: session._id.toString() };
  }

  async getSession(id: Types.ObjectId): Promise<PracticeSessionDocument> {
    const session = await this.practiceModel.findById(id).lean();
    if (!session) throw new NotFoundException('Practice session not found');
    return session as PracticeSessionDocument;
  }

  async getHistory(userId: string, query: QueryPracticeDto) {
    const { page = 1, limit = 20 } = query;
    const filter = { userId: new Types.ObjectId(userId) };

    const [data, total] = await Promise.all([
      this.practiceModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.practiceModel.countDocuments(filter),
    ]);

    return paginate(data, total, page, limit);
  }

  async getBestAttempt(userId: string, lessonId: Types.ObjectId) {
    return this.practiceModel
      .findOne({
        userId: new Types.ObjectId(userId),
        lessonId,
        status: PracticeStatus.COMPLETED,
      })
      .sort({ aiScore: -1 })
      .lean();
  }

  async getStats(userId: string) {
    const sessions = await this.practiceModel
      .find({
        userId: new Types.ObjectId(userId),
        status: PracticeStatus.COMPLETED,
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!sessions.length)
      return { totalSessions: 0, avgScore: 0, bestScore: 0 };

    const scores = sessions.map((s) => s.aiScore ?? 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestScore = Math.max(...scores);

    return {
      totalSessions: sessions.length,
      avgScore: Math.round(avgScore * 100) / 100,
      bestScore,
    };
  }
}
