import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RevenueController } from './revenue.controller';
import { RevenueService } from './revenue.service';
import {
  TransactionRecord,
  TransactionSchema,
} from '../payment/entities/transaction.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionRecord.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [RevenueController],
  providers: [RevenueService],
  exports: [RevenueService],
})
export class RevenueModule {}
