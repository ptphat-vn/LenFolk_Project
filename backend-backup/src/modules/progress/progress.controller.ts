import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { StartLessonDto } from './dto/start-lesson.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';
import { Types } from 'mongoose';

@ApiTags('Progress')
@ApiAuth()
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('lesson/:id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a lesson' })
  startLesson(
    @Param('id', ParseObjectIdPipe) lessonId: Types.ObjectId,
    @Body() startLessonDto: StartLessonDto,
    @CurrentUser('_id') userId: string,
  ) {
    return this.progressService.startLesson(
      userId,
      lessonId,
      startLessonDto.courseId,
    );
  }

  @Patch('lesson/:id/update')
  @ApiOperation({ summary: 'Update watched time' })
  updateProgress(
    @Param('id', ParseObjectIdPipe) lessonId: Types.ObjectId,
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser('_id') userId: string,
  ) {
    return this.progressService.updateProgress(
      userId,
      lessonId,
      updateProgressDto,
    );
  }

  @Post('lesson/:id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark lesson as completed' })
  completeLesson(
    @Param('id', ParseObjectIdPipe) lessonId: Types.ObjectId,
    @CurrentUser('_id') userId: string,
  ) {
    return this.progressService.completeLesson(userId, lessonId);
  }

  @Get('course/:id')
  @ApiOperation({ summary: 'Get progress for a specific course' })
  getCourseProgress(
    @Param('id', ParseObjectIdPipe) courseId: Types.ObjectId,
    @CurrentUser('_id') userId: string,
  ) {
    return this.progressService.getCourseProgress(userId, courseId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get progress summary across all courses' })
  getSummary(@CurrentUser('_id') userId: string) {
    return this.progressService.getSummary(userId);
  }
}
