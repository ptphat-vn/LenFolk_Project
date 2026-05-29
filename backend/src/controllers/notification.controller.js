const factory = require('../utils/handlerFactory');
const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');

// Only return notifications belonging to the current user
exports.getAll = catchAsync(async (req, res, next) => {
  const docs = await Notification.find({ userId: req.user._id }).sort(
    '-createdAt',
  );
  res.status(200).json({ success: true, results: docs.length, data: docs });
});

exports.getOne = factory.getOne(Notification);
exports.createOne = factory.createOne(Notification);
exports.updateOne = factory.updateOne(Notification);
exports.deleteOne = factory.deleteOne(Notification);
