import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Leaderboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/leaderboard')
export class LeaderboardController {
  @Get()
  @ApiOperation({ summary: 'Get leaderboard data' })
  getLeaderboard() {
    return { data: [] };
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update leaderboard configuration' })
  updateConfig(@Body() dto: any) {
    return { success: true, config: dto };
  }
}
