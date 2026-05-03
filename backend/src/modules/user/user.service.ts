import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { paginate } from '../../common/utils/pagination.util';
import { hashPassword } from '../../common/utils/hash.util';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const passwordHash = await hashPassword(createUserDto.password);
    const user = new this.userModel({
      ...createUserDto,
      passwordHash,
    });
    return user.save();
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 20, search, role, isActive } = query;
    const filter: Record<string, unknown> = { isDeleted: false };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;

    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return paginate(data, total, page, limit);
  }

  async findById(id: Types.ObjectId): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ _id: id, isDeleted: false })
      .populate('subscriptionPlan')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user as UserDocument;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email, isDeleted: false })
      .select('+passwordHash');
  }

  async update(
    id: Types.ObjectId,
    updateUserDto: UpdateUserDto,
    currentUser: { _id: string; role: string },
  ): Promise<UserDocument> {
    if (currentUser.role !== 'admin' && currentUser._id !== id.toString()) {
      throw new ForbiddenException('Cannot update another user profile');
    }

    const user = await this.userModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateUserDto, {
        new: true,
      })
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user as UserDocument;
  }

  async softDelete(id: Types.ObjectId, adminId: string): Promise<void> {
    const result = await this.userModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: new Types.ObjectId(adminId),
        isActive: false,
      },
    );
    if (!result) throw new NotFoundException('User not found');
  }

  async getLearningHistory(userId: Types.ObjectId) {
    const user = await this.findById(userId);
    return { userId: user._id, history: [] };
  }

  async getStats(userId: Types.ObjectId) {
    const user = await this.findById(userId);
    return {
      currentStreak: (user as any).currentStreak,
      longestStreak: (user as any).longestStreak,
      xpPoints: (user as any).xpPoints,
      level: (user as any).level,
      badges: (user as any).badges,
      totalLearningMinutes: (user as any).totalLearningMinutes,
    };
  }
}
