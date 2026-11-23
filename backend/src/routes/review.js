const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getMovieReviews,
    getMyReviews,
    createReview,
    updateReview,
    deleteReview,
} = require('../controllers/reviews');
const { requirePermission } = require('../middleware/roleAccess');

const router = express.Router();

router.get('/movie/:movieId', getMovieReviews);
router.get('/my', requireAuth, requirePermission('reviews:read'), getMyReviews);
router.post('/', requireAuth, requirePermission('reviews:manage'), createReview);
router.put('/:reviewId', requireAuth, requirePermission('reviews:manage'), updateReview);
router.delete('/:reviewId', requireAuth, requirePermission('reviews:manage'), deleteReview);

module.exports = router;