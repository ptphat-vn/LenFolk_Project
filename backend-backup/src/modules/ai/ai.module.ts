import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { AiService } from './ai.service';
import { AiProcessor } from './ai.processor';
import {
  PracticeSession,
  PracticeSessionSchema,
} from '../practice/entities/practice-session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PracticeSession.name, schema: PracticeSessionSchema },
    ]),
    BullModule.registerQueue({ name: 'ai-practice' }),
  ],
  providers: [AiService, AiProcessor],
  exports: [AiService],
})
export class AiModule {}
