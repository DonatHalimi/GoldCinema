const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getMoviePerformance,
    getMoviePerformanceSummary,
    triggerMoviePerformanceCompute,
    getCustomerAnalytics,
    triggerCustomerAnalyticsCompute,
} = require('../controllers/analytics');

const router = express.Router();

router.use(requireAuth);

router.get('/movies', getMoviePerformance);
router.get('/movies/summary', getMoviePerformanceSummary);
router.post('/movies/compute', triggerMoviePerformanceCompute);

router.get('/customers', getCustomerAnalytics);
router.post('/customers/compute', triggerCustomerAnalyticsCompute);

module.exports = router;