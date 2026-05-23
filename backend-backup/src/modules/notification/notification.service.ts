import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationDocument> {
    return this.notificationModel.create({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
    }) as unknown as NotificationDocument;
  }

  async createForUser(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<NotificationDocument> {
    return this.create({ userId, type, title, body, data });
  }

  async findAll(userId: string, query: QueryNotificationDto) {
    const { page = 1, limit = 20, isRead } = query;
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (isRead !== undefined) filter.isRead = isRead;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.notificationModel.countDocuments(filter),
    ]);

    return paginate(data, total, page, limit);
  }

  async markAsRead(id: Types.ObjectId, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
    return { count };
  }
}
