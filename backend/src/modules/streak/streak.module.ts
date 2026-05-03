import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StreakController } from './streak.controller';
import { StreakService } from './streak.service';
import { Streak, StreakSchema } from './entities/streak.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Streak.name, schema: StreakSchema }]),
  ],
  controllers: [StreakController],
  providers: [StreakService],
  exports: [StreakService],
})
export class StreakModule {}
