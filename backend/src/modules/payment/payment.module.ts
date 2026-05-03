import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import {
  TransactionRecord,
  TransactionSchema,
} from './entities/transaction.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionRecord.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
