const SiteStat = require('../models/SiteStat');

// GET /api/site-stats - Lấy thống kê website (Public)
exports.getStats = async (req, res, next) => {
  try {
    const stat = await SiteStat.findOneAndUpdate(
      { key: 'global' },
      { $setOnInsert: { key: 'global' } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).select('-__v');
    res.status(200).json({ success: true, data: stat });
  } catch (err) {
    next(err);
  }
};

// POST /api/site-stats/visit - Ghi nhận 1 lượt truy cập (Public)
exports.trackVisit = async (req, res, next) => {
  try {
    const stat = await SiteStat.findOneAndUpdate(
      { key: 'global' },
      { $inc: { totalVisits: 1 } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).select('-__v');
    res.status(200).json({ success: true, data: stat });
  } catch (err) {
    next(err);
  }
};
