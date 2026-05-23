import {
  Controller,
  Get,
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
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';
import { Types } from 'mongoose';

@ApiTags('Users')
@ApiAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get paginated list of users (admin)' })
  findAll(@Query() query: QueryUserDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: { _id: string; role: string },
  ) {
    return this.userService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user (admin)' })
  remove(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser('_id') adminId: string,
  ) {
    return this.userService.softDelete(id, adminId);
  }

  @Get(':id/learning-history')
  @ApiOperation({ summary: 'Get full learning history' })
  getLearningHistory(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.getLearningHistory(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user stats: streak, xp, level, badges' })
  getStats(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.userService.getStats(id);
  }
}
