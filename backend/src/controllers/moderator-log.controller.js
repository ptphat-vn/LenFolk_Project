const factory = require('../utils/handlerFactory');
const ModeratorLog = require('../models/ModeratorLog');

exports.getAll = factory.getAll(ModeratorLog);
exports.getOne = factory.getOne(ModeratorLog);
exports.createOne = factory.createOne(ModeratorLog);
exports.updateOne = factory.updateOne(ModeratorLog);
exports.deleteOne = factory.deleteOne(ModeratorLog);
