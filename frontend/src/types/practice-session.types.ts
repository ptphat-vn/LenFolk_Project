export type PracticeSessionStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** Schema PracticeSession trả về từ API */
export interface PracticeSession {
  _id: string;
  userId: string;
  lessonId: string;
  audioFileUrl?: string;
  aiScore?: number;
  rhythmScore?: number;
  pitchScore?: number;
  accuracyScore?: number;
  aiFeedback?: string;
  referenceAudio?: string;
  duration?: number;       // giây
  status: PracticeSessionStatus;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để tạo phiên luyện tập (POST /practice-sessions)
 *  userId, aiScore, rhythmScore, pitchScore, accuracyScore, aiFeedback, status
 *  được server tự gán — gửi lên sẽ bị bỏ qua
 */
export interface CreatePracticeSessionInput {
  lessonId: string;
  audioFileUrl?: string;
  duration?: number;    // tối thiểu 0
  referenceAudio?: string;
}

/** Body dùng để cập nhật phiên luyện tập (PATCH /practice-sessions/:id)
 *  Chỉ được cập nhật: audioFileUrl, referenceAudio, duration
 *  Các trường AI bị server loại bỏ
 */
export interface UpdatePracticeSessionInput {
  audioFileUrl?: string;
  referenceAudio?: string;
  duration?: number;
}

/** Query params cho GET /practice-sessions */
export interface GetPracticeSessionsQuery {
  lessonId?: string;
  status?: PracticeSessionStatus;
}
