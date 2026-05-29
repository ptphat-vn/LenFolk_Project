const factory = require('../utils/handlerFactory');
const PracticeSession = require('../models/PracticeSession');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// PS-02: Only return sessions belonging to the current user
exports.getAll = catchAsync(async (req, res, next) => {
  const sessions = await PracticeSession.find({ userId: req.user._id }).sort(
    '-createdAt',
  );
  res
    .status(200)
    .json({ success: true, results: sessions.length, data: sessions });
});

// PS-03: Strip AI score fields — scores must be set server-side only
exports.createOne = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const {
    aiScore,
    rhythmScore,
    pitchScore,
    accuracyScore,
    aiFeedback,
    status,
    userId: _u,
    ...safeBody
  } = req.body;
  const session = await PracticeSession.create({
    ...safeBody,
    userId: req.user._id,
    status: 'pending',
  });
  res.status(201).json({ success: true, data: session });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const doc = await PracticeSession.findById(req.params.id);
  if (!doc) return next(new AppError('No session found with that ID', 404));
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to access this session', 403),
    );
  }
  res.status(200).json({ success: true, data: doc });
});

// PS-04: Strip AI score fields on update — same as createOne guard
exports.updateOne = catchAsync(async (req, res, next) => {
  const doc = await PracticeSession.findById(req.params.id);
  if (!doc) return next(new AppError('No session found with that ID', 404));
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to update this session', 403),
    );
  }
  // eslint-disable-next-line no-unused-vars
  const {
    aiScore,
    rhythmScore,
    pitchScore,
    accuracyScore,
    aiFeedback,
    status,
    userId: _u,
    ...safeBody
  } = req.body;
  const updated = await PracticeSession.findByIdAndUpdate(
    req.params.id,
    safeBody,
    {
      new: true,
      runValidators: true,
    },
  );
  res.status(200).json({ success: true, data: updated });
});

exports.deleteOne = catchAsync(async (req, res, next) => {
  const doc = await PracticeSession.findById(req.params.id);
  if (!doc) return next(new AppError('No session found with that ID', 404));
  if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
    return next(
      new AppError('You do not have permission to delete this session', 403),
    );
  }
  await PracticeSession.findByIdAndDelete(req.params.id);
  res.status(204).json({ success: true, data: null });
});
