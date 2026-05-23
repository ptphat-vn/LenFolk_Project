import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Content Approval')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/content-approval')
export class ContentApprovalController {
  @Get('pending')
  @ApiOperation({ summary: 'Get pending content for approval' })
  getPending() {
    return { data: [] };
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve content' })
  approve(@Param('id') id: string) {
    return { success: true, id, status: 'approved' };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject content' })
  reject(@Param('id') id: string, @Body() dto: any) {
    return { success: true, id, status: 'rejected', reason: dto?.reason };
  }
}
