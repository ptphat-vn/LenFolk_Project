import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Streak, StreakDocument } from './entities/streak.entity';

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);

  constructor(
    @InjectModel(Streak.name) private streakModel: Model<StreakDocument>,
  ) {}

  async updateStreak(userId: string): Promise<StreakDocument> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let streak = await this.streakModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!streak) {
      streak = new this.streakModel({
        userId: new Types.ObjectId(userId),
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        activeDates: [today],
      });
      return streak.save();
    }

    const lastActive = streak.lastActiveDate
      ? new Date(streak.lastActiveDate)
      : null;

    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);

      if (lastActive.getTime() === today.getTime()) {
        return streak; // Already active today
      }

      if (lastActive.getTime() === yesterday.getTime()) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1; // Gap > 1 day — reset
      }
    } else {
      streak.currentStreak = 1;
    }

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streak.lastActiveDate = today;
    if (
      !streak.activeDates.some((d) => new Date(d).getTime() === today.getTime())
    ) {
      streak.activeDates.push(today);
    }

    return streak.save();
  }

  async getStreak(userId: string): Promise<StreakDocument | null> {
    return this.streakModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean() as unknown as StreakDocument;
  }

  async getCalendar(userId: string) {
    const streak = await this.streakModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean();
    if (!streak) return { activeDates: [] };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDates = (streak.activeDates || []).filter(
      (d) => new Date(d) >= thirtyDaysAgo,
    );

    return { activeDates: recentDates };
  }

  @Cron('0 23 * * *')
  async remindUsersAboutStreak() {
    this.logger.log('Checking streak reminders at 23:00...');
    // TODO: Find users who haven't practiced today and send push notifications
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetExpiredStreaks() {
    this.logger.log('Checking for expired streaks...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    await this.streakModel.updateMany(
      { lastActiveDate: { $lt: yesterday }, currentStreak: { $gt: 0 } },
      { $set: { currentStreak: 0 } },
    );
  }
}
