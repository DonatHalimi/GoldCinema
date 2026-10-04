const MoviePerformance = require('../models/moviePerformance');
const CustomerAnalytics = require('../models/customerAnalytics');
const { computeMoviePerformance, computeCustomerAnalytics } = require('../services/analyticsService');

async function getMoviePerformance(req, res, next) {
    try {
        const { movieId, from, to, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (movieId) filter.movie = movieId;
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [data, total] = await Promise.all([
            MoviePerformance.find(filter)
                .populate('movie', 'title posterUrl')
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10)),
            MoviePerformance.countDocuments(filter),
        ]);

        res.json({
            success: true,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)) || 1,
            data,
        });
    } catch (err) {
        next(err);
    }
}

async function getMoviePerformanceSummary(req, res, next) {
    try {
        const { from, to } = req.query;
        const match = {};

        if (from || to) {
            match.date = {};
            if (from) match.date.$gte = new Date(from);
            if (to) match.date.$lte = new Date(to);
        }

        const summary = await MoviePerformance.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$movie',
                    totalRevenue: { $sum: '$revenue' },
                    totalTickets: { $sum: '$ticketsSold' },
                    avgOccupancy: { $avg: '$averageOccupancy' },
                    avgRating: { $avg: '$rating' },
                    days: { $sum: 1 },
                },
            },
            { $sort: { totalRevenue: -1 } },
            {
                $lookup: {
                    from: 'movies',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'movie',
                },
            },
            { $unwind: '$movie' },
            {
                $project: {
                    movie: { title: 1, posterUrl: 1 },
                    totalRevenue: 1,
                    totalTickets: 1,
                    avgOccupancy: 1,
                    avgRating: 1,
                    days: 1,
                },
            },
        ]);

        res.json({ success: true, data: summary });
    } catch (err) {
        next(err);
    }
}

async function triggerMoviePerformanceCompute(req, res, next) {
    try {
        const { from, to } = req.body;
        const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = to ? new Date(to) : new Date();

        const results = await computeMoviePerformance(startDate, endDate);

        res.json({
            success: true,
            message: `Computed performance for ${results.length} movie-day records.`,
            data: results,
        });
    } catch (err) {
        next(err);
    }
}

async function getCustomerAnalytics(req, res, next) {
    try {
        const { churnRisk, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (churnRisk) filter.churnRisk = churnRisk;

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [data, total] = await Promise.all([
            CustomerAnalytics.find(filter)
                .populate('user', 'name email')
                .sort({ lifetimeValue: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10)),
            CustomerAnalytics.countDocuments(filter),
        ]);

        res.json({
            success: true,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)) || 1,
            data,
        });
    } catch (err) {
        next(err);
    }
}

async function triggerCustomerAnalyticsCompute(req, res, next) {
    try {
        await computeCustomerAnalytics();

        res.json({ success: true, message: 'Customer analytics computed successfully.' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getMoviePerformance,
    getMoviePerformanceSummary,
    triggerMoviePerformanceCompute,
    getCustomerAnalytics,
    triggerCustomerAnalyticsCompute,
};