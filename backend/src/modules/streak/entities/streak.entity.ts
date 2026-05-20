import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StreakDocument = Streak & Document;

@Schema({ timestamps: true, collection: 'streaks' })
export class Streak {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ default: null })
  lastActiveDate: Date;

  @Prop({ type: [Date], default: [] })
  activeDates: Date[];
}

export const StreakSchema = SchemaFactory.createForClass(Streak);
