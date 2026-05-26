const factory = require('../utils/handlerFactory');
const { Subscription } = require('../models/Subscription');

exports.getAll = factory.getAll(Subscription);
exports.getOne = factory.getOne(Subscription);
exports.createOne = factory.createOne(Subscription);
exports.updateOne = factory.updateOne(Subscription);
exports.deleteOne = factory.deleteOne(Subscription);
