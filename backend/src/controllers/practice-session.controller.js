const factory = require('../utils/handlerFactory');
const PracticeSession = require('../models/PracticeSession');

exports.getAll = factory.getAll(PracticeSession);
exports.getOne = factory.getOne(PracticeSession);
exports.createOne = factory.createOne(PracticeSession);
exports.updateOne = factory.updateOne(PracticeSession);
exports.deleteOne = factory.deleteOne(PracticeSession);
