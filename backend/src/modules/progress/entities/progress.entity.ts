import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgressDocument = Progress & Document;

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true, collection: 'progress' })
export class Progress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @Prop({ default: 0 })
  watchedSeconds: number;

  @Prop({ default: 0 })
  completionPercent: number;

  @Prop({ default: 0 })
  practiceScore: number;

  @Prop({ default: 0 })
  attemptCount: number;

  @Prop({ default: null })
  lastAccessedAt: Date;

  @Prop({ default: null })
  completedAt: Date;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);
ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
ProgressSchema.index({ userId: 1, courseId: 1 });
