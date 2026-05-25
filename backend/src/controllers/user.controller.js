const factory = require('../utils/handlerFactory');
const User = require('../models/User');

exports.getAll = factory.getAll(User);
exports.getOne = factory.getOne(User);
exports.createOne = factory.createOne(User);
exports.updateOne = factory.updateOne(User);
exports.deleteOne = factory.deleteOne(User);
