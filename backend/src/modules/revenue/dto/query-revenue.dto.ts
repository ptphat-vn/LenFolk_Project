import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RevenueGroupBy {
  DAY = 'day',
  MONTH = 'month',
  YEAR = 'year',
}

export class QueryRevenueDto {
  @ApiProperty({
    required: false,
    enum: RevenueGroupBy,
    default: RevenueGroupBy.DAY,
  })
  @IsOptional()
  @IsEnum(RevenueGroupBy)
  groupBy?: RevenueGroupBy = RevenueGroupBy.DAY;

  @ApiProperty({ required: false, description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
