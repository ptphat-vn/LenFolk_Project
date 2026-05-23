import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import {
  TransactionRecord,
  TransactionDocument,
  TransactionStatus,
} from '../payment/entities/transaction.entity';
import { QueryRevenueDto } from './dto/query-revenue.dto';

@Injectable()
export class RevenueService {
  constructor(
    @InjectModel(TransactionRecord.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async getOverview() {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [totalRevenue, revenueToday, revenueThisMonth, revenueThisYear] =
      await Promise.all([
        this.sumRevenue({}),
        this.sumRevenue({ paidAt: { $gte: todayStart } }),
        this.sumRevenue({ paidAt: { $gte: monthStart } }),
        this.sumRevenue({ paidAt: { $gte: yearStart } }),
      ]);

    return { totalRevenue, revenueToday, revenueThisMonth, revenueThisYear };
  }

  async getChart(query: QueryRevenueDto) {
    const groupFormat =
      query.groupBy === 'month'
        ? '%Y-%m'
        : query.groupBy === 'year'
          ? '%Y'
          : '%Y-%m-%d';

    const pipeline = [
      { $match: { status: TransactionStatus.SUCCESS } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$paidAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 as 1 } },
    ];

    return this.transactionModel.aggregate(pipeline);
  }

  async getByPlan() {
    return this.transactionModel.aggregate([
      { $match: { status: TransactionStatus.SUCCESS } },
      {
        $group: {
          _id: '$planId',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'subscription_plans',
          localField: '_id',
          foreignField: '_id',
          as: 'plan',
        },
      },
      { $unwind: '$plan' },
      { $project: { planName: '$plan.name', revenue: 1, count: 1 } },
    ]);
  }

  async getByGateway() {
    return this.transactionModel.aggregate([
      { $match: { status: TransactionStatus.SUCCESS } },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getTransactions(query: QueryRevenueDto) {
    return this.transactionModel
      .find({ status: TransactionStatus.SUCCESS })
      .sort({ paidAt: -1 })
      .limit(100)
      .lean();
  }

  async exportCsv(res: Response, query: QueryRevenueDto) {
    const transactions = await this.transactionModel
      .find({ status: TransactionStatus.SUCCESS })
      .sort({ paidAt: -1 })
      .lean();

    const csvLines = [
      'ID,Amount,Currency,PaymentMethod,PaidAt',
      ...transactions.map(
        (t) =>
          `${t._id},${t.amount},${t.currency},${t.paymentMethod},${t.paidAt}`,
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="revenue.csv"');
    res.send(csvLines.join('\n'));
  }

  private async sumRevenue(filter: Record<string, unknown>): Promise<number> {
    const result = await this.transactionModel.aggregate([
      { $match: { status: TransactionStatus.SUCCESS, ...filter } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total ?? 0;
  }
}
