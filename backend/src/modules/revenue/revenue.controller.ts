import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import { RevenueService } from './revenue.service';
import { QueryRevenueDto } from './dto/query-revenue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';

@ApiTags('Revenue')
@ApiAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get revenue overview stats' })
  getOverview() {
    return this.revenueService.getOverview();
  }

  @Get('chart')
  @ApiOperation({ summary: 'Get revenue chart data' })
  getChart(@Query() query: QueryRevenueDto) {
    return this.revenueService.getChart(query);
  }

  @Get('by-plan')
  @ApiOperation({ summary: 'Get revenue breakdown by subscription plan' })
  getByPlan() {
    return this.revenueService.getByPlan();
  }

  @Get('by-gateway')
  @ApiOperation({ summary: 'Get revenue breakdown by payment gateway' })
  getByGateway() {
    return this.revenueService.getByGateway();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get paginated transaction log' })
  getTransactions(@Query() query: QueryRevenueDto) {
    return this.revenueService.getTransactions(query);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export transactions as CSV' })
  exportCsv(@Res() res: Response, @Query() query: QueryRevenueDto) {
    return this.revenueService.exportCsv(res, query);
  }
}
