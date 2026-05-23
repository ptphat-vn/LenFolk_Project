import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TransactionRecord,
  TransactionDocument,
  TransactionStatus,
} from './entities/transaction.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MomoWebhookDto } from './dto/momo-webhook.dto';
import { VnpayWebhookDto } from './dto/vnpay-webhook.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(TransactionRecord.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async initiatePayment(userId: string, dto: CreatePaymentDto) {
    // TODO: Integrate with MoMo / VNPay / Stripe SDKs
    const transaction = await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(dto.planId),
      amount: 0, // Will be set from plan
      paymentMethod: dto.paymentMethod,
      status: TransactionStatus.PENDING,
    });

    return {
      transactionId: transaction._id.toString(),
      paymentUrl: `https://payment-gateway.example.com/pay?orderId=${transaction._id}`,
    };
  }

  async handleMomoWebhook(dto: MomoWebhookDto) {
    this.logger.log(
      `MoMo webhook: orderId=${dto.orderId}, resultCode=${dto.resultCode}`,
    );

    const isSuccess = dto.resultCode === 0;

    await this.transactionModel.findOneAndUpdate(
      { _id: new Types.ObjectId(dto.orderId) },
      {
        status: isSuccess
          ? TransactionStatus.SUCCESS
          : TransactionStatus.FAILED,
        gatewayTransactionId: dto.transId,
        paidAt: isSuccess ? new Date() : null,
      },
    );

    return { message: 'OK' };
  }

  async handleVnpayWebhook(dto: VnpayWebhookDto) {
    this.logger.log(
      `VNPay webhook: txnRef=${dto.vnp_TxnRef}, responseCode=${dto.vnp_ResponseCode}`,
    );

    const isSuccess = dto.vnp_ResponseCode === '00';

    await this.transactionModel.findOneAndUpdate(
      { _id: new Types.ObjectId(dto.vnp_TxnRef) },
      {
        status: isSuccess
          ? TransactionStatus.SUCCESS
          : TransactionStatus.FAILED,
        gatewayTransactionId: dto.vnp_TransactionNo,
        paidAt: isSuccess ? new Date() : null,
      },
    );

    return { RspCode: '00', Message: 'Confirm Success' };
  }

  async getHistory(userId: string) {
    return this.transactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }
}
