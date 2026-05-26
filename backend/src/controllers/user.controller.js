const factory = require('../utils/handlerFactory');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.getAll = factory.getAll(User);
exports.getOne = factory.getOne(User);
exports.createOne = factory.createOne(User);

exports.updateOne = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.avatar = req.file.path;
  }
  return factory.updateOne(User)(req, res, next);
});

exports.deleteOne = factory.deleteOne(User);
