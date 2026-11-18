const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
const {
    getMoviePerformance,
    getMoviePerformanceSummary,
    triggerMoviePerformanceCompute,
    getCustomerAnalytics,
    triggerCustomerAnalyticsCompute
} = require('../controllers/analytics');
const router = express.Router();

router.use(requireAuth, requirePermission('analytics:read'));

router.get('/movies', getMoviePerformance);
router.get('/movies/summary', getMoviePerformanceSummary);
router.post('/movies/compute', requirePermission('admin:access'), triggerMoviePerformanceCompute);
router.get('/customers', getCustomerAnalytics);
router.post('/customers/compute', requirePermission('admin:access'), triggerCustomerAnalyticsCompute);

module.exports = router;