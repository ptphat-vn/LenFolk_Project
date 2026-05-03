import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = TransactionRecord & Document;

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true, collection: 'transactions' })
export class TransactionRecord {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan', required: true })
  planId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'VND' })
  currency: string;

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: null })
  gatewayTransactionId: string;

  @Prop({ type: Object, default: null })
  gatewayResponse: Record<string, unknown>;

  @Prop({
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Prop({ default: null })
  paidAt: Date;
}

export const TransactionSchema =
  SchemaFactory.createForClass(TransactionRecord);
TransactionSchema.index({ userId: 1, status: 1 });
TransactionSchema.index({ gatewayTransactionId: 1 }, { sparse: true });
