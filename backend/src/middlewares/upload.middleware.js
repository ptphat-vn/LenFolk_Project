const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

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
    if (file.fieldname === 'images') {
      return {
        folder: 'lenfolk/performance-images',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
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
  if (file.fieldname === 'images') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for performance images'));
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
    return cb(new Error('Only document files are allowed for performance uploads'));
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

const upload = multer({ storage: avatarStorage });
upload.lessonVideo = multer({
  storage: lessonVideoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});
upload.lessonMaterial = multer({
  storage: lessonMaterialStorage,
  fileFilter: lessonMaterialFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});
upload.performanceDocuments = multer({
  storage: performanceMaterialStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});
upload.courseThumbnail = multer({
  storage: courseThumbnailStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
upload.practiceMedia = multer({
  storage: multer.memoryStorage(),
  fileFilter: practiceMediaFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = upload;
