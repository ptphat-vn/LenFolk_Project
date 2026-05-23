import { IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryProgressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  courseId?: string;
}
