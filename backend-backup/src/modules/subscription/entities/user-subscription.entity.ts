import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserSubscriptionDocument = UserSubscription & Document;

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  TRIAL = 'trial',
}

export enum PaymentMethod {
  MOMO = 'momo',
  VNPAY = 'vnpay',
  STRIPE = 'stripe',
  APPLE_IAP = 'apple_iap',
  GOOGLE_PLAY = 'google_play',
}

@Schema({ _id: false })
export class Transaction {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  paidAt: Date;
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);

@Schema({ timestamps: true, collection: 'user_subscriptions' })
export class UserSubscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan', required: true })
  planId: Types.ObjectId;

  @Prop({
    type: String,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status: SubscriptionStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: String, enum: PaymentMethod, default: null })
  paymentMethod: PaymentMethod;

  @Prop({ default: false })
  autoRenew: boolean;

  @Prop({ type: [TransactionSchema], default: [] })
  transactionHistory: Transaction[];
}

export const UserSubscriptionSchema =
  SchemaFactory.createForClass(UserSubscription);
UserSubscriptionSchema.index({ userId: 1, status: 1 });
UserSubscriptionSchema.index({ endDate: 1, status: 1 });
