import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitPracticeDto {
  @ApiProperty()
  @IsMongoId()
  lessonId: string;

  @ApiProperty({ description: 'Audio file URL from S3 after upload' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  audioFileUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}
