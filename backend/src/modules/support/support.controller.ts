import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Support')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/support/tickets')
export class SupportController {
  @Get()
  @ApiOperation({ summary: 'Get all support tickets' })
  getAll() {
    return { data: [] };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details' })
  getOne(@Param('id') id: string) {
    return { id, details: {} };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  updateStatus(@Param('id') id: string, @Body() dto: any) {
    return { success: true, id, status: dto?.status };
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to a ticket' })
  reply(@Param('id') id: string, @Body() dto: any) {
    return { success: true, id, reply: dto };
  }
}
