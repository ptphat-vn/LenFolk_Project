import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  STREAK_REMINDER = 'streak_reminder',
  PRACTICE_RESULT = 'practice_result',
  NEW_LESSON = 'new_lesson',
  SUBSCRIPTION_EXPIRY = 'subscription_expiry',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
}

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: Object, default: null })
  data: Record<string, unknown>;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: null })
  readAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
