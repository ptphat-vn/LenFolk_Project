import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Promotion')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/promotion')
export class PromotionController {
  @Get()
  @ApiOperation({ summary: 'Get all promotions' })
  getAll() {
    return { data: [] };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new promotion' })
  create(@Body() dto: any) {
    return { success: true, data: dto };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update promotion status' })
  update(@Param('id') id: string, @Body() dto: any) {
    return { success: true, id, data: dto };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete promotion' })
  remove(@Param('id') id: string) {
    return { success: true, id };
  }
}
