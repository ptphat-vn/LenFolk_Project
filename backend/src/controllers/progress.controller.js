const factory = require('../utils/handlerFactory');
const Progress = require('../models/Progress');

exports.getAll = factory.getAll(Progress);
exports.getOne = factory.getOne(Progress);
exports.createOne = factory.createOne(Progress);
exports.updateOne = factory.updateOne(Progress);
exports.deleteOne = factory.deleteOne(Progress);
