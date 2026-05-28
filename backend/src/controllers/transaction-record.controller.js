const factory = require('../utils/handlerFactory');
const TransactionRecord = require('../models/TransactionRecord');

exports.getAll = factory.getAll(TransactionRecord);
exports.getOne = factory.getOne(TransactionRecord);
exports.createOne = factory.createOne(TransactionRecord);
exports.updateOne = factory.updateOne(TransactionRecord);
exports.deleteOne = factory.deleteOne(TransactionRecord);
