const Streak = require('../models/Streak');

// Only return the current user's streak records
exports.getAll = async (req, res, next) => {
  try {
    const docs = await Streak.find({ userId: req.user._id });
    res.status(200).json({ success: true, results: docs.length, data: docs });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const doc = await Streak.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
    if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to access this record' });
    }
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// Inject userId from token, prevent spoofing
exports.createOne = async (req, res, next) => {
  try {
    const doc = await Streak.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.updateOne = async (req, res, next) => {
  try {
    const doc = await Streak.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
    if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this record' });
    }
    // Prevent userId spoofing on update
    delete req.body.userId;
    const updated = await Streak.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteOne = async (req, res, next) => {
  try {
    const doc = await Streak.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'No document found with that ID' });
    if (!doc.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this record' });
    }
    await Streak.findByIdAndDelete(req.params.id);
    res.status(204).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};
