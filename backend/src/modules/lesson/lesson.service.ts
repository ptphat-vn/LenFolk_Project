import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lesson, LessonDocument } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { QueryLessonDto } from './dto/query-lesson.dto';
import { ReorderLessonDto } from './dto/reorder-lesson.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<LessonDocument> {
    const lesson = new this.lessonModel({
      ...createLessonDto,
      courseId: new Types.ObjectId(createLessonDto.courseId),
    });
    return lesson.save();
  }

  async bulkImport(lessons: CreateLessonDto[]): Promise<LessonDocument[]> {
    const docs = lessons.map((l) => ({
      ...l,
      courseId: new Types.ObjectId(l.courseId),
    }));
    return this.lessonModel.insertMany(docs) as unknown as LessonDocument[];
  }

  async findAll(query: QueryLessonDto) {
    const { page = 1, limit = 20, courseId, isPublished } = query;
    const filter: Record<string, unknown> = { isDeleted: false };

    if (courseId) filter.courseId = new Types.ObjectId(courseId);
    if (isPublished !== undefined) filter.isPublished = isPublished;

    const [data, total] = await Promise.all([
      this.lessonModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ order: 1 })
        .lean(),
      this.lessonModel.countDocuments(filter),
    ]);

    return paginate(data, total, page, limit);
  }

  async findById(id: Types.ObjectId): Promise<LessonDocument> {
    const lesson = await this.lessonModel
      .findOne({ _id: id, isDeleted: false })
      .lean();
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson as LessonDocument;
  }

  async update(
    id: Types.ObjectId,
    updateLessonDto: UpdateLessonDto,
  ): Promise<LessonDocument> {
    const lesson = await this.lessonModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateLessonDto, {
        new: true,
      })
      .lean();
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson as LessonDocument;
  }

  async togglePublish(id: Types.ObjectId): Promise<LessonDocument> {
    const lesson = await this.lessonModel.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    lesson.isPublished = !lesson.isPublished;
    return lesson.save() as unknown as LessonDocument;
  }

  async reorder(
    courseId: Types.ObjectId,
    reorderDto: ReorderLessonDto,
  ): Promise<void> {
    const bulkOps = reorderDto.orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id), courseId },
        update: { $set: { order: index + 1 } },
      },
    }));
    await this.lessonModel.bulkWrite(bulkOps);
  }

  async softDelete(id: Types.ObjectId): Promise<void> {
    const result = await this.lessonModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
    );
    if (!result) throw new NotFoundException('Lesson not found');
  }
}
