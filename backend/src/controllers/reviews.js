const mongoose = require('mongoose');
const Review = require('../models/review');
const Movie = require('../models/movie');
const Order = require('../models/order');

async function recalculateMovieRating(movieId) {
    const stats = await Review.aggregate([
        { $match: { movie: new mongoose.Types.ObjectId(movieId) } },
        { $group: { _id: '$movie', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const { avg = 0, count = 0 } = stats[0] || {};

    await Movie.findByIdAndUpdate(movieId, {
        averageRating: Number(avg.toFixed(2)),
        reviewCount: count,
    });
}

async function userHasCompletedOrderForMovie(userId, movieId) {
    const order = await Order.findOne({
        user: userId,
        movie: movieId,
        paymentStatus: 'paid',
    });
    return !!order;
}

async function getMovieReviews(req, res, next) {
    try {
        const { movieId } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            Review.find({ movie: movieId })
                .populate('user', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Review.countDocuments({ movie: movieId }),
        ]);

        res.json({
            reviews,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        next(err);
    }
}

async function getMyReviews(req, res, next) {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .populate('movie', 'title posterUrl rating duration genres')
            .sort({ createdAt: -1 });

        res.json({ reviews });
    } catch (err) {
        next(err);
    }
}

async function createReview(req, res, next) {
    try {
        const { movieId, rating, comment } = req.body;

        const movie = await Movie.findById(movieId);
        if (!movie) return res.status(404).json({ error: 'Movie not found.' });

        const eligible = await userHasCompletedOrderForMovie(req.user.id, movieId);
        if (!eligible) return res.status(403).json({ error: "You haven't purchased a ticket for this movie yet." });

        const existing = await Review.findOne({ user: req.user.id, movie: movieId });
        if (existing) return res.status(400).json({ error: 'You have already reviewed this movie.' });

        const review = await Review.create({
            user: req.user.id,
            movie: movieId,
            rating,
            comment,
        });

        await recalculateMovieRating(movieId);

        await review.populate('user', 'name');
        res.status(201).json({ review });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'You have already reviewed this movie.' });
        next(err);
    }
}

async function updateReview(req, res, next) {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) return res.status(404).json({ error: 'Review not found.', });

        if (review.user.toString() !== req.user.id) return res.status(403).json({ error: 'You can only edit your own reviews.', });

        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();

        await recalculateMovieRating(review.movie);

        await review.populate([
            {
                path: 'user',
                select: 'name',
            },
            {
                path: 'movie',
                select: 'title posterUrl rating duration genres',
            },
        ]);

        res.json({ review });
    } catch (err) {
        next(err);
    }
}

async function deleteReview(req, res, next) {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ error: 'Review not found.' });
        if (review.user.toString() !== req.user.id) return res.status(403).json({ error: 'You can only delete your own reviews.' });

        const movieId = review.movie;
        await review.deleteOne();
        await recalculateMovieRating(movieId);

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getMovieReviews,
    getMyReviews,
    createReview,
    updateReview,
    deleteReview,
    recalculateMovieRating,
};