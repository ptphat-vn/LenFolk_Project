const factory = require('../utils/handlerFactory');
const Streak = require('../models/Streak');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Only return the current user's streak records
exports.getAll = catchAsync(async (req, res, next) => {
  const docs = await Streak.find({ userId: req.user._id });
  res.status(200).json({ success: true, results: docs.length, data: docs });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const doc = await Streak.findById(req.params.id);
  if (!doc) return next(new AppError('No document found with that ID', 404));
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to access this record', 403),
    );
  }
  res.status(200).json({ success: true, data: doc });
});

// Inject userId from token, prevent spoofing
exports.createOne = catchAsync(async (req, res, next) => {
  const doc = await Streak.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ success: true, data: doc });
});

exports.updateOne = catchAsync(async (req, res, next) => {
  const doc = await Streak.findById(req.params.id);
  if (!doc) return next(new AppError('No document found with that ID', 404));
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to update this record', 403),
    );
  }
  // Prevent userId spoofing on update
  delete req.body.userId;
  const updated = await Streak.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: updated });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const doc = await Streak.findById(req.params.id);
  if (!doc) return next(new AppError('No document found with that ID', 404));
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to delete this record', 403),
    );
  }
  await Streak.findByIdAndDelete(req.params.id);
  res.status(204).json({ success: true, data: null });
});
