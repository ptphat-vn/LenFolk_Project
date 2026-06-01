const factory = require('../utils/handlerFactory');
const Coupon = require('../models/Coupon');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAll = factory.getAll(Coupon);
exports.getOne = factory.getOne(Coupon);

exports.createOne = catchAsync(async (req, res, next) => {
  // Ensure code is uppercase
  if (req.body.code) {
    req.body.code = req.body.code.toUpperCase();
  }
  const doc = await Coupon.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: doc,
  });
});

exports.updateOne = factory.updateOne(Coupon);
exports.deleteOne = factory.deleteOne(Coupon);
