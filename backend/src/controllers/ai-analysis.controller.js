const Enrollment = require('../models/Enrollment');
const aiAnalysisService = require('../services/ai-analysis.service');

const isActivePaidEnrollment = (enrollment) => {
  if (!enrollment.isPaid || enrollment.status !== 'active') return false;
  if (!enrollment.endDate) return true;
  return enrollment.endDate.getTime() >= Date.now();
};

const getAnalysisProviderForUser = async (user) => {
  if (user.isSubscribed) return 'openai';

  const enrollment = await Enrollment.findOne({
    userId: user._id,
    status: 'active',
    isPaid: true,
    itemType: 'course',
    $or: [{ endDate: null }, { endDate: { $gte: new Date() } }],
  }).select('_id status isPaid endDate');

  return enrollment && isActivePaidEnrollment(enrollment) ? 'openai' : 'gemini';
};

const analyze = (mode) => async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng gửi file audio/video trong field "file"',
      });
    }

    const provider = await getAnalysisProviderForUser(req.user);
    const result = await aiAnalysisService.analyzePracticeMedia({
      provider,
      file: req.file,
      message: req.body.message,
      mode,
      fast: req.body.fast !== 'false',
      useLlm: req.body.useLlm !== 'false',
    });

    res.status(200).json({
      success: true,
      provider,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.basic = analyze('basic');
exports.advanced = analyze('advanced');
