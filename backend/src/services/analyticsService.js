const Order = require('../models/order');
const Showtime = require('../models/showtime');
const Movie = require('../models/movie');
const Screen = require('../models/screen');
const User = require('../models/user');
const MoviePerformance = require('../models/moviePerformance');
const CustomerAnalytics = require('../models/customerAnalytics');

async function computeMoviePerformance(startDate, endDate) {
    const match = { paymentStatus: 'paid', createdAt: { $gte: startDate, $lte: endDate }, };

    const orderAgg = await Order.aggregate([
        { $match: match },
        {
            $lookup: {
                from: 'showtimes',
                localField: 'showtime',
                foreignField: '_id',
                as: 'showtimeData',
            },
        },
        { $unwind: '$showtimeData' },
        {
            $group: {
                _id: {
                    movie: '$movie',
                    date: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                },
                ticketsSold: { $sum: { $size: '$seats' } },
                revenue: { $sum: '$totalAmount' },
                showtimes: { $addToSet: '$showtime' },
            },
        },
        {
            $project: {
                _id: 1,
                ticketsSold: 1,
                revenue: 1,
                showtimeCount: { $size: '$showtimes' },
            },
        },
    ]);

    const results = [];
    for (const row of orderAgg) {
        const { movie, date } = row._id;
        const showtimeCount = row.showtimeCount;

        const showtimeDocs = await Showtime.find({
            movie,
            startTime: {
                $gte: new Date(`${date}T00:00:00.000Z`),
                $lt: new Date(`${date}T23:59:59.999Z`),
            },
        })
            .select('screen')
            .lean();

        const screenIds = [...new Set(showtimeDocs.map((s) => String(s.screen)))];
        const screens = await Screen.find({ _id: { $in: screenIds } })
            .select('rows columns')
            .lean();

        const totalCapacity = screens.reduce(
            (sum, s) => sum + (s.rows || 0) * (s.columns || 0),
            0
        );
        const averageOccupancy = totalCapacity > 0
            ? Math.round((row.ticketsSold / totalCapacity) * 100)
            : 0;

        const movieDoc = await Movie.findById(movie).select('averageRating').lean();

        results.push({
            movie,
            date: new Date(`${date}T00:00:00.000Z`),
            showtimeCount,
            ticketsSold: row.ticketsSold,
            revenue: row.revenue,
            averageOccupancy,
            rating: movieDoc?.averageRating || 0,
        });
    }

    for (const result of results) {
        await MoviePerformance.findOneAndUpdate(
            { movie: result.movie, date: result.date },
            { $set: result },
            { upsert: true, new: true }
        );
    }

    return results;
}

async function computeCustomerAnalytics() {
    const userAgg = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
            $group: {
                _id: '$user',
                totalSpent: { $sum: '$totalAmount' },
                visitCount: { $sum: 1 },
                lastVisitDate: { $max: '$createdAt' },
                movies: { $addToSet: '$movie' },
            },
        },
    ]);

    const now = new Date();

    for (const row of userAgg) {
        const userId = row._id;

        const movies = await Movie.find({ _id: { $in: row.movies } })
            .select('genres')
            .lean();

        const genreCount = {};
        for (const m of movies) {
            for (const g of m.genres || []) {
                genreCount[g] = (genreCount[g] || 0) + 1;
            }
        }
        const favouriteGenre = Object.keys(genreCount).length > 0
            ? Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0][0]
            : null;

        const daysSinceLastVisit = row.lastVisitDate
            ? Math.floor((now - new Date(row.lastVisitDate)) / (1000 * 60 * 60 * 24))
            : 999;

        let churnRisk = 'low';
        if (daysSinceLastVisit > 90) churnRisk = 'high';
        else if (daysSinceLastVisit > 45) churnRisk = 'medium';

        await CustomerAnalytics.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                    totalSpent: row.totalSpent,
                    visitCount: row.visitCount,
                    favouriteGenre,
                    lastVisitDate: row.lastVisitDate,
                    lifetimeValue: row.totalSpent,
                    churnRisk,
                    lastComputedAt: now,
                },
            },
            { upsert: true, new: true }
        );
    }

    const usersWithOrders = new Set(userAgg.map((u) => String(u._id)));
    const allUsers = await User.find({ isActive: true }).select('_id').lean();

    for (const u of allUsers) {
        if (!usersWithOrders.has(String(u._id))) {
            await CustomerAnalytics.findOneAndUpdate(
                { user: u._id },
                {
                    $set: {
                        totalSpent: 0,
                        visitCount: 0,
                        favouriteGenre: null,
                        lastVisitDate: null,
                        lifetimeValue: 0,
                        churnRisk: 'unknown',
                        lastComputedAt: now,
                    },
                },
                { upsert: true, new: true }
            );
        }
    }
}

module.exports = { computeMoviePerformance, computeCustomerAnalytics };