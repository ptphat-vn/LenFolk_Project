import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiService } from './ai.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor('ai-practice')
export class AiProcessor extends WorkerHost {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly aiService: AiService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(
    job: Job<{
      sessionId: string;
      audioFileUrl: string;
      lessonId: string;
      userId: string;
    }>,
  ): Promise<void> {
    this.logger.log(`Processing job ${job.id}: ${job.name}`);

    const { sessionId, audioFileUrl, lessonId, userId } = job.data;

    await this.aiService.analyzePractice(sessionId, audioFileUrl, lessonId);

    // Emit event so socket gateway can notify the user
    this.eventEmitter.emit('practice.scored', { sessionId, userId });
  }
}
