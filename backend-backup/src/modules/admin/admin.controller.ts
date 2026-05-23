import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { QueryDashboardDto } from './dto/query-dashboard.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';

@ApiTags('Admin')
@ApiAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard overview' })
  getDashboard(@Query() query: QueryDashboardDto) {
    return this.adminService.getDashboard(query);
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  getHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
