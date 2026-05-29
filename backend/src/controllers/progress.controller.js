const factory = require('../utils/handlerFactory');
const Progress = require('../models/Progress');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// PS-01: Only return progress records belonging to the current user
exports.getAll = catchAsync(async (req, res, next) => {
  const docs = await Progress.find({ userId: req.user._id }).sort(
    '-lastAccessedAt',
  );
  res.status(200).json({ success: true, results: docs.length, data: docs });
});

// Inject userId from token, prevent spoofing via body
exports.createOne = catchAsync(async (req, res, next) => {
  const doc = await Progress.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: doc });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const doc = await Progress.findById(req.params.id);
  if (!doc) return next(new AppError('No document found with that ID', 404));
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to access this record', 403),
    );
  }
  res.status(200).json({ success: true, data: doc });
});

exports.updateOne = catchAsync(async (req, res, next) => {
  const doc = await Progress.findById(req.params.id);
  if (!doc) return next(new AppError('No document found with that ID', 404));
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to update this record', 403),
    );
  }
  // Prevent userId/courseId/lessonId spoofing on update
  delete req.body.userId;
  const updated = await Progress.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: updated });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const doc = await Progress.findById(req.params.id);
  if (!doc) return next(new AppError('No document found with that ID', 404));
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to delete this record', 403),
    );
  }
  await Progress.findByIdAndDelete(req.params.id);
  res.status(204).json({ success: true, data: null });
});
