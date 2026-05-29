const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LenFolk API',
      version: '1.0.0',
      description:
        'RESTful API documentation for the LenFolk music learning platform.\n\n' +
        '**Roles:** `guest` (default on register) → `learner` (after subscription payment) → `instructor` / `moderator` / `admin` (assigned by admin).\n\n' +
        'All protected routes require a Bearer JWT token in the `Authorization` header.',
      contact: { name: 'LenFolk Team' },
    },
    servers: [
      { url: '/api', description: 'Default Server (relative)' },
      { url: 'https://lenfolk-project.onrender.com/api', description: 'Production Server' },
      { url: 'http://localhost:5000/api', description: 'Development Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        // ── Shared ──────────────────────────────────────────────────────
        PaginationMeta: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            results: { type: 'integer', example: 10 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            status: { type: 'string', example: 'fail' },
            message: { type: 'string', example: 'Error message description' },
          },
        },
        IdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
          description: 'MongoDB ObjectId',
        },

        // ── Auth ────────────────────────────────────────────────────────
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Nguyễn Văn A' },
            email: {
              type: 'string',
              format: 'email',
              example: 'nguyenvana@lenfolk.vn',
            },
            password: { type: 'string', minLength: 8, example: 'MatKhau@123' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'nguyenvana@lenfolk.vn',
            },
            password: { type: 'string', example: 'MatKhau@123' },
          },
        },
        RefreshTokenInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        AuthTokenResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'User registered successfully',
                },
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (1h)',
                },
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (7d)',
                },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },

        // ── User ────────────────────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            name: { type: 'string', example: 'Nguyễn Văn A' },
            email: {
              type: 'string',
              format: 'email',
              example: 'nguyenvana@lenfolk.vn',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              example: 'male',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date-time',
              example: '1995-10-15T00:00:00.000Z',
              nullable: true,
            },
            avatar: {
              type: 'string',
              example: 'https://cdn.lenfolk.vn/avatars/user_123.jpg',
              nullable: true,
            },
            phoneNumber: {
              type: 'string',
              example: '+84987654321',
              nullable: true,
            },
            role: {
              type: 'string',
              enum: ['admin', 'instructor', 'moderator', 'learner', 'guest'],
              example: 'guest',
            },
            currentSubscription: {
              type: 'string',
              nullable: true,
              example: '67b5ecb5d74b8c3b44b8b888',
              description:
                'ID của UserSubscription hiện tại (chứa startDate/endDate). Được set sau khi admin approve proof ảnh.',
            },
            isActive: { type: 'boolean', example: true },
            isVerified: { type: 'boolean', example: false },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2024-05-28T07:00:00.000Z',
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: null,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T10:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-05-28T07:00:00.000Z',
            },
          },
        },
        CreateUserInput: {
          type: 'object',
          required: ['name', 'email', 'passwordHash'],
          properties: {
            name: { type: 'string', example: 'Lê Thị B' },
            email: {
              type: 'string',
              format: 'email',
              example: 'lethib@lenfolk.vn',
            },
            passwordHash: {
              type: 'string',
              description: 'Plain password — will be hashed automatically',
              example: 'Password@123',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              example: 'female',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date-time',
              example: '1998-05-20T00:00:00.000Z',
            },
            role: {
              type: 'string',
              enum: ['admin', 'instructor', 'moderator', 'learner', 'guest'],
              example: 'instructor',
            },
            phoneNumber: { type: 'string', example: '+84912345678' },
          },
        },
        UpdateUserInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Lê Thị B (Updated)' },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              example: 'female',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date-time',
              example: '1998-05-20T00:00:00.000Z',
            },
            role: {
              type: 'string',
              enum: ['admin', 'instructor', 'moderator', 'learner', 'guest'],
              example: 'moderator',
            },
            phoneNumber: { type: 'string', example: '+84111222333' },
            isActive: { type: 'boolean', example: true },
          },
        },

        // ── Course ──────────────────────────────────────────────────────
        Course: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            instructorId: {
              type: 'string',
              example: '60d5dbf5d74b8c3b44b8b4c3',
            },
            title: { type: 'string', example: 'Guitar Cơ Bản Cho Người Mới' },
            description: {
              type: 'string',
              example: 'Hướng dẫn hợp âm và điệu rải guitar từ đầu.',
            },
            thumbnail: {
              type: 'string',
              example: 'https://cdn.lenfolk.vn/courses/guitar_101.jpg',
            },
            level: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              example: 'beginner',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              example: 'published',
            },
            courseType: {
              type: 'string',
              description:
                'Nhãn thể loại khóa học (free-text, không enum). Ví dụ: foundation, advanced, masterclass.',
              example: 'foundation',
            },
            isFree: {
              type: 'boolean',
              description:
                '`true` = khóa học miễn phí, không cần subscription. `false` = yêu cầu subscription active.',
              example: false,
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['guitar', 'cơ bản', 'âm nhạc'],
            },
            totalLessons: { type: 'integer', example: 12 },
            enrollCount: { type: 'integer', example: 1540 },
            isFeatured: { type: 'boolean', example: true },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-01T08:00:00.000Z',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCourseInput: {
          type: 'object',
          required: ['title', 'level'],
          description:
            '`instructorId` được inject tự động từ JWT token — không cần gửi lên.',
          properties: {
            instructorId: {
              type: 'string',
              readOnly: true,
              description: 'Server-injected from token. Ignored if sent.',
              example: '60d5dbf5d74b8c3b44b8b4c3',
            },
            title: { type: 'string', example: 'Piano Đệm Hát Nâng Cao' },
            description: {
              type: 'string',
              example: 'Tự tin đệm hát piano với các vòng hợp âm phức tạp.',
            },
            thumbnail: {
              type: 'string',
              example: 'https://cdn.lenfolk.vn/courses/piano_advanced.jpg',
            },
            level: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              example: 'advanced',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              example: 'draft',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['piano', 'đệm hát', 'nâng cao'],
            },
            isFree: { type: 'boolean', example: false },
            courseType: { type: 'string', example: 'foundation' },
            isFeatured: { type: 'boolean', example: false },
          },
        },

        // ── Lesson ──────────────────────────────────────────────────────
        Lesson: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            courseId: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            title: {
              type: 'string',
              example: 'Bài 1: Làm quen với cây đàn Guitar',
            },
            description: {
              type: 'string',
              example: 'Tư thế cầm đàn và gảy phím mở.',
            },
            videoUrl: {
              type: 'string',
              example: 'https://video.lenfolk.vn/lesson1.mp4',
            },
            audioUrl: {
              type: 'string',
              example: 'https://audio.lenfolk.vn/lesson1.mp3',
            },
            order: { type: 'integer', example: 1 },
            duration: { type: 'integer', description: 'Seconds', example: 450 },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'published',
            },
            isFree: { type: 'boolean', example: true },
            transcript: {
              type: 'string',
              example: 'Xin chào các bạn, hôm nay chúng ta sẽ...',
            },
            techniques: {
              type: 'array',
              items: { type: 'string' },
              example: ['Cầm đàn', 'Gảy phím'],
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateLessonInput: {
          type: 'object',
          required: ['courseId', 'title', 'order'],
          properties: {
            courseId: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            title: { type: 'string', example: 'Bài 2: Hợp âm Đô trưởng (C)' },
            description: {
              type: 'string',
              example: 'Cách bấm và chuyển hợp âm Đô trưởng.',
            },
            videoUrl: {
              type: 'string',
              example: 'https://video.lenfolk.vn/lesson2.mp4',
            },
            audioUrl: {
              type: 'string',
              example: 'https://audio.lenfolk.vn/lesson2.mp3',
            },
            order: { type: 'integer', minimum: 1, example: 2 },
            duration: { type: 'integer', minimum: 0, example: 600 },
            status: {
              type: 'string',
              enum: ['draft', 'published'],
              example: 'draft',
            },
            isFree: { type: 'boolean', example: false },
            transcript: {
              type: 'string',
              example: 'Hợp âm Đô trưởng là một trong những...',
            },
            techniques: {
              type: 'array',
              items: { type: 'string' },
              example: ['Hợp âm', 'Chuyển ngón'],
            },
          },
        },

        // ── InstructorProfile ───────────────────────────────────────────
        InstructorProfile: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '61a5ecb5d74b8c3b44b8b111' },
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            bio: {
              type: 'string',
              example: 'Nghệ sĩ Guitar với hơn 10 năm kinh nghiệm.',
            },
            expertise: {
              type: 'string',
              example: 'Acoustic Guitar, Fingerstyle',
            },
            websiteUrl: { type: 'string', example: 'https://guitar-master.vn' },
            totalStudents: { type: 'integer', example: 5200 },
            totalCourses: { type: 'integer', example: 5 },
            rating: { type: 'number', example: 4.8 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateInstructorProfileInput: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            bio: {
              type: 'string',
              example: 'Chuyên gia Piano cổ điển với 8 năm kinh nghiệm.',
            },
            expertise: {
              type: 'string',
              example: 'Classical Piano, Jazz Piano',
            },
            websiteUrl: { type: 'string', example: 'https://mypiano.com' },
          },
        },

        // ── Badge ───────────────────────────────────────────────────────
        Badge: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '62b5ecb5d74b8c3b44b8b222' },
            name: { type: 'string', example: 'Chiến Binh Chăm Chỉ' },
            icon: { type: 'string', example: '🔥' },
            description: {
              type: 'string',
              example: 'Học liên tục 7 ngày không nghỉ.',
            },
            type: {
              type: 'string',
              enum: ['streak', 'completion', 'practice', 'achievement'],
              example: 'streak',
            },
            conditionKey: { type: 'string', example: 'streak_days' },
            conditionValue: { type: 'number', example: 7 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateBadgeInput: {
          type: 'object',
          required: ['name', 'icon', 'type', 'conditionKey', 'conditionValue'],
          properties: {
            name: { type: 'string', example: 'Vua Thực Hành' },
            icon: { type: 'string', example: '🎸' },
            description: {
              type: 'string',
              example: 'Hoàn thành 100 bài luyện tập.',
            },
            type: {
              type: 'string',
              enum: ['streak', 'completion', 'practice', 'achievement'],
              example: 'practice',
            },
            conditionKey: {
              type: 'string',
              example: 'practice_sessions_completed',
            },
            conditionValue: { type: 'number', minimum: 0, example: 100 },
            isActive: { type: 'boolean', example: true },
          },
        },

        // ── Notification ─────────────────────────────────────────────────
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '63a1bcf5d74b8c3b44b8b100' },
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            title: { type: 'string', example: 'Bạn có bài học mới!' },
            body: {
              type: 'string',
              example:
                'Bài học "Hợp âm Sol trưởng" vừa được thêm vào khóa học của bạn.',
            },
            type: {
              type: 'string',
              enum: [
                'lesson',
                'badge',
                'subscription',
                'streak',
                'moderation',
                'system',
              ],
              example: 'lesson',
            },
            isRead: { type: 'boolean', example: false },
            data: {
              type: 'object',
              example: { lessonId: '60e5dbf5d74b8c3b44b8b999' },
            },
            readAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: null,
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateNotificationInput: {
          type: 'object',
          required: ['userId', 'title', 'body', 'type'],
          properties: {
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            title: { type: 'string', example: 'Streak 7 ngày!' },
            body: {
              type: 'string',
              example:
                'Chúc mừng bạn đã học liên tục 7 ngày. Nhận huy hiệu ngay!',
            },
            type: {
              type: 'string',
              enum: [
                'lesson',
                'badge',
                'subscription',
                'streak',
                'moderation',
                'system',
              ],
              example: 'streak',
            },
            isRead: { type: 'boolean', example: false },
            data: {
              type: 'object',
              example: { badgeId: '62b5ecb5d74b8c3b44b8b222' },
            },
          },
        },

        // ── Progress ────────────────────────────────────────────────────
        Progress: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '63c5ecb5d74b8c3b44b8b333' },
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            courseId: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            lessonId: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            status: {
              type: 'string',
              enum: ['not_started', 'in_progress', 'completed'],
              example: 'completed',
            },
            watchedSeconds: { type: 'integer', example: 450 },
            completionPercent: { type: 'number', example: 100 },
            bestPracticeScore: { type: 'number', example: 95.5 },
            attemptCount: { type: 'integer', example: 2 },
            lastAccessedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-05-27T14:30:00.000Z',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-05-27T15:00:00.000Z',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateProgressInput: {
          type: 'object',
          required: ['courseId', 'lessonId'],
          description:
            '`userId` được inject từ JWT token trên server — không cần gửi.',
          properties: {
            courseId: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            lessonId: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            status: {
              type: 'string',
              enum: ['not_started', 'in_progress', 'completed'],
              example: 'in_progress',
            },
            watchedSeconds: { type: 'integer', minimum: 0, example: 120 },
            completionPercent: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 26.7,
            },
          },
        },

        // ── PracticeSession ─────────────────────────────────────────────
        PracticeSession: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64d5ecb5d74b8c3b44b8b444' },
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            lessonId: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            audioFileUrl: {
              type: 'string',
              example: 'https://user-audio.lenfolk.vn/practice_001.wav',
            },
            aiScore: { type: 'number', example: 88.0 },
            rhythmScore: { type: 'number', example: 90.0 },
            pitchScore: { type: 'number', example: 85.5 },
            accuracyScore: { type: 'number', example: 88.5 },
            aiFeedback: {
              type: 'string',
              example: 'Nhịp rất tốt! Chú ý nốt Mi bị chênh phô nhẹ ở phách 3.',
            },
            referenceAudio: {
              type: 'string',
              example: 'https://audio.lenfolk.vn/lesson1_ref.mp3',
            },
            duration: { type: 'integer', description: 'seconds', example: 60 },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed'],
              example: 'completed',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePracticeSessionInput: {
          type: 'object',
          required: ['lessonId'],
          description:
            'Các trường `userId`, `aiScore`, `rhythmScore`, `pitchScore`, `accuracyScore`, `aiFeedback`, `status` được server tự điền — gửi lên sẽ bị bỏ qua.',
          properties: {
            lessonId: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            audioFileUrl: {
              type: 'string',
              example: 'https://user-audio.lenfolk.vn/practice_001.wav',
            },
            duration: { type: 'integer', minimum: 0, example: 60 },
            referenceAudio: {
              type: 'string',
              example: 'https://audio.lenfolk.vn/lesson1_ref.mp3',
            },
          },
        },

        // ── Streak ──────────────────────────────────────────────────────
        Streak: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65e5ecb5d74b8c3b44b8b555' },
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            currentStreak: { type: 'integer', example: 12 },
            longestStreak: { type: 'integer', example: 45 },
            totalActiveDays: { type: 'integer', example: 120 },
            lastActiveDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-05-28T08:00:00.000Z',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateStreakInput: {
          type: 'object',
          description:
            '`userId` được inject tự động từ JWT token — không cần gửi lên.',
          properties: {
            userId: {
              type: 'string',
              readOnly: true,
              description: 'Server-injected from token. Ignored if sent.',
              example: '60d5dbf5d74b8c3b44b8b4c3',
            },
            currentStreak: { type: 'integer', minimum: 0, example: 1 },
            longestStreak: { type: 'integer', minimum: 0, example: 1 },
            totalActiveDays: { type: 'integer', minimum: 0, example: 1 },
            lastActiveDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-05-28T00:00:00.000Z',
            },
          },
        },

        // ── Subscription ────────────────────────────────────────────────
        Subscription: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f5ecb5d74b8c3b44b8b666' },
            name: { type: 'string', example: 'LenFolk Pro - Monthly' },
            description: {
              type: 'string',
              example:
                'Mở khóa toàn bộ khóa học và AI feedback không giới hạn.',
            },
            courseId: {
              type: 'string',
              example: '60d5ecb5d74b8c3b44b8b4d4',
              description: 'Khóa học được mở khóa khi mua gói này.',
            },
            price: { type: 'number', example: 199000 },
            currency: { type: 'string', enum: ['VND', 'USD'], example: 'VND' },
            billingCycle: {
              type: 'string',
              enum: ['monthly', 'quarterly', 'yearly'],
              example: 'monthly',
            },
            features: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'Mở khóa toàn bộ khoá học',
                'AI Feedback',
                'Không quảng cáo',
              ],
            },
            qrCodeUrl: {
              type: 'string',
              nullable: true,
              example: 'https://cdn.lenfolk.vn/qr/sub_001.png',
              description: 'QR code để user quét chuyển khoản.',
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateSubscriptionInput: {
          type: 'object',
          required: ['name', 'courseId', 'price', 'billingCycle'],
          properties: {
            name: { type: 'string', example: 'LenFolk Pro - Yearly' },
            courseId: {
              type: 'string',
              example: '60d5ecb5d74b8c3b44b8b4d4',
              description:
                'ID khóa học sẽ được mở khóa. Khóa học phải tồn tại và không được là `isFree: true`.',
            },
            description: {
              type: 'string',
              example: 'Gói năm — tiết kiệm 30%.',
            },
            price: { type: 'number', minimum: 0, example: 1690000 },
            currency: { type: 'string', enum: ['VND', 'USD'], example: 'VND' },
            billingCycle: {
              type: 'string',
              enum: ['monthly', 'quarterly', 'yearly'],
              example: 'yearly',
            },
            features: {
              type: 'array',
              items: { type: 'string' },
              example: ['Tất cả quyền lợi Pro', 'Hỗ trợ ưu tiên 1-1'],
            },
            qrCodeUrl: {
              type: 'string',
              example: 'https://cdn.lenfolk.vn/qr/sub_001.png',
              description: 'URL ảnh QR code chuyển khoản.',
            },
            isActive: { type: 'boolean', example: true },
          },
        },
        // ── UserSubscription ────────────────────────────────────────────
        UserSubscription: {
          type: 'object',
          description:
            'Bản ghi subscription của từng user (tách biệt với Subscription plan template).',
          properties: {
            _id: { type: 'string', example: '67b5ecb5d74b8c3b44b8b888' },
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            subscriptionId: {
              type: 'string',
              example: '66f5ecb5d74b8c3b44b8b666',
              description: 'Ref tới Subscription plan',
            },
            status: {
              type: 'string',
              enum: ['pending', 'trial', 'active', 'expired', 'cancelled'],
              example: 'pending',
              description:
                '`pending` ngay sau khi tạo yêu cầu. Chuyển `active` sau khi admin phê duyệt ảnh chứng minh chuyển khoản.',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-05-28T07:30:00.000Z',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              example: '2024-06-28T07:30:00.000Z',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RequestSubscriptionResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example:
                    'Yêu cầu mua gói đã được tạo. Vui lòng quét QR và upload ảnh chứng minh.',
                },
                transactionRecordId: {
                  type: 'string',
                  example: '67a5ecb5d74b8c3b44b8b777',
                },
                userSubscriptionId: {
                  type: 'string',
                  example: '67b5ecb5d74b8c3b44b8b888',
                  description:
                    'ID của UserSubscription vừa tạo — status `pending` cho đến khi admin approve.',
                },
                qrCodeUrl: {
                  type: 'string',
                  nullable: true,
                  example: 'https://cdn.lenfolk.vn/qr/sub_001.png',
                  description: 'QR code chuyển khoản từ subscription plan.',
                },
              },
            },
          },
        },

        // ── TransactionRecord ────────────────────────────────────────────
        TransactionRecord: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67a5ecb5d74b8c3b44b8b777' },
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            userSubscriptionId: {
              type: 'string',
              example: '67b5ecb5d74b8c3b44b8b888',
            },
            amount: { type: 'number', example: 199000 },
            currency: { type: 'string', enum: ['VND', 'USD'], example: 'VND' },
            paymentMethod: { type: 'string', example: 'qr_manual' },
            gatewayTxId: { type: 'string', example: '240528_823741' },
            status: {
              type: 'string',
              enum: ['pending', 'reviewing', 'success', 'failed', 'refunded'],
              example: 'success',
            },
            gatewayProvider: { type: 'string', example: 'qr_manual' },
            paidAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-05-28T07:30:00.000Z',
            },
            proofImageUrl: {
              type: 'string',
              nullable: true,
              example:
                'https://res.cloudinary.com/lenfolk/image/upload/lenfolk/payment-proofs/proof_123.jpg',
              description: 'Ảnh chứng minh chuyển khoản do user upload.',
            },
            reviewedBy: {
              type: 'string',
              nullable: true,
              example: '60d5dbf5d74b8c3b44b8b4c3',
              description: 'Admin ID đã duyệt/từ chối.',
            },
            reviewedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2024-05-28T09:00:00.000Z',
            },
            rejectReason: {
              type: 'string',
              nullable: true,
              example: 'Ảnh không rõ ràng, không thấy số tài khoản.',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Permission ──────────────────────────────────────────────────
        Permission: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '68a1ecb5d74b8c3b44b8b999' },
            action: { type: 'string', example: 'delete' },
            resource: { type: 'string', example: 'comment' },
            description: {
              type: 'string',
              example: 'Cho phép xóa bình luận vi phạm.',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePermissionInput: {
          type: 'object',
          required: ['action', 'resource'],
          properties: {
            action: { type: 'string', example: 'ban' },
            resource: { type: 'string', example: 'user' },
            description: {
              type: 'string',
              example: 'Cho phép cấm người dùng.',
            },
          },
        },

        // ── AuditLog ────────────────────────────────────────────────────
        AuditLog: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '69b1ecb5d74b8c3b44b8baaa' },
            actorId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            actorRole: {
              type: 'string',
              enum: ['admin', 'instructor', 'moderator', 'learner', 'guest'],
              example: 'admin',
            },
            action: { type: 'string', example: 'DELETE_USER' },
            resource: { type: 'string', example: 'User' },
            resourceId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c4' },
            before: { type: 'object', example: { isActive: true } },
            after: {
              type: 'object',
              example: { deletedAt: '2024-05-28T07:00:00.000Z' },
            },
            ipAddress: { type: 'string', example: '192.168.1.100' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateAuditLogInput: {
          type: 'object',
          required: ['actorId', 'actorRole', 'action', 'resource'],
          properties: {
            actorId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            actorRole: {
              type: 'string',
              enum: ['admin', 'instructor', 'moderator', 'learner', 'guest'],
              example: 'admin',
            },
            action: { type: 'string', example: 'UPDATE_USER_ROLE' },
            resource: { type: 'string', example: 'User' },
            resourceId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c5' },
            before: { type: 'object', example: { role: 'guest' } },
            after: { type: 'object', example: { role: 'instructor' } },
            ipAddress: { type: 'string', example: '10.0.0.1' },
          },
        },

        // ── ModeratorLog ─────────────────────────────────────────────────
        ModeratorLog: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '70c1ecb5d74b8c3b44b8bbbb' },
            moderatorId: {
              type: 'string',
              example: '60d5dbf5d74b8c3b44b8b4c6',
            },
            action: {
              type: 'string',
              enum: [
                'approve_comment',
                'delete_comment',
                'warn_user',
                'ban_user',
                'unban_user',
                'resolve_report',
                'dismiss_report',
              ],
              example: 'ban_user',
            },
            targetType: {
              type: 'string',
              enum: ['user', 'comment', 'report', 'course', 'lesson'],
              example: 'user',
            },
            targetId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c7' },
            reason: {
              type: 'string',
              example: 'Vi phạm điều khoản: đăng nội dung xấu.',
            },
            note: { type: 'string', example: 'Đã cảnh báo 2 lần trước đó.' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateModeratorLogInput: {
          type: 'object',
          required: ['moderatorId', 'action', 'targetType', 'targetId'],
          properties: {
            moderatorId: {
              type: 'string',
              example: '60d5dbf5d74b8c3b44b8b4c6',
            },
            action: {
              type: 'string',
              enum: [
                'approve_comment',
                'delete_comment',
                'warn_user',
                'ban_user',
                'unban_user',
                'resolve_report',
                'dismiss_report',
              ],
              example: 'warn_user',
            },
            targetType: {
              type: 'string',
              enum: ['user', 'comment', 'report', 'course', 'lesson'],
              example: 'user',
            },
            targetId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c7' },
            reason: {
              type: 'string',
              example: 'Ngôn ngữ không phù hợp trong bình luận.',
            },
            note: { type: 'string', example: 'Lần cảnh báo đầu tiên.' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: '🔑 Xác thực — Đăng ký, Đăng nhập, Refresh Token',
      },
      { name: 'Users', description: '👤 Quản lý User — Admin only (CRUD)' },
      {
        name: 'Courses',
        description:
          '📚 Quản lý Khóa học — Public xem, Instructor/Admin tạo/sửa',
      },
      {
        name: 'Lessons',
        description: '📖 Quản lý Bài học — Yêu cầu đăng nhập',
      },
      { name: 'InstructorProfiles', description: '🧑‍🏫 Hồ sơ Giảng viên' },
      {
        name: 'Badges',
        description: '🏅 Huy hiệu — Public xem, Admin quản lý',
      },
      {
        name: 'Notifications',
        description: '🔔 Thông báo — Yêu cầu đăng nhập',
      },
      {
        name: 'Progress',
        description: '📊 Tiến độ học tập — Yêu cầu đăng nhập',
      },
      {
        name: 'PracticeSessions',
        description: '🎯 Phiên luyện tập — Yêu cầu đăng nhập',
      },
      { name: 'Streaks', description: '🔥 Streak học tập — Yêu cầu đăng nhập' },
      {
        name: 'Subscriptions',
        description:
          '💳 Gói đăng ký — Public xem, Admin tạo, User gửi yêu cầu mua (QR + proof upload)',
      },
      {
        name: 'TransactionRecords',
        description: '🧾 Lịch sử giao dịch — Upload proof, Admin duyệt/từ chối',
      },
      { name: 'Permissions', description: '🔒 Phân quyền — Admin only' },
      { name: 'AuditLogs', description: '📝 Nhật ký hành động — Admin only' },
      { name: 'ModeratorLogs', description: '🛡️ Nhật ký kiểm duyệt' },
    ],
    paths: {
      // ─── AUTH ───────────────────────────────────────────────────────────
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Đăng ký tài khoản mới',
          description:
            'Tạo tài khoản mới với role mặc định là `guest`. Trường `role` bị bỏ qua hoàn toàn dù có gửi lên.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Đăng ký thành công',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthTokenResponse' },
                },
              },
            },
            400: {
              description: 'Email đã tồn tại hoặc validation thất bại',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    status: 'fail',
                    message: 'Email already in use',
                  },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Đăng nhập',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginInput' },
              },
            },
          },
          responses: {
            200: {
              description:
                'Đăng nhập thành công — trả về accessToken và refreshToken',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthTokenResponse' },
                },
              },
            },
            401: {
              description:
                'Sai email/mật khẩu hoặc tài khoản bị vô hiệu hóa (`isActive: false`)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  examples: {
                    invalidCredentials: {
                      summary: 'Sai thông tin đăng nhập',
                      value: {
                        success: false,
                        status: 'fail',
                        message: 'Invalid email or password',
                      },
                    },
                    deactivated: {
                      summary: 'Tài khoản bị khóa',
                      value: { message: 'Account is deactivated' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation thất bại',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/refresh-token': {
        post: {
          tags: ['Auth'],
          summary: 'Lấy access token mới từ refresh token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RefreshTokenInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Token mới được cấp',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          message: {
                            type: 'string',
                            example: 'Token refreshed successfully',
                          },
                          accessToken: {
                            type: 'string',
                            example: 'eyJhbGciOi...',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description:
                'Refresh token không hợp lệ, hết hạn, hoặc không khớp DB (đã logout)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    success: false,
                    status: 'fail',
                    message: 'Invalid or expired refresh token',
                  },
                },
              },
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Đăng xuất — vô hiệu hóa refresh token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RefreshTokenInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Đăng xuất thành công',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Logout successful' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Refresh token không hợp lệ',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ─── USERS ──────────────────────────────────────────────────────────
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'Lấy danh sách tất cả user — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              example: 1,
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 100 },
              example: 20,
            },
            {
              name: 'sort',
              in: 'query',
              schema: { type: 'string' },
              example: '-createdAt',
            },
            {
              name: 'role',
              in: 'query',
              schema: { type: 'string' },
              example: 'learner',
              description: 'Lọc theo role',
            },
          ],
          responses: {
            200: {
              description: 'Danh sách user',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/User' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: {
              description: 'Chưa đăng nhập',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { message: 'No token provided' },
                },
              },
            },
            403: {
              description: 'Không có quyền Admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { message: 'Access denied' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Tạo user mới (Admin tạo thủ công, có thể chỉ định role)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUserInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'User được tạo thành công',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation thất bại',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Không có quyền Admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Lấy thông tin user theo ID — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            },
          ],
          responses: {
            200: {
              description: 'Thông tin user',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'User không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { message: 'No document found with that ID' },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Users'],
          summary:
            'Cập nhật thông tin user — Admin only (hỗ trợ upload avatar)',
          description:
            'Trường `passwordHash` và `password` trong body sẽ bị bỏ qua hoàn toàn để tránh bypass bcrypt hook. Để đổi mật khẩu, dùng endpoint thay đổi mật khẩu riêng.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Lê Thị B (Updated)' },
                    gender: {
                      type: 'string',
                      enum: ['male', 'female', 'other'],
                      example: 'female',
                    },
                    role: {
                      type: 'string',
                      enum: [
                        'admin',
                        'instructor',
                        'moderator',
                        'learner',
                        'guest',
                      ],
                      example: 'instructor',
                    },
                    phoneNumber: { type: 'string', example: '+84111222333' },
                    avatar: {
                      type: 'string',
                      format: 'binary',
                      description: 'File ảnh đại diện (png, jpg, webp)',
                    },
                    isActive: { type: 'boolean', example: true },
                  },
                },
              },
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateUserInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'User được cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'User không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Users'],
          summary:
            'Soft-delete user — Admin only (đặt deletedAt, không xóa khỏi DB)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            },
          ],
          responses: {
            204: { description: 'Đã soft-delete (không trả về dữ liệu)' },
            404: {
              description: 'User không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ─── COURSES ────────────────────────────────────────────────────────
      '/courses': {
        get: {
          tags: ['Courses'],
          summary: 'Lấy danh sách khóa học — Public',
          description:
            'Mặc định chỉ trả về khóa học `status: published`. Admin và Instructor (có token) có thể lọc theo `status` bất kỳ.',
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 100 },
            },
            {
              name: 'level',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['beginner', 'intermediate', 'advanced'],
              },
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['draft', 'published', 'archived'],
              },
              example: 'published',
              description:
                'Chỉ có hiệu lực khi gọi với token Admin hoặc Instructor. Guest/Learner luôn nhận `published`.',
            },
          ],
          responses: {
            200: {
              description: 'Danh sách khóa học',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Course' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Courses'],
          summary: 'Tạo khóa học mới — Instructor hoặc Admin',
          description:
            '`instructorId` được inject từ JWT token — không cần (và không nên) gửi lên. Nếu gửi, giá trị sẽ bị ghi đè bởi `req.user._id`.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateCourseInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Khóa học được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Course' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation thất bại',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message: 'Validation Failed: body.title: Required',
                  },
                },
              },
            },
            403: {
              description: 'Chỉ Instructor hoặc Admin mới được tạo khóa học',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message: 'Access denied. Instructor or Admin required.',
                  },
                },
              },
            },
          },
        },
      },
      '/courses/{id}': {
        get: {
          tags: ['Courses'],
          summary: 'Lấy chi tiết khóa học — Public',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết khóa học',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Course' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Khóa học không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Courses'],
          summary: 'Cập nhật khóa học — Instructor hoặc Admin',
          description:
            'Instructor chỉ được sửa khóa học của chính mình (`instructorId === req.user._id`). Admin không bị giới hạn.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateCourseInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Khóa học được cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Course' },
                    },
                  },
                },
              },
            },
            403: {
              description: 'Instructor cố sửa khóa học của người khác',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message: 'You do not have permission to update this course',
                  },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Courses'],
          summary: 'Xóa khóa học — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            },
          ],
          responses: {
            204: { description: 'Đã xóa' },
            403: {
              description: 'Không có quyền Admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ─── LESSONS ────────────────────────────────────────────────────────
      '/lessons': {
        get: {
          tags: ['Lessons'],
          summary: 'Lấy danh sách bài học — Cần đăng nhập',
          description:
            'Mặc định chỉ trả về bài học `status: published`. Admin và Instructor có thể xem cả `draft`. Kết quả được sắp xếp theo `order` tăng dần.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'courseId',
              in: 'query',
              schema: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
              description: 'Lọc bài học theo khóa học',
            },
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 100 },
            },
          ],
          responses: {
            200: {
              description: 'Danh sách bài học',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Lesson' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            401: {
              description: 'Chưa đăng nhập',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Lessons'],
          summary: 'Tạo bài học mới — Instructor hoặc Admin',
          description:
            'Instructor chỉ được tạo bài học cho khóa học của chính mình (`course.instructorId === req.user._id`). Sau khi tạo, `Course.totalLessons` được tự động tăng thêm 1.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateLessonInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Bài học được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Lesson' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validation thất bại hoặc courseId không tồn tại',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            401: {
              description: 'Chưa đăng nhập',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description:
                'Instructor cố thêm bài học vào khóa học của người khác',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message:
                      'You do not have permission to add lessons to this course',
                  },
                },
              },
            },
          },
        },
      },
      '/lessons/{id}': {
        get: {
          tags: ['Lessons'],
          summary: 'Lấy chi tiết bài học — Cần đăng nhập',
          description:
            'Nếu `isFree: false`, user phải có UserSubscription `status: active` và `endDate > now`. Ngược lại trả 403.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết bài học',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Lesson' },
                    },
                  },
                },
              },
            },
            403: {
              description: 'Bài học trả phí — không có subscription active',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message: 'This lesson requires an active subscription',
                  },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Lessons'],
          summary: 'Cập nhật bài học — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateLessonInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Bài học được cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Lesson' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Lessons'],
          summary: 'Xóa bài học — Admin only',
          description:
            'Sau khi xóa, `Course.totalLessons` trên khóa học cha được tự động giảm đi 1.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            },
          ],
          responses: {
            204: {
              description:
                'Đã xóa (totalLessons trên Course được giảm tự động)',
            },
            403: {
              description: 'Không có quyền Admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ─── INSTRUCTOR PROFILES ─────────────────────────────────────────────
      '/instructor-profiles': {
        get: {
          tags: ['InstructorProfiles'],
          summary: 'Lấy danh sách hồ sơ giảng viên — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'userId',
              in: 'query',
              schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
              description: 'Lọc theo userId',
            },
          ],
          responses: {
            200: {
              description: 'Danh sách hồ sơ giảng viên',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/InstructorProfile',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['InstructorProfiles'],
          summary: 'Tạo hồ sơ giảng viên — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateInstructorProfileInput',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Hồ sơ được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/InstructorProfile' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/instructor-profiles/{id}': {
        get: {
          tags: ['InstructorProfiles'],
          summary: 'Lấy chi tiết hồ sơ giảng viên — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '61a5ecb5d74b8c3b44b8b111' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết hồ sơ',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/InstructorProfile' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        patch: {
          tags: ['InstructorProfiles'],
          summary: 'Cập nhật hồ sơ giảng viên — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '61a5ecb5d74b8c3b44b8b111' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateInstructorProfileInput',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Đã cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/InstructorProfile' },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['InstructorProfiles'],
          summary: 'Xóa hồ sơ giảng viên — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '61a5ecb5d74b8c3b44b8b111' },
            },
          ],
          responses: {
            204: { description: 'Đã xóa' },
            403: {
              description: 'Không có quyền Admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ─── BADGES ─────────────────────────────────────────────────────────
      '/badges': {
        get: {
          tags: ['Badges'],
          summary: 'Lấy danh sách badge — Public',
          responses: {
            200: {
              description: 'Danh sách badge',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Badge' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Badges'],
          summary: 'Tạo badge mới — Admin only',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateBadgeInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Badge được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Badge' },
                    },
                  },
                },
              },
            },
            403: {
              description: 'Không có quyền Admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/badges/{id}': {
        get: {
          tags: ['Badges'],
          summary: 'Lấy chi tiết badge — Public',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '62b5ecb5d74b8c3b44b8b222' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết badge',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Badge' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Badges'],
          summary: 'Cập nhật badge — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '62b5ecb5d74b8c3b44b8b222' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateBadgeInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Đã cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Badge' },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Badges'],
          summary: 'Xóa badge — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '62b5ecb5d74b8c3b44b8b222' },
            },
          ],
          responses: { 204: { description: 'Đã xóa' } },
        },
      },

      // ─── NOTIFICATIONS ───────────────────────────────────────────────────
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Lấy danh sách thông báo — Cần đăng nhập',
          description:
            'Chỉ trả về thông báo của user đang đăng nhập (`userId` tự lấy từ token). Query param `userId` không được hỗ trợ và sẽ bị bỏ qua.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'isRead',
              in: 'query',
              schema: { type: 'boolean', example: false },
              description: 'Lọc thông báo chưa đọc',
            },
          ],
          responses: {
            200: {
              description: 'Danh sách thông báo',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/Notification',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Notifications'],
          summary: 'Gửi thông báo — Admin only',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateNotificationInput',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Thông báo được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Notification' },
                    },
                  },
                },
              },
            },
            403: {
              description: 'Không có quyền Admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/notifications/{id}': {
        get: {
          tags: ['Notifications'],
          summary: 'Lấy chi tiết thông báo — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '63a1bcf5d74b8c3b44b8b100' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết thông báo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Notification' },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Notifications'],
          summary: 'Đánh dấu đã đọc / cập nhật thông báo — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '63a1bcf5d74b8c3b44b8b100' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    isRead: { type: 'boolean', example: true },
                    readAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-05-28T08:30:00.000Z',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Thông báo được cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Notification' },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Notifications'],
          summary: 'Xóa thông báo — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '63a1bcf5d74b8c3b44b8b100' },
            },
          ],
          responses: { 204: { description: 'Đã xóa' } },
        },
      },

      // ─── PROGRESS ───────────────────────────────────────────────────────
      '/progress': {
        get: {
          tags: ['Progress'],
          summary: 'Lấy danh sách tiến độ học tập — Cần đăng nhập',
          description:
            'Chỉ trả về tiến độ của user đang đăng nhập (`userId` tự lấy từ token). Query param `userId` không được hỗ trợ.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'courseId',
              in: 'query',
              schema: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['not_started', 'in_progress', 'completed'],
              },
            },
          ],
          responses: {
            200: {
              description: 'Danh sách tiến độ',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Progress' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Progress'],
          summary: 'Ghi nhận/tạo mới tiến độ — Cần đăng nhập',
          description:
            '`userId` được tự gán từ token — không cần (và không nên) gửi lên.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateProgressInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Tiến độ được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Progress' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/progress/{id}': {
        get: {
          tags: ['Progress'],
          summary: 'Lấy chi tiết tiến độ — Cần đăng nhập (chỉ record của mình)',
          description:
            'Trả 403 nếu cố truy cập record của user khác (trừ Admin).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '63c5ecb5d74b8c3b44b8b333' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết tiến độ',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Progress' },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Progress'],
          summary: 'Cập nhật tiến độ — Cần đăng nhập (chỉ record của mình)',
          description:
            'Trả 403 nếu cố sửa record của user khác (trừ Admin). Trường `userId` trong body bị bỏ qua.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '63c5ecb5d74b8c3b44b8b333' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['not_started', 'in_progress', 'completed'],
                      example: 'completed',
                    },
                    watchedSeconds: { type: 'integer', example: 450 },
                    completionPercent: { type: 'number', example: 100 },
                    completedAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-05-28T09:00:00.000Z',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Tiến độ được cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Progress' },
                    },
                  },
                },
              },
            },
            403: {
              description: 'Cố sửa record của user khác',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message: 'You do not have permission to update this record',
                  },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Progress'],
          summary: 'Xóa bản ghi tiến độ — Cần đăng nhập (chỉ record của mình)',
          description: 'Trả 403 nếu cố xóa record của user khác (trừ Admin).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '63c5ecb5d74b8c3b44b8b333' },
            },
          ],
          responses: {
            204: { description: 'Đã xóa' },
            403: {
              description: 'Cố xóa record của user khác',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message: 'You do not have permission to delete this record',
                  },
                },
              },
            },
          },
        },
      },

      // ─── PRACTICE SESSIONS ───────────────────────────────────────────────
      '/practice-sessions': {
        get: {
          tags: ['PracticeSessions'],
          summary: 'Lấy danh sách phiên luyện tập — Cần đăng nhập',
          description:
            'Chỉ trả về phiên của user đang đăng nhập. Query param `userId` không được hỗ trợ.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'lessonId',
              in: 'query',
              schema: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['pending', 'processing', 'completed', 'failed'],
              },
            },
          ],
          responses: {
            200: {
              description: 'Danh sách phiên luyện tập',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/PracticeSession',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['PracticeSessions'],
          summary: 'Bắt đầu phiên luyện tập mới — Cần đăng nhập',
          description:
            '`userId`, `aiScore`, `rhythmScore`, `pitchScore`, `accuracyScore`, `aiFeedback`, `status` được server tự gán — gửi lên sẽ bị bỏ qua. `status` luôn khởi tạo là `pending`.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreatePracticeSessionInput',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Phiên luyện tập được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/PracticeSession' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/practice-sessions/{id}': {
        get: {
          tags: ['PracticeSessions'],
          summary:
            'Lấy chi tiết phiên luyện tập — Cần đăng nhập (chỉ session của mình)',
          description:
            'Trả 403 nếu cố truy cập session của user khác (trừ Admin).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '64d5ecb5d74b8c3b44b8b444' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết phiên luyện tập',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/PracticeSession' },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          tags: ['PracticeSessions'],
          summary:
            'Cập nhật phiên luyện tập — Cần đăng nhập (chỉ session của mình)',
          description:
            'Chỉ được cập nhật các trường `audioFileUrl`, `referenceAudio`, `duration`. ' +
            'Các trường AI (`aiScore`, `rhythmScore`, `pitchScore`, `accuracyScore`, `aiFeedback`, `status`) bị server loại bỏ hoàn toàn — phải do AI service cập nhật trực tiếp vào DB. ' +
            'Trả 403 nếu cố sửa session của user khác (trừ Admin).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '64d5ecb5d74b8c3b44b8b444' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    audioFileUrl: {
                      type: 'string',
                      example:
                        'https://user-audio.lenfolk.vn/practice_updated.wav',
                    },
                    referenceAudio: {
                      type: 'string',
                      example: 'https://audio.lenfolk.vn/lesson1_ref.mp3',
                    },
                    duration: { type: 'integer', minimum: 0, example: 75 },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Đã cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/PracticeSession' },
                    },
                  },
                },
              },
            },
            403: {
              description: 'Cố sửa session của user khác',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message:
                      'You do not have permission to update this session',
                  },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['PracticeSessions'],
          summary: 'Xóa phiên luyện tập — Cần đăng nhập (chỉ session của mình)',
          description: 'Trả 403 nếu cố xóa session của user khác (trừ Admin).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '64d5ecb5d74b8c3b44b8b444' },
            },
          ],
          responses: {
            204: { description: 'Đã xóa' },
            403: {
              description: 'Cố xóa session của user khác',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message:
                      'You do not have permission to delete this session',
                  },
                },
              },
            },
          },
        },
      },

      // ─── STREAKS ────────────────────────────────────────────────────────
      '/streaks': {
        get: {
          tags: ['Streaks'],
          summary: 'Lấy streak của user — Cần đăng nhập',
          description:
            'Chỉ trả về streak của user đang đăng nhập (`userId` tự lấy từ token). Query param `userId` không được hỗ trợ.',
          security: [{ bearerAuth: [] }],
          parameters: [],
          responses: {
            200: {
              description: 'Streak data',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Streak' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Streaks'],
          summary: 'Khởi tạo streak cho user — Cần đăng nhập',
          description:
            '`userId` được inject từ JWT token — không cần (và không nên) gửi lên.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateStreakInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Streak được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Streak' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/streaks/{id}': {
        get: {
          tags: ['Streaks'],
          summary: 'Lấy chi tiết streak — Cần đăng nhập (chỉ record của mình)',
          description:
            'Trả 403 nếu cố truy cập streak của user khác (trừ Admin).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '65e5ecb5d74b8c3b44b8b555' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết streak',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Streak' },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Streaks'],
          summary: 'Cập nhật streak — Cần đăng nhập (chỉ record của mình)',
          description:
            'Trả 403 nếu cố sửa streak của user khác (trừ Admin). Trường `userId` trong body bị bỏ qua.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '65e5ecb5d74b8c3b44b8b555' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    currentStreak: { type: 'integer', example: 13 },
                    longestStreak: { type: 'integer', example: 45 },
                    totalActiveDays: { type: 'integer', example: 121 },
                    lastActiveDate: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-05-28T00:00:00.000Z',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Streak được cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Streak' },
                    },
                  },
                },
              },
            },
            403: {
              description: 'Cố sửa streak của user khác',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message: 'You do not have permission to update this record',
                  },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Streaks'],
          summary: 'Xóa streak — Cần đăng nhập (chỉ record của mình)',
          description: 'Trả 403 nếu cố xóa streak của user khác (trừ Admin).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '65e5ecb5d74b8c3b44b8b555' },
            },
          ],
          responses: {
            204: { description: 'Đã xóa' },
            403: {
              description: 'Cố xóa streak của user khác',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: {
                    message: 'You do not have permission to delete this record',
                  },
                },
              },
            },
          },
        },
      },

      // ─── SUBSCRIPTIONS ───────────────────────────────────────────────────
      '/subscriptions': {
        get: {
          tags: ['Subscriptions'],
          summary:
            'Xem danh sách gói đăng ký — Public (chỉ trả gói `isActive: true`)',
          description:
            'Luôn lọc `isActive: true`. Query param `isActive` không có tác dụng (hardcoded).',
          parameters: [],
          responses: {
            200: {
              description: 'Danh sách gói subscription',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/Subscription',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Subscriptions'],
          summary: 'Tạo gói đăng ký mới — Admin only',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateSubscriptionInput',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Gói được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Subscription' },
                    },
                  },
                },
              },
            },
            403: {
              description: 'Không có quyền Admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/subscriptions/{id}': {
        get: {
          tags: ['Subscriptions'],
          summary: 'Xem chi tiết gói đăng ký — Public',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '66f5ecb5d74b8c3b44b8b666' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết gói',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Subscription' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Subscriptions'],
          summary: 'Cập nhật gói đăng ký — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '66f5ecb5d74b8c3b44b8b666' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateSubscriptionInput',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Đã cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Subscription' },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Subscriptions'],
          summary: 'Xóa gói đăng ký — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '66f5ecb5d74b8c3b44b8b666' },
            },
          ],
          responses: { 204: { description: 'Đã xóa' } },
        },
      },
      '/subscriptions/{id}/request': {
        post: {
          tags: ['Subscriptions'],
          summary: '💳 Yêu cầu mua gói — Cần đăng nhập',
          description:
            'User gửi yêu cầu mua gói subscription.\n\nBackend:\n' +
            '1. Kiểm tra `course.isFree` — 400 nếu khóa học miễn phí\n' +
            '2. Kiểm tra duplicate active subscription cho courseId đó — 400 nếu đã có\n' +
            '3. Tạo `UserSubscription` (status: **pending**)\n' +
            '4. Tạo `TransactionRecord` (status: pending)\n' +
            '5. Trả về `qrCodeUrl` để user quét chuyển khoản\n\n' +
            '**Sau khi admin approve proof ảnh:** `UserSubscription.status → active`, `User.role → learner`, `User.currentSubscription → UserSubscription._id`.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID của Subscription plan',
              schema: { type: 'string', example: '66f5ecb5d74b8c3b44b8b666' },
            },
          ],
          responses: {
            200: {
              description:
                'Yêu cầu tạo thành công — trả qrCodeUrl để chuyển khoản',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/RequestSubscriptionResponse',
                  },
                },
              },
            },
            400: {
              description: 'Khóa học miễn phí hoặc đã có active subscription',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  examples: {
                    freeCourse: {
                      summary: 'Khóa học isFree',
                      value: {
                        message: 'This course is free. No subscription needed.',
                      },
                    },
                    duplicate: {
                      summary: 'Đã có subscription active cho khóa học này',
                      value: {
                        message:
                          'You already have an active subscription for this course',
                      },
                    },
                    inactivePlan: {
                      summary: 'Gói bị deactivate',
                      value: {
                        message:
                          'This subscription plan is no longer available',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Chưa đăng nhập',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Gói subscription không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { message: 'Subscription plan not found' },
                },
              },
            },
          },
        },
      },

      // ─── TRANSACTION RECORDS ─────────────────────────────────────────────
      '/transaction-records': {
        get: {
          tags: ['TransactionRecords'],
          summary: 'Xem danh sách giao dịch — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'userId',
              in: 'query',
              schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['pending', 'reviewing', 'success', 'failed', 'refunded'],
              },
            },
          ],
          responses: {
            200: {
              description: 'Danh sách giao dịch',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/TransactionRecord',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['TransactionRecords'],
          summary: 'Tạo bản ghi giao dịch thủ công — Cần đăng nhập',
          description:
            'Thông thường TransactionRecord được tạo tự động qua `/subscriptions/:id/purchase`. API này dùng cho mục đích thủ công/internal.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: [
                    'userId',
                    'userSubscriptionId',
                    'amount',
                    'paymentMethod',
                  ],
                  properties: {
                    userId: {
                      type: 'string',
                      example: '60d5dbf5d74b8c3b44b8b4c3',
                    },
                    userSubscriptionId: {
                      type: 'string',
                      example: '67b5ecb5d74b8c3b44b8b888',
                    },
                    amount: { type: 'number', example: 199000 },
                    currency: {
                      type: 'string',
                      enum: ['VND', 'USD'],
                      example: 'VND',
                    },
                    paymentMethod: { type: 'string', example: 'qr_manual' },
                    gatewayTxId: { type: 'string', example: '240528_823741' },
                    status: {
                      type: 'string',
                      enum: [
                        'pending',
                        'reviewing',
                        'success',
                        'failed',
                        'refunded',
                      ],
                      example: 'pending',
                    },
                    gatewayProvider: { type: 'string', example: 'qr_manual' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Bản ghi giao dịch được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/TransactionRecord' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/transaction-records/{id}': {
        get: {
          tags: ['TransactionRecords'],
          summary: 'Xem chi tiết giao dịch — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '67a5ecb5d74b8c3b44b8b777' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết giao dịch',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/TransactionRecord' },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          tags: ['TransactionRecords'],
          summary: 'Cập nhật trạng thái giao dịch — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '67a5ecb5d74b8c3b44b8b777' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: [
                        'pending',
                        'reviewing',
                        'success',
                        'failed',
                        'refunded',
                      ],
                      example: 'refunded',
                    },
                    paidAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-05-28T09:00:00.000Z',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Giao dịch được cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/TransactionRecord' },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['TransactionRecords'],
          summary: 'Xóa bản ghi giao dịch — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '67a5ecb5d74b8c3b44b8b777' },
            },
          ],
          responses: { 204: { description: 'Đã xóa' } },
        },
      },

      // ─── TRANSACTION RECORD ACTIONS ──────────────────────────────────────
      '/transaction-records/{id}/upload-proof': {
        patch: {
          tags: ['TransactionRecords'],
          summary: '📷 Upload ảnh chứng minh chuyển khoản — Cần đăng nhập',
          description:
            'User upload ảnh proof chuyển khoản cho giao dịch đang `pending`.\n\n' +
            'Backend:\n' +
            '1. Verify giao dịch thuộc về user hiện tại\n' +
            '2. Kiểm tra status = `pending` — 400 nếu không phải\n' +
            '3. Upload ảnh lên Cloudinary (`lenfolk/payment-proofs`)\n' +
            '4. Cập nhật `TransactionRecord.proofImageUrl` và chuyển status → `reviewing`',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '67a5ecb5d74b8c3b44b8b777' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['proof'],
                  properties: {
                    proof: {
                      type: 'string',
                      format: 'binary',
                      description:
                        'Ảnh chứng minh chuyển khoản (jpg/png/webp, tối đa 5MB).',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Upload thành công — status chuyển sang `reviewing`',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/TransactionRecord' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Giao dịch không ở trạng thái `pending`',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { message: 'Transaction is not in pending state' },
                },
              },
            },
            403: {
              description: 'Giao dịch không thuộc về user này',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Giao dịch không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/transaction-records/{id}/approve': {
        patch: {
          tags: ['TransactionRecords'],
          summary: '✅ Admin duyệt giao dịch — Admin only',
          description:
            'Admin phê duyệt giao dịch đang ở trạng thái `reviewing`.\n\n' +
            'Backend (atomic transaction):\n' +
            '1. Kiểm tra status = `reviewing`\n' +
            '2. Tính `startDate` = now, `endDate` theo `billingCycle`\n' +
            '3. Cập nhật `TransactionRecord.status → success`, `reviewedBy`, `reviewedAt`\n' +
            '4. Cập nhật `UserSubscription.status → active`, `startDate`, `endDate`\n' +
            '5. Cập nhật `User.role → learner`, `User.currentSubscription`',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '67a5ecb5d74b8c3b44b8b777' },
            },
          ],
          responses: {
            200: {
              description:
                'Giao dịch được duyệt — user giờ có subscription active',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/TransactionRecord' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Giao dịch không ở trạng thái `reviewing`',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                  example: { message: 'Transaction is not in reviewing state' },
                },
              },
            },
            403: {
              description: 'Không phải admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Giao dịch không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/transaction-records/{id}/reject': {
        patch: {
          tags: ['TransactionRecords'],
          summary: '❌ Admin từ chối giao dịch — Admin only',
          description:
            'Admin từ chối giao dịch đang ở trạng thái `reviewing`.\n\n' +
            'Backend:\n' +
            '1. Kiểm tra status = `reviewing`\n' +
            '2. Cập nhật `TransactionRecord.status → failed`, `rejectReason`, `reviewedBy`, `reviewedAt`\n' +
            '3. `UserSubscription.status` vẫn là `pending` (user có thể upload lại)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '67a5ecb5d74b8c3b44b8b777' },
            },
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    rejectReason: {
                      type: 'string',
                      example: 'Ảnh không rõ ràng, không thấy số tài khoản.',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Giao dịch bị từ chối',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/TransactionRecord' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Giao dịch không ở trạng thái `reviewing`',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            403: {
              description: 'Không phải admin',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            404: {
              description: 'Giao dịch không tìm thấy',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ─── PERMISSIONS ─────────────────────────────────────────────────────
      '/permissions': {
        get: {
          tags: ['Permissions'],
          summary: 'Lấy danh sách permissions — Admin only',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Danh sách permissions',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Permission' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Permissions'],
          summary: 'Tạo permission mới — Admin only',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreatePermissionInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Permission được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Permission' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/permissions/{id}': {
        get: {
          tags: ['Permissions'],
          summary: 'Lấy chi tiết permission — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '68a1ecb5d74b8c3b44b8b999' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết permission',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Permission' },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          tags: ['Permissions'],
          summary: 'Cập nhật permission — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '68a1ecb5d74b8c3b44b8b999' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreatePermissionInput' },
              },
            },
          },
          responses: {
            200: {
              description: 'Đã cập nhật',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Permission' },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['Permissions'],
          summary: 'Xóa permission — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '68a1ecb5d74b8c3b44b8b999' },
            },
          ],
          responses: { 204: { description: 'Đã xóa' } },
        },
      },

      // ─── AUDIT LOGS ──────────────────────────────────────────────────────
      '/audit-logs': {
        get: {
          tags: ['AuditLogs'],
          summary: 'Xem danh sách audit log — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'actorId',
              in: 'query',
              schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            },
            {
              name: 'action',
              in: 'query',
              schema: { type: 'string', example: 'DELETE_USER' },
            },
            {
              name: 'sort',
              in: 'query',
              schema: { type: 'string', example: '-createdAt' },
            },
          ],
          responses: {
            200: {
              description: 'Danh sách audit log',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AuditLog' },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['AuditLogs'],
          summary: 'Tạo audit log thủ công — Admin only',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateAuditLogInput' },
              },
            },
          },
          responses: {
            201: {
              description: 'Log được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/AuditLog' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/audit-logs/{id}': {
        get: {
          tags: ['AuditLogs'],
          summary: 'Xem chi tiết audit log — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '69b1ecb5d74b8c3b44b8baaa' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết log',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/AuditLog' },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['AuditLogs'],
          summary: 'Xóa audit log — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '69b1ecb5d74b8c3b44b8baaa' },
            },
          ],
          responses: { 204: { description: 'Đã xóa' } },
        },
      },

      // ─── MODERATOR LOGS ──────────────────────────────────────────────────
      '/moderator-logs': {
        get: {
          tags: ['ModeratorLogs'],
          summary: 'Xem danh sách moderator log — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'moderatorId',
              in: 'query',
              schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c6' },
            },
            {
              name: 'action',
              in: 'query',
              schema: {
                type: 'string',
                enum: [
                  'approve_comment',
                  'delete_comment',
                  'warn_user',
                  'ban_user',
                  'unban_user',
                  'resolve_report',
                  'dismiss_report',
                ],
              },
            },
          ],
          responses: {
            200: {
              description: 'Danh sách moderator log',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/PaginationMeta' },
                      {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/ModeratorLog',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['ModeratorLogs'],
          summary: 'Tạo moderator log — Cần đăng nhập (Moderator/Admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateModeratorLogInput',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Log được tạo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/ModeratorLog' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/moderator-logs/{id}': {
        get: {
          tags: ['ModeratorLogs'],
          summary: 'Xem chi tiết moderator log — Cần đăng nhập',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '70c1ecb5d74b8c3b44b8bbbb' },
            },
          ],
          responses: {
            200: {
              description: 'Chi tiết log',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/ModeratorLog' },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ['ModeratorLogs'],
          summary: 'Xóa moderator log — Admin only',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', example: '70c1ecb5d74b8c3b44b8bbbb' },
            },
          ],
          responses: { 204: { description: 'Đã xóa' } },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
