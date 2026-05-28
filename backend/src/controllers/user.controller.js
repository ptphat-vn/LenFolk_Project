const factory = require('../utils/handlerFactory');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAll = factory.getAll(User);
exports.getOne = factory.getOne(User, { path: 'currentSubscription' });
exports.createOne = factory.createOne(User);

exports.updateOne = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.avatar = req.file.path;
  }
  return factory.updateOne(User)(req, res, next);
});

// Soft-delete: đặt deletedAt thay vì xóa cứng khỏi DB
exports.deleteOne = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  await user.softDelete();
  res.status(204).json({ success: true, data: null });
});
