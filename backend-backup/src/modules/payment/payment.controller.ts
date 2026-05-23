import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { MomoWebhookDto } from './dto/momo-webhook.dto';
import { VnpayWebhookDto } from './dto/vnpay-webhook.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @ApiAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initiate a payment for subscription' })
  initiatePayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser('_id') userId: string,
  ) {
    return this.paymentService.initiatePayment(userId, createPaymentDto);
  }

  @Post('webhook/momo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'MoMo payment webhook' })
  momoWebhook(@Body() dto: MomoWebhookDto) {
    return this.paymentService.handleMomoWebhook(dto);
  }

  @Post('webhook/vnpay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'VNPay payment webhook' })
  vnpayWebhook(@Body() dto: VnpayWebhookDto) {
    return this.paymentService.handleVnpayWebhook(dto);
  }

  @Get('history')
  @ApiAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment history' })
  getHistory(@CurrentUser('_id') userId: string) {
    return this.paymentService.getHistory(userId);
  }
}
