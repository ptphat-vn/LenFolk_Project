import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PracticeSessionDocument = PracticeSession & Document;

export enum PracticeStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Schema({ timestamps: true, collection: 'practice_sessions' })
export class PracticeSession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lessonId: Types.ObjectId;

  @Prop({ required: true })
  audioFileUrl: string;

  @Prop({ default: null })
  referenceAudioUrl: string;

  @Prop({ default: null })
  aiScore: number;

  @Prop({ default: null })
  pitchAccuracy: number;

  @Prop({ default: null })
  rhythmAccuracy: number;

  @Prop({ default: null })
  techniqueScore: number;

  @Prop({ default: null })
  feedback: string;

  @Prop({ type: [String], default: [] })
  notesDetected: string[];

  @Prop({ type: [String], default: [] })
  notesExpected: string[];

  @Prop({ default: 0 })
  duration: number;

  @Prop({ type: String, enum: PracticeStatus, default: PracticeStatus.PENDING })
  status: PracticeStatus;
}

export const PracticeSessionSchema =
  SchemaFactory.createForClass(PracticeSession);
PracticeSessionSchema.index({ userId: 1, createdAt: -1 });
PracticeSessionSchema.index({ lessonId: 1, aiScore: -1 });
