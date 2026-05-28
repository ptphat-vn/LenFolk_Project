const factory = require('../utils/handlerFactory');
const InstructorProfile = require('../models/InstructorProfile');

exports.getAll = factory.getAll(InstructorProfile);
exports.getOne = factory.getOne(InstructorProfile);
exports.createOne = factory.createOne(InstructorProfile);
exports.updateOne = factory.updateOne(InstructorProfile);
exports.deleteOne = factory.deleteOne(InstructorProfile);
