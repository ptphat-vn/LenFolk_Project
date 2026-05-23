import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CourseModule } from './modules/course/course.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { ProgressModule } from './modules/progress/progress.module';
import { PracticeModule } from './modules/practice/practice.module';
import { AiModule } from './modules/ai/ai.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PaymentModule } from './modules/payment/payment.module';
import { StreakModule } from './modules/streak/streak.module';
import { RevenueModule } from './modules/revenue/revenue.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { SupportModule } from './modules/support/support.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { ContentApprovalModule } from './modules/content-approval/content-approval.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, storageConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password'),
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    UserModule,
    AuthModule,
    CourseModule,
    LessonModule,
    ProgressModule,
    PracticeModule,
    AiModule,
    SubscriptionModule,
    PaymentModule,
    StreakModule,
    RevenueModule,
    NotificationModule,
    AdminModule,
    PromotionModule,
    SupportModule,
    LeaderboardModule,
    ContentApprovalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
