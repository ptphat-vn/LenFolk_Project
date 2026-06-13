const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

const router = express.Router();

// ─── Swagger UI ──────────────────────────────────────────────────────────────
router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'LenFolk API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
    },
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar .topbar-wrapper img { content: url(''); }
    `,
  }),
);

// ─── API Routes ───────────────────────────────────────────────────────────────
router.use('/auth', require('./auth.route'));
router.use('/users', require('./user.route'));
router.use('/courses', require('./course.route'));
router.use('/performances', require('./performance.route'));
router.use('/lessons', require('./lesson.route'));
router.use('/instructor-profiles', require('./instructor-profile.route'));
router.use('/badges', require('./badge.route'));
router.use('/notifications', require('./notification.route'));
router.use('/progress', require('./progress.route'));
router.use('/practice-sessions', require('./practice-session.route'));
router.use('/streaks', require('./streak.route'));
router.use('/enrollments', require('./enrollment.route'));
router.use('/transaction-records', require('./transaction-record.route'));
router.use('/permissions', require('./permission.route'));
router.use('/audit-logs', require('./audit-log.route'));
router.use('/coupons', require('./coupon.route'));
router.use('/wallets', require('./wallet.route'));
router.use('/payments', require('./sepay.route'));

module.exports = router;
