import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    instructorId: string,
  ): Promise<CourseDocument> {
    const course = new this.courseModel({
      ...createCourseDto,
      instructor: new Types.ObjectId(instructorId),
    });
    return course.save();
  }

  async findAll(query: QueryCourseDto) {
    const { page = 1, limit = 20, search, level, isPremium } = query;
    const filter: Record<string, unknown> = {
      isDeleted: false,
      isPublished: true,
    };

    if (search) filter.title = { $regex: search, $options: 'i' };
    if (level) filter.level = level;
    if (isPremium !== undefined) filter.isPremium = isPremium;

    const [data, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.courseModel.countDocuments(filter),
    ]);

    return paginate(data, total, page, limit);
  }

  async findById(id: Types.ObjectId): Promise<CourseDocument> {
    const course = await this.courseModel
      .findOne({ _id: id, isDeleted: false })
      .populate('instructor', 'fullName avatar')
      .lean();
    if (!course) throw new NotFoundException('Course not found');
    return course as CourseDocument;
  }

  async getCourseLessons(courseId: Types.ObjectId, userId: string) {
    await this.findById(courseId);
    return { courseId, userId, lessons: [] };
  }

  async update(
    id: Types.ObjectId,
    updateCourseDto: UpdateCourseDto,
  ): Promise<CourseDocument> {
    const course = await this.courseModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateCourseDto, {
        new: true,
      })
      .lean();
    if (!course) throw new NotFoundException('Course not found');
    return course as CourseDocument;
  }

  async softDelete(id: Types.ObjectId): Promise<void> {
    const result = await this.courseModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
    if (!result) throw new NotFoundException('Course not found');
  }
}
