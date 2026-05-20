import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Schema({ _id: false })
export class Badge {
  @Prop({ required: true })
  type!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  awardedAt!: Date;
}
export const BadgeSchema = SchemaFactory.createForClass(Badge);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ default: 'local' })
  authProvider!: string;

  @Prop({ type: String, default: null })
  googleId!: string | null;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ select: false })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ default: null })
  avatar!: string;

  @Prop({ default: null })
  phoneNumber!: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan', default: null })
  subscriptionPlan!: Types.ObjectId;

  @Prop({ default: 0 })
  currentStreak!: number;

  @Prop({ default: 0 })
  longestStreak!: number;

  @Prop({ default: null })
  lastActiveDate!: Date;

  @Prop({ default: 0 })
  totalLearningMinutes!: number;

  @Prop({ default: 0 })
  xpPoints!: number;

  @Prop({ default: 1 })
  level!: number;

  @Prop({ type: [BadgeSchema], default: [] })
  badges!: Badge[];

  @Prop({ type: [String], default: [] })
  deviceTokens!: string[];

  @Prop({ default: false })
  isEmailVerified!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isDeleted!: boolean;

  @Prop({ default: null })
  deletedAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy!: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ role: 1, isActive: 1 });
