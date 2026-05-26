const factory = require('../utils/handlerFactory');
const Lesson = require('../models/Lesson');

exports.getAll = factory.getAll(Lesson);
exports.getOne = factory.getOne(Lesson);
exports.createOne = factory.createOne(Lesson);
exports.updateOne = factory.updateOne(Lesson);
exports.deleteOne = factory.deleteOne(Lesson);
