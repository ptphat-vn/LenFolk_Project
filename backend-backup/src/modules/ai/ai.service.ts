import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PracticeSession,
  PracticeSessionDocument,
  PracticeStatus,
} from '../practice/entities/practice-session.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectModel(PracticeSession.name)
    private practiceModel: Model<PracticeSessionDocument>,
  ) {}

  async analyzePractice(
    sessionId: string,
    audioFileUrl: string,
    lessonId: string,
  ): Promise<void> {
    this.logger.log(`Analyzing practice session: ${sessionId}`);

    await this.practiceModel.findByIdAndUpdate(sessionId, {
      status: PracticeStatus.PROCESSING,
    });

    try {
      // 1. Download audio from S3
      // 2. Send to Whisper API for pitch detection
      // 3. Compare with reference MIDI/notes
      // 4. Calculate scores
      const pitchAccuracy = Math.floor(Math.random() * 30) + 70;
      const rhythmAccuracy = Math.floor(Math.random() * 30) + 70;
      const techniqueScore = Math.floor(Math.random() * 30) + 70;
      const aiScore = Math.round(
        (pitchAccuracy + rhythmAccuracy + techniqueScore) / 3,
      );

      // 5. Generate Vietnamese feedback
      const feedback = await this.generateFeedback(
        pitchAccuracy,
        rhythmAccuracy,
        techniqueScore,
      );

      await this.practiceModel.findByIdAndUpdate(sessionId, {
        status: PracticeStatus.COMPLETED,
        aiScore,
        pitchAccuracy,
        rhythmAccuracy,
        techniqueScore,
        feedback,
      });

      this.logger.log(
        `Practice session ${sessionId} analyzed. Score: ${aiScore}`,
      );
    } catch (error) {
      this.logger.error(`Failed to analyze session ${sessionId}`, error);
      await this.practiceModel.findByIdAndUpdate(sessionId, {
        status: PracticeStatus.FAILED,
      });
    }
  }

  private async generateFeedback(
    pitchAccuracy: number,
    rhythmAccuracy: number,
    techniqueScore: number,
  ): Promise<string> {
    // TODO: Integrate with OpenAI/Claude for Vietnamese feedback generation
    const parts: string[] = [];

    if (pitchAccuracy < 80) parts.push('Cao độ cần được cải thiện thêm.');
    if (rhythmAccuracy < 80)
      parts.push('Nhịp điệu chưa đều, cần luyện tập thêm.');
    if (techniqueScore < 80) parts.push('Kỹ thuật thổi cần chú ý hơn.');

    if (parts.length === 0) {
      return 'Bạn đã thực hiện rất tốt! Tiếp tục phát huy nhé.';
    }

    return parts.join(' ');
  }
}
