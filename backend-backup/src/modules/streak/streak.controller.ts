import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StreakService } from './streak.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';

@ApiTags('Streak')
@ApiAuth()
@UseGuards(JwtAuthGuard)
@Controller('streak')
export class StreakController {
  constructor(private readonly streakService: StreakService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user streak info' })
  getStreak(@CurrentUser('_id') userId: string) {
    return this.streakService.getStreak(userId);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get 30-day activity calendar' })
  getCalendar(@CurrentUser('_id') userId: string) {
    return this.streakService.getCalendar(userId);
  }
}
