const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getMovieReviews,
    getMyReviews,
    createReview,
    updateReview,
    deleteReview,
} = require('../controllers/review');

const router = express.Router();

router.get('/movie/:movieId', getMovieReviews);
router.get('/my', requireAuth, getMyReviews);
router.post('/', requireAuth, createReview);
router.put('/:reviewId', requireAuth, updateReview);
router.delete('/:reviewId', requireAuth, deleteReview);

module.exports = router;