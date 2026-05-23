import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MomoWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsString()
  requestId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  resultCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  transId: string;

  @ApiProperty()
  signature: string;
}
