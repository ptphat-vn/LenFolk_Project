import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AiAnalyzeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  audioFileUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}
