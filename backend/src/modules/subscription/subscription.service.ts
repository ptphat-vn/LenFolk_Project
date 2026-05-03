import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from './entities/subscription-plan.entity';
import {
  UserSubscription,
  UserSubscriptionDocument,
  SubscriptionStatus,
} from './entities/user-subscription.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { GrantSubscriptionDto } from './dto/grant-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private planModel: Model<SubscriptionPlanDocument>,
    @InjectModel(UserSubscription.name)
    private userSubModel: Model<UserSubscriptionDocument>,
  ) {}

  async getPlans(): Promise<SubscriptionPlanDocument[]> {
    return this.planModel
      .find({ isActive: true })
      .lean() as unknown as SubscriptionPlanDocument[];
  }

  async createPlan(dto: CreatePlanDto): Promise<SubscriptionPlanDocument> {
    return this.planModel.create(dto) as unknown as SubscriptionPlanDocument;
  }

  async updatePlan(
    id: Types.ObjectId,
    dto: UpdatePlanDto,
  ): Promise<SubscriptionPlanDocument> {
    const plan = await this.planModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();
    if (!plan) throw new NotFoundException('Plan not found');
    return plan as SubscriptionPlanDocument;
  }

  async deletePlan(id: Types.ObjectId): Promise<void> {
    const result = await this.planModel.findByIdAndUpdate(id, {
      isActive: false,
    });
    if (!result) throw new NotFoundException('Plan not found');
  }

  async getUserSubscriptions() {
    return this.userSubModel
      .find()
      .populate('userId', 'email fullName')
      .populate('planId', 'name price')
      .lean();
  }

  async grantSubscription(userId: Types.ObjectId, dto: GrantSubscriptionDto) {
    return this.userSubModel.findOneAndUpdate(
      { userId },
      {
        userId,
        planId: new Types.ObjectId(dto.planId),
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(dto.endDate),
        paymentMethod: dto.paymentMethod,
        autoRenew: false,
      },
      { upsert: true, new: true },
    );
  }

  async getUserActiveSubscription(userId: string) {
    return this.userSubModel
      .findOne({
        userId: new Types.ObjectId(userId),
        status: SubscriptionStatus.ACTIVE,
      })
      .populate('planId')
      .lean();
  }
}
