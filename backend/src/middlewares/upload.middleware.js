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

const paymentProofStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lenfolk/payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const qrCodeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lenfolk/subscription-qr-codes',
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

const performanceDocumentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lenfolk/performance-documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip'],
  },
});

const videoFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('video/')) {
    return cb(new Error('Only video files are allowed for lesson uploads'));
  }
  cb(null, true);
};

const documentFileFilter = (req, file, cb) => {
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

const upload = multer({ storage: avatarStorage });
upload.paymentProof = multer({ storage: paymentProofStorage });
upload.qrCode = multer({ storage: qrCodeStorage });
upload.lessonVideo = multer({
  storage: lessonVideoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});
upload.performanceDocuments = multer({
  storage: performanceDocumentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = upload;
