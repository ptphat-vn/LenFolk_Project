import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { GrantSubscriptionDto } from './dto/grant-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';
import { Types } from 'mongoose';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List available subscription plans' })
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Post('plans')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create subscription plan (admin)' })
  createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.subscriptionService.createPlan(createPlanDto);
  }

  @Patch('plans/:id')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update subscription plan (admin)' })
  updatePlan(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.subscriptionService.updatePlan(id, updatePlanDto);
  }

  @Delete('plans/:id')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete subscription plan (admin)' })
  deletePlan(@Param('id', ParseObjectIdPipe) id: Types.ObjectId) {
    return this.subscriptionService.deletePlan(id);
  }

  @Get('users')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List user subscriptions (admin)' })
  getUserSubscriptions() {
    return this.subscriptionService.getUserSubscriptions();
  }

  @Post('grant/:userId')
  @ApiAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Manually grant subscription to user (admin)' })
  grantSubscription(
    @Param('userId', ParseObjectIdPipe) userId: Types.ObjectId,
    @Body() grantDto: GrantSubscriptionDto,
  ) {
    return this.subscriptionService.grantSubscription(userId, grantDto);
  }

  @Get('my')
  @ApiAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user subscription' })
  getMySubscription(@CurrentUser('_id') userId: string) {
    return this.subscriptionService.getUserActiveSubscription(userId);
  }
}
