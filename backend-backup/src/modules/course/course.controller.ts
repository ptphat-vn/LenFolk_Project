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
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';
import { Types } from 'mongoose';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'List courses with filters' })
  findAll(@Query() query: QueryCourseDto) {
    return this.courseService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.courseService.findById(id);
  }

  @Get(':id/lessons')
  @ApiAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get lessons for a course with user progress' })
  getCourseLessons(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser('_id') userId: string,
  ) {
    return this.courseService.getCourseLessons(id, userId);
  }

  @Post()
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create course (admin)' })
  create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser('_id') instructorId: string,
  ) {
    return this.courseService.create(createCourseDto, instructorId);
  }

  @Patch(':id')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update course (admin)' })
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete course (admin)' })
  remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.courseService.softDelete(id);
  }
}
