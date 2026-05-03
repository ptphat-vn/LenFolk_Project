import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminId: Types.ObjectId;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  targetResource: string;

  @Prop({ default: null })
  targetId: string;

  @Prop({ type: Object, default: null })
  oldValue: Record<string, unknown>;

  @Prop({ type: Object, default: null })
  newValue: Record<string, unknown>;

  @Prop({ default: null })
  ip: string;

  @Prop({ default: null })
  userAgent: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ adminId: 1, createdAt: -1 });
AuditLogSchema.index({ targetResource: 1, targetId: 1 });
