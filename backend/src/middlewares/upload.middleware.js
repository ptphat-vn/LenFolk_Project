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

const upload = multer({ storage: avatarStorage });
upload.paymentProof = multer({ storage: paymentProofStorage });

module.exports = upload;
