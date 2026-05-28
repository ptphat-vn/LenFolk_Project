const factory = require('../utils/handlerFactory');
const Notification = require('../models/Notification');

exports.getAll = factory.getAll(Notification);
exports.getOne = factory.getOne(Notification);
exports.createOne = factory.createOne(Notification);
exports.updateOne = factory.updateOne(Notification);
exports.deleteOne = factory.deleteOne(Notification);
