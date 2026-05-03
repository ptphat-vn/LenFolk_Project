import { IsMongoId, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/user-subscription.entity';

export class GrantSubscriptionDto {
  @ApiProperty()
  @IsMongoId()
  planId: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
