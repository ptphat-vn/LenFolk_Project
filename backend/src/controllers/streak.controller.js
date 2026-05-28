const factory = require('../utils/handlerFactory');
const Streak = require('../models/Streak');

exports.getAll = factory.getAll(Streak);
exports.getOne = factory.getOne(Streak);
exports.createOne = factory.createOne(Streak);
exports.updateOne = factory.updateOne(Streak);
exports.deleteOne = factory.deleteOne(Streak);
