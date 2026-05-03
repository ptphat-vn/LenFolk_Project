import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartLessonDto {
  @ApiProperty({ description: 'The course this lesson belongs to' })
  @IsMongoId()
  courseId: string;
}
