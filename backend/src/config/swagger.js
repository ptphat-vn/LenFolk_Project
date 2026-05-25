const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LenFolk API',
      version: '1.0.0',
      description:
        'RESTful API documentation for the LenFolk music learning platform. All protected routes require a Bearer JWT token in the Authorization header.',
      contact: {
        name: 'LenFolk Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ── Pagination / Shared ─────────────────────────────────────────
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
            message: { type: 'string', example: 'Mô tả lỗi chi tiết ở đây (vd: Invalid email or password)' },
            error: { type: 'object', example: { statusCode: 400, isOperational: true } },
            stack: { type: 'string', example: 'Error stack trace (chỉ có ở môi trường development)' }
          },
        },

        // ── Auth ────────────────────────────────────────────────────────
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Nguyễn Văn A' },
            email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
            password: { type: 'string', minLength: 8, example: 'MậtKhẩuMạnh123!' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
            password: { type: 'string', example: 'MậtKhẩuMạnh123!' },
          },
        },
        RefreshTokenInput: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDVkYmY1ZDc0...' },
          },
        },
        AuthTokenResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Login successful' },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1... (Access token sống 1h)' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1... (Refresh token sống 7d)' },
                user: { $ref: '#/components/schemas/User' }
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
            email: { type: 'string', format: 'email', example: 'nguyenvana@lenfolk.vn' },
            gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
            dateOfBirth: { type: 'string', format: 'date-time', example: '1995-10-15T00:00:00.000Z' },
            avatar: { type: 'string', example: 'https://cdn.lenfolk.vn/avatars/user_123.jpg' },
            phoneNumber: { type: 'string', example: '+84987654321' },
            role: { type: 'string', enum: ['admin', 'instructor', 'moderator', 'learner', 'guest'], example: 'learner' },
            isActive: { type: 'boolean', example: true },
            isVerified: { type: 'boolean', example: true },
            lastLoginAt: { type: 'string', format: 'date-time', example: '2023-10-01T14:30:00.000Z' },
            deletedAt: { type: 'string', format: 'date-time', nullable: true, example: null },
            createdAt: { type: 'string', format: 'date-time', example: '2023-01-01T10:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2023-10-01T14:30:00.000Z' },
          },
        },
        CreateUserInput: {
          type: 'object',
          required: ['name', 'email', 'passwordHash'],
          properties: {
            name: { type: 'string', example: 'Lê Thị B' },
            email: { type: 'string', format: 'email', example: 'lethib@lenfolk.vn' },
            passwordHash: { type: 'string', example: 'password_will_be_hashed' },
            gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'female' },
            dateOfBirth: { type: 'string', format: 'date-time', example: '1998-05-20T00:00:00.000Z' },
            role: { type: 'string', enum: ['admin', 'instructor', 'moderator', 'learner', 'guest'], example: 'instructor' },
            phoneNumber: { type: 'string', example: '+84912345678' },
            avatar: { type: 'string', example: 'https://cdn.lenfolk.vn/avatars/lethib.jpg' },
          },
        },
        UpdateUserInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Lê Thị B (Updated)' },
            gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'female' },
            dateOfBirth: { type: 'string', format: 'date-time', example: '1998-05-20T00:00:00.000Z' },
            role: { type: 'string', enum: ['admin', 'instructor', 'moderator', 'learner', 'guest'], example: 'moderator' },
            phoneNumber: { type: 'string', example: '+84111222333' },
            avatar: { type: 'string', example: 'https://cdn.lenfolk.vn/avatars/lethib_new.jpg' },
            isActive: { type: 'boolean', example: false },
          },
        },

        // ── Course ──────────────────────────────────────────────────────
        Course: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            instructorId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            title: { type: 'string', example: 'Guitar Cơ Bản Cho Người Mới Bắt Đầu' },
            description: { type: 'string', example: 'Khóa học hướng dẫn các hợp âm cơ bản và điệu rải guitar...' },
            thumbnail: { type: 'string', example: 'https://cdn.lenfolk.vn/courses/guitar_101.jpg' },
            level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'beginner' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'], example: 'published' },
            tags: { type: 'array', items: { type: 'string' }, example: ['guitar', 'cơ bản', 'âm nhạc'] },
            totalLessons: { type: 'integer', example: 12 },
            enrollCount: { type: 'integer', example: 1540 },
            isFeatured: { type: 'boolean', example: true },
            publishedAt: { type: 'string', format: 'date-time', example: '2023-08-15T08:00:00.000Z' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCourseInput: {
          type: 'object',
          required: ['instructorId', 'title', 'level'],
          properties: {
            instructorId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            title: { type: 'string', example: 'Piano Đệm Hát Nâng Cao' },
            description: { type: 'string', example: 'Tự tin đệm hát piano với các vòng hợp âm phức tạp.' },
            thumbnail: { type: 'string', example: 'https://cdn.lenfolk.vn/courses/piano_advanced.jpg' },
            level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'advanced' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'], example: 'draft' },
            tags: { type: 'array', items: { type: 'string' }, example: ['piano', 'đệm hát', 'nâng cao'] },
            isFeatured: { type: 'boolean', example: false },
          },
        },

        // ── Lesson ──────────────────────────────────────────────────────
        Lesson: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            courseId: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            title: { type: 'string', example: 'Bài 1: Làm quen với cây đàn Guitar' },
            description: { type: 'string', example: 'Tư thế cầm đàn, cách gảy phím và các dây đàn mở.' },
            videoUrl: { type: 'string', example: 'https://video.lenfolk.vn/lesson1.mp4' },
            audioUrl: { type: 'string', example: 'https://audio.lenfolk.vn/lesson1.mp3' },
            order: { type: 'integer', example: 1 },
            duration: { type: 'integer', description: 'Duration in seconds', example: 450 },
            status: { type: 'string', enum: ['draft', 'published'], example: 'published' },
            isFree: { type: 'boolean', example: true },
            transcript: { type: 'string', example: 'Xin chào các bạn, hôm nay chúng ta sẽ làm quen với cây đàn...' },
            techniques: { type: 'array', items: { type: 'string' }, example: ['Cầm đàn', 'Gảy phím', 'Tư thế'] },
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
            description: { type: 'string', example: 'Cách bấm và chuyển hợp âm Đô trưởng.' },
            videoUrl: { type: 'string', example: 'https://video.lenfolk.vn/lesson2.mp4' },
            audioUrl: { type: 'string', example: 'https://audio.lenfolk.vn/lesson2.mp3' },
            order: { type: 'integer', minimum: 1, example: 2 },
            duration: { type: 'integer', minimum: 0, example: 600 },
            status: { type: 'string', enum: ['draft', 'published'], example: 'draft' },
            isFree: { type: 'boolean', example: false },
            transcript: { type: 'string', example: 'Hợp âm Đô trưởng là một trong những...' },
            techniques: { type: 'array', items: { type: 'string' }, example: ['Hợp âm', 'Chuyển ngón'] },
          },
        },

        // ── InstructorProfile ───────────────────────────────────────────
        InstructorProfile: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '61a5ecb5d74b8c3b44b8b111' },
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            bio: { type: 'string', example: 'Nghệ sĩ Guitar với hơn 10 năm kinh nghiệm biểu diễn và giảng dạy.' },
            expertise: { type: 'string', example: 'Acoustic Guitar, Fingerstyle' },
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
            bio: { type: 'string', maxLength: 1000, example: 'Chuyên gia Piano...' },
            expertise: { type: 'string', example: 'Classical Piano' },
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
            description: { type: 'string', example: 'Học liên tục 7 ngày không nghỉ' },
            type: { type: 'string', enum: ['streak', 'completion', 'practice', 'achievement'], example: 'streak' },
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
            description: { type: 'string', example: 'Hoàn thành 100 bài thực hành.' },
            type: { type: 'string', enum: ['streak', 'completion', 'practice', 'achievement'], example: 'practice' },
            conditionKey: { type: 'string', example: 'practice_sessions_completed' },
            conditionValue: { type: 'number', minimum: 0, example: 100 },
            isActive: { type: 'boolean', example: true },
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
            status: { type: 'string', enum: ['not_started', 'in_progress', 'completed'], example: 'completed' },
            watchedSeconds: { type: 'integer', example: 450 },
            completionPercent: { type: 'number', example: 100 },
            bestPracticeScore: { type: 'number', example: 95 },
            attemptCount: { type: 'integer', example: 2 },
            lastAccessedAt: { type: 'string', format: 'date-time', example: '2023-10-02T14:30:00.000Z' },
            completedAt: { type: 'string', format: 'date-time', example: '2023-10-02T15:00:00.000Z' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateProgressInput: {
          type: 'object',
          required: ['userId', 'courseId', 'lessonId'],
          properties: {
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            courseId: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' },
            lessonId: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            status: { type: 'string', enum: ['not_started', 'in_progress', 'completed'], example: 'in_progress' },
            watchedSeconds: { type: 'integer', minimum: 0, example: 120 },
            completionPercent: { type: 'number', minimum: 0, maximum: 100, example: 25 },
          },
        },

        // ── PracticeSession ─────────────────────────────────────────────
        PracticeSession: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64d5ecb5d74b8c3b44b8b444' },
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            lessonId: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            audioFileUrl: { type: 'string', example: 'https://user-audio.lenfolk.vn/practice_123.wav' },
            aiScore: { type: 'number', example: 88 },
            rhythmScore: { type: 'number', example: 90 },
            pitchScore: { type: 'number', example: 85 },
            accuracyScore: { type: 'number', example: 89 },
            aiFeedback: { type: 'string', example: 'Nhịp rất tốt, nhưng chú ý nốt Mi bị chênh phô nhẹ.' },
            referenceAudio: { type: 'string', example: 'https://audio.lenfolk.vn/lesson1_ref.mp3' },
            duration: { type: 'integer', description: 'seconds', example: 60 },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'], example: 'completed' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePracticeSessionInput: {
          type: 'object',
          required: ['userId', 'lessonId'],
          properties: {
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            lessonId: { type: 'string', example: '60e5dbf5d74b8c3b44b8b999' },
            audioFileUrl: { type: 'string', example: 'https://user-audio.lenfolk.vn/practice_123.wav' },
            duration: { type: 'integer', minimum: 0, example: 60 },
            referenceAudio: { type: 'string', example: 'https://audio.lenfolk.vn/lesson1_ref.mp3' },
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
            lastActiveDate: { type: 'string', format: 'date-time', example: '2023-10-10T08:00:00.000Z' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateStreakInput: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' },
            currentStreak: { type: 'integer', minimum: 0, example: 1 },
            longestStreak: { type: 'integer', minimum: 0, example: 1 },
            totalActiveDays: { type: 'integer', minimum: 0, example: 1 },
          },
        },

        // ── Subscription ────────────────────────────────────────────────
        Subscription: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66f5ecb5d74b8c3b44b8b666' },
            name: { type: 'string', example: 'LenFolk Pro - Monthly' },
            description: { type: 'string', example: 'Mở khóa tất cả khóa học và AI feedback không giới hạn.' },
            price: { type: 'number', example: 199000 },
            currency: { type: 'string', enum: ['VND', 'USD'], example: 'VND' },
            billingCycle: { type: 'string', enum: ['monthly', 'quarterly', 'yearly'], example: 'monthly' },
            features: { type: 'array', items: { type: 'string' }, example: ['Mở khóa khoá học', 'AI Feedback', 'Không quảng cáo'] },
            maxCourses: { type: 'integer', description: '-1 means unlimited', example: -1 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateSubscriptionInput: {
          type: 'object',
          required: ['name', 'price', 'billingCycle'],
          properties: {
            name: { type: 'string', example: 'LenFolk Premium - Yearly' },
            description: { type: 'string', example: 'Gói năm tiết kiệm.' },
            price: { type: 'number', minimum: 0, example: 1990000 },
            currency: { type: 'string', enum: ['VND', 'USD'], example: 'VND' },
            billingCycle: { type: 'string', enum: ['monthly', 'quarterly', 'yearly'], example: 'yearly' },
            features: { type: 'array', items: { type: 'string' }, example: ['Tất cả quyền lợi Pro', 'Hỗ trợ 1-1'] },
            maxCourses: { type: 'integer', example: -1 },
            isActive: { type: 'boolean', example: true },
          },
        },
        
        // ── Notification, TransactionRecord, Permission, v.v (có thể rút gọn bớt nếu ko cần chi tiết)
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & Authorization' },
      { name: 'Users', description: 'User management' },
      { name: 'Courses', description: 'Course management' },
      { name: 'Lessons', description: 'Lesson management' },
      { name: 'InstructorProfiles', description: 'Instructor profile management' },
      { name: 'Badges', description: 'Badge management' },
      { name: 'Progress', description: 'Learner progress tracking' },
      { name: 'PracticeSessions', description: 'Practice session management' },
      { name: 'Streaks', description: 'Streak tracking' },
      { name: 'Subscriptions', description: 'Subscription plans management' },
    ],
    paths: {
      // ─── AUTH ─────────────────────────────────────────────────────────
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } },
          },
          responses: {
            201: { description: 'User registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokenResponse' } } } },
            400: { 
              description: 'Validation error (ví dụ: mật khẩu ngắn) hoặc Email đã tồn tại', 
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, status: 'fail', message: 'Email already in use' } } } 
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthTokenResponse' } } } },
            401: { 
              description: 'Sai email hoặc mật khẩu', 
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, status: 'fail', message: 'Invalid email or password' } } } 
            },
            400: {
              description: 'Thiếu email hoặc mật khẩu (Lỗi validation)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, status: 'fail', message: 'Validation Failed: body.email: Invalid email format' } } } 
            }
          },
        },
      },
      '/auth/refresh-token': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenInput' } } },
          },
          responses: {
            200: { description: 'Token refreshed', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'object', properties: { accessToken: { type: 'string', example: 'eyJhbGciOi...' } } } } } } } },
            401: { 
              description: 'Refresh token không hợp lệ hoặc đã hết hạn',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, status: 'fail', message: 'Invalid refresh token' } } }
            },
          },
        },
      },

      // ─── USERS ────────────────────────────────────────────────────────
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'Get all users',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
            { name: 'sort', in: 'query', schema: { type: 'string', example: '-createdAt' } },
          ],
          responses: {
            200: { 
              description: 'List of users', 
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginationMeta' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }] } } } 
            },
            401: { 
              description: 'Chưa đăng nhập (Thiếu token)', 
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, status: 'fail', message: 'No token provided' } } } 
            },
            403: { 
              description: 'Không có quyền truy cập (Chỉ Admin)', 
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, status: 'fail', message: 'Access denied' } } } 
            },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Create a new user (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserInput' } } } },
          responses: {
            201: { description: 'User created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/User' } } } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'], summary: 'Get a user by ID', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' } }],
          responses: { 
            200: { description: 'User found', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/User' } } } } } }, 
            404: { description: 'User không tồn tại', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, status: 'fail', message: 'No document found with that ID' } } } },
            400: { description: 'Sai định dạng ID', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, status: 'fail', message: 'Invalid _id: 123.' } } } }
          },
        },
        patch: {
          tags: ['Users'], summary: 'Update a user', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserInput' } } } },
          responses: { 
            200: { description: 'User updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/User' } } } } } }, 
            404: { description: 'User không tồn tại', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } 
          },
        },
        delete: {
          tags: ['Users'], summary: 'Delete a user', security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '60d5dbf5d74b8c3b44b8b4c3' } }],
          responses: { 
            204: { description: 'Deleted (Không trả về dữ liệu)' }, 
            404: { description: 'User không tồn tại', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } 
          },
        },
      },

      // ─── COURSES ──────────────────────────────────────────────────────
      '/courses': {
        get: {
          tags: ['Courses'], summary: 'Get all courses',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
          ],
          responses: { 
            200: { description: 'List of courses', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/PaginationMeta' }, { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Course' } } } }] } } } } 
          },
        },
        post: {
          tags: ['Courses'], summary: 'Create a new course', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCourseInput' } } } },
          responses: { 
            201: { description: 'Course created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Course' } } } } } }, 
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' }, example: { success: false, status: 'fail', message: 'Validation Failed: body.title: Required' } } } } 
          },
        },
      },
      '/courses/{id}': {
        get: { 
          tags: ['Courses'], summary: 'Get a course by ID', 
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' } }], 
          responses: { 
            200: { description: 'Course found', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Course' } } } } } }, 
            404: { description: 'Course không tồn tại', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } 
          } 
        },
        patch: { 
          tags: ['Courses'], summary: 'Update a course', security: [{ bearerAuth: [] }], 
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' } }], 
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCourseInput' } } } }, 
          responses: { 
            200: { description: 'Updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Course' } } } } } }, 
            404: { description: 'Course không tồn tại', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } 
          } 
        },
        delete: { 
          tags: ['Courses'], summary: 'Delete a course', security: [{ bearerAuth: [] }], 
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', example: '60d5ecb5d74b8c3b44b8b4d4' } }], 
          responses: { 204: { description: 'Deleted' }, 404: { description: 'Course không tồn tại', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } } } 
        },
      },
      
      // ... Các route khác tương tự
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
