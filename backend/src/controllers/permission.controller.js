const factory = require('../utils/handlerFactory');
const { Permission } = require('../models/Permission');

exports.getAll = factory.getAll(Permission);
exports.getOne = factory.getOne(Permission);
exports.createOne = factory.createOne(Permission);
exports.updateOne = factory.updateOne(Permission);
exports.deleteOne = factory.deleteOne(Permission);
