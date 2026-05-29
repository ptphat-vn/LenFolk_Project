const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['admin', 'instructor', 'moderator', 'learner', 'guest'],
      default: 'guest',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    currentSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserSubscription',
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ deletedAt: 1 });

// Soft-delete: tự động lọc các user đã bị xóa khỏi mọi query find
userSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshToken;
  return obj;
};

// Soft-delete: đặt deletedAt thay vì xóa khỏi DB
userSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);
