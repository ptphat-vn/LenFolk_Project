const factory = require('../utils/handlerFactory');
const AuditLog = require('../models/AuditLog');

exports.getAll = factory.getAll(AuditLog);
exports.getOne = factory.getOne(AuditLog);
exports.createOne = factory.createOne(AuditLog);
exports.updateOne = factory.updateOne(AuditLog);
exports.deleteOne = factory.deleteOne(AuditLog);
