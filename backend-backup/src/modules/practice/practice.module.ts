import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import {
  PracticeSession,
  PracticeSessionSchema,
} from './entities/practice-session.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PracticeSession.name, schema: PracticeSessionSchema },
    ]),
    BullModule.registerQueue({ name: 'ai-practice' }),
  ],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
