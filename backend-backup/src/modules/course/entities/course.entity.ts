import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Schema({ timestamps: true, collection: 'courses' })
export class Course {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: null })
  thumbnail: string;

  @Prop({ type: String, enum: CourseLevel, default: CourseLevel.BEGINNER })
  level: CourseLevel;

  @Prop({ default: 0 })
  totalLessons: number;

  @Prop({ default: 0 })
  estimatedHours: number;

  @Prop({ default: false })
  isPremium: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  instructor: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.index({ level: 1, isPublished: 1 });
CourseSchema.index({ tags: 1 });
