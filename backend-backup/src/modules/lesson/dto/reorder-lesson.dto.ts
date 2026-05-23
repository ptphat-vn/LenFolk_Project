import { IsNumber, IsArray, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReorderLessonDto {
  @ApiProperty({ type: [String], description: 'Ordered array of lesson IDs' })
  @IsArray()
  @IsMongoId({ each: true })
  orderedIds: string[];
}
