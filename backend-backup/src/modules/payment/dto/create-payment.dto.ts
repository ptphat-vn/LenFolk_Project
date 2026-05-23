import { IsMongoId, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../subscription/entities/user-subscription.entity';

export class CreatePaymentDto {
  @ApiProperty()
  @IsMongoId()
  planId: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false, description: 'Return URL after payment' })
  returnUrl?: string;
}
