const factory = require('../utils/handlerFactory');
const Course = require('../models/Course');

exports.getAll = factory.getAll(Course);
exports.getOne = factory.getOne(Course);
exports.createOne = factory.createOne(Course);
exports.updateOne = factory.updateOne(Course);
exports.deleteOne = factory.deleteOne(Course);
