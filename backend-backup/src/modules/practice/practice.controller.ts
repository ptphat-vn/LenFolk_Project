import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PracticeService } from './practice.service';
import { SubmitPracticeDto } from './dto/submit-practice.dto';
import { QueryPracticeDto } from './dto/query-practice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';
import { Types } from 'mongoose';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Practice')
@ApiAuth()
@UseGuards(JwtAuthGuard)
@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('submit')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit practice audio for AI scoring' })
  submit(
    @Body() submitDto: SubmitPracticeDto,
    @CurrentUser('_id') userId: string,
  ) {
    return this.practiceService.submit(userId, submitDto);
  }

  @Get('session/:id')
  @ApiOperation({ summary: 'Get practice session result' })
  getSession(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.practiceService.getSession(id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get practice history with scores' })
  getHistory(
    @CurrentUser('_id') userId: string,
    @Query() query: QueryPracticeDto,
  ) {
    return this.practiceService.getHistory(userId, query);
  }

  @Get('lesson/:id/best')
  @ApiOperation({ summary: 'Get best practice attempt for a lesson' })
  getBestAttempt(
    @Param('id', ParseObjectIdPipe) lessonId: Types.ObjectId,
    @CurrentUser('_id') userId: string,
  ) {
    return this.practiceService.getBestAttempt(userId, lessonId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get practice statistics and improvement trend' })
  getStats(@CurrentUser('_id') userId: string) {
    return this.practiceService.getStats(userId);
  }
}
