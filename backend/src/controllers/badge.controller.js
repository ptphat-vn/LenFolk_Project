const factory = require('../utils/handlerFactory');
const { Badge } = require('../models/Badge');

exports.getAll = factory.getAll(Badge);
exports.getOne = factory.getOne(Badge);
exports.createOne = factory.createOne(Badge);
exports.updateOne = factory.updateOne(Badge);
exports.deleteOne = factory.deleteOne(Badge);
