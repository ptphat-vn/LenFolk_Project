import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { QueryLessonDto } from './dto/query-lesson.dto';
import { ReorderLessonDto } from './dto/reorder-lesson.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';
import { Types } from 'mongoose';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get()
  @ApiOperation({ summary: 'List lessons with filters' })
  findAll(@Query() query: QueryLessonDto) {
    return this.lessonService.findAll(query);
  }

  @Get(':id')
  @ApiAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get lesson detail (subscription gate for premium)',
  })
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.lessonService.findById(id);
  }

  @Post()
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create lesson (admin)' })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
  }

  @Post('bulk-import')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk import lessons from JSON (admin)' })
  bulkImport(@Body() lessons: CreateLessonDto[]) {
    return this.lessonService.bulkImport(lessons);
  }

  @Patch(':id')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update lesson (admin)' })
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Patch(':id/publish')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Toggle publish lesson (admin)' })
  publish(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.lessonService.togglePublish(id);
  }

  @Patch(':id/reorder')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Reorder lessons in course (admin)' })
  reorder(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() reorderDto: ReorderLessonDto,
  ) {
    return this.lessonService.reorder(id, reorderDto);
  }

  @Delete(':id')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lesson (admin)' })
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.lessonService.softDelete(id);
  }
}
