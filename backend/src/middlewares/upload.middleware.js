const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Single source of truth: fileFilter must reject anything Cloudinary's
// allowed_formats would reject, or the upload succeeds on disk/Cloudinary
// before the mismatch surfaces as an unhandled 500 further down the chain.
const PERFORMANCE_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

const getExtension = (filename) => (filename.split('.').pop() || '').toLowerCase();

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lenfolk/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const lessonVideoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lenfolk/lesson-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'webm', 'mkv'],
  },
});

// Combined storage: a lesson can carry a video and/or a PDF. Cloudinary needs a
// different resource_type/folder per file kind, so resolve params per file.
const lessonMaterialStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === 'pdf') {
      return {
        folder: 'lenfolk/lesson-pdfs',
        resource_type: 'raw',
        allowed_formats: ['pdf'],
      };
    }
    if (file.fieldname === 'images') {
      return {
        folder: 'lenfolk/lesson-images',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      };
    }
    if (file.fieldname === 'audio') {
      return {
        folder: 'lenfolk/lesson-audios',
        // Cloudinary xử lý audio qua pipeline 'video'
        resource_type: 'video',
        allowed_formats: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'webm'],
      };
    }
    return {
      folder: 'lenfolk/lesson-videos',
      resource_type: 'video',
      allowed_formats: ['mp4', 'mov', 'webm', 'mkv'],
    };
  },
});

const performanceMaterialStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === 'images' || file.fieldname === 'imageUrls') {
      return {
        folder: 'lenfolk/performance-images',
        resource_type: 'image',
        allowed_formats: PERFORMANCE_IMAGE_FORMATS,
      };
    }
    return {
      folder: 'lenfolk/performance-documents',
      resource_type: 'raw',
      allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip'],
    };
  },
});

const courseThumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lenfolk/course-thumbnails',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const videoFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('video/')) {
    return cb(new Error('Only video files are allowed for lesson uploads'));
  }
  cb(null, true);
};

const lessonMaterialFileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdf') {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed for the pdf field'));
    }
    return cb(null, true);
  }
  if (file.fieldname === 'video') {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed for the video field'));
    }
    return cb(null, true);
  }
  if (file.fieldname === 'images') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for the images field'));
    }
    return cb(null, true);
  }
  if (file.fieldname === 'audio') {
    if (!file.mimetype.startsWith('audio/')) {
      return cb(new Error('Only audio files are allowed for the audio field'));
    }
    return cb(null, true);
  }
  return cb(new Error('Unexpected file field'));
};

const documentFileFilter = (req, file, cb) => {
  if (file.fieldname === 'images' || file.fieldname === 'imageUrls') {
    const ext = getExtension(file.originalname);
    if (!file.mimetype.startsWith('image/') || !PERFORMANCE_IMAGE_FORMATS.includes(ext)) {
      return cb(
        new AppError(
          `Only ${PERFORMANCE_IMAGE_FORMATS.join(', ')} images are allowed for performance images`,
          400,
        ),
      );
    }
    return cb(null, true);
  }

  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new AppError('Only document files are allowed for performance uploads', 400));
  }
  cb(null, true);
};

const practiceMediaFileFilter = (req, file, cb) => {
  if (
    !file.mimetype.startsWith('audio/') &&
    !file.mimetype.startsWith('video/')
  ) {
    return cb(new Error('Only audio or video files are allowed for AI analysis'));
  }
  cb(null, true);
};

// multer's own errors (MulterError) and storage-engine errors (e.g. Cloudinary
// rejecting a file that slipped past fileFilter) are plain Errors without a
// statusCode, so the global error handler treats them as unknown/500. Wrap
// every multer entrypoint so upload failures always surface as a 400.
const normalizeUploadError = (err) => {
  if (!err || err instanceof AppError) return err;
  if (err instanceof multer.MulterError) {
    return new AppError(`Upload error: ${err.message}`, 400);
  }
  return new AppError(err.message || 'File upload failed', 400);
};

const wrapUploadMiddleware = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) return next(normalizeUploadError(err));
    next();
  });
};

const wrapUploader = (multerInstance) => {
  ['single', 'array', 'fields', 'none'].forEach((method) => {
    const original = multerInstance[method].bind(multerInstance);
    multerInstance[method] = (...args) => wrapUploadMiddleware(original(...args));
  });
  return multerInstance;
};

const upload = wrapUploader(multer({ storage: avatarStorage }));
upload.lessonVideo = wrapUploader(
  multer({
    storage: lessonVideoStorage,
    fileFilter: videoFileFilter,
    limits: { fileSize: 500 * 1024 * 1024 },
  }),
);
upload.lessonMaterial = wrapUploader(
  multer({
    storage: lessonMaterialStorage,
    fileFilter: lessonMaterialFileFilter,
    limits: { fileSize: 500 * 1024 * 1024 },
  }),
);
upload.performanceDocuments = wrapUploader(
  multer({
    storage: performanceMaterialStorage,
    fileFilter: documentFileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
);
upload.courseThumbnail = wrapUploader(
  multer({
    storage: courseThumbnailStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }),
);
upload.practiceMedia = wrapUploader(
  multer({
    storage: multer.memoryStorage(),
    fileFilter: practiceMediaFileFilter,
    limits: { fileSize: 25 * 1024 * 1024 },
  }),
);

module.exports = upload;
