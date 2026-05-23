import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true, collection: 'lessons' })
export class Lesson {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: null })
  description: string;

  @Prop({ required: true, default: 0 })
  order: number;

  @Prop({ default: null })
  videoUrl: string;

  @Prop({ default: null })
  audioUrl: string;

  @Prop({ default: null })
  sheetMusicUrl: string;

  @Prop({ default: 0 })
  duration: number;

  @Prop({ default: null })
  transcript: string;

  @Prop({ default: null })
  notes: string;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ type: [String], default: [] })
  techniques: string[];

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
LessonSchema.index({ courseId: 1, order: 1 });
LessonSchema.index({ courseId: 1, isPublished: 1 });
