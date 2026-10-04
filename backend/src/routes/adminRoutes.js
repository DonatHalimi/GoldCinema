const express = require('express');
const router = express.Router();
const {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
    deleteMany,
} = require('../controllers/adminFactory');

const User = require('../models/user');
const Role = require('../models/role');
const Movie = require('../models/movie');
const Cinema = require('../models/cinema');
const Screen = require('../models/screen');
const Seat = require('../models/seat');
const Showtime = require('../models/showtime');
const SeatHold = require('../models/seatHold');
const Snack = require('../models/snack');
const Order = require('../models/order');
const Contact = require('../models/contact');
const Review = require('../models');
const TranslationKey = require('../models/translationKey');
const Staff = require('../models/staff');
const Shift = require('../models/shift');
const ScreenConfiguration = require('../models/screenConfiguration');
const Equipment = require('../models/equipment');
const MaintenanceLog = require('../models/maintenanceLog');
const MoviePerformance = require('../models/moviePerformance');
const CustomerAnalytics = require('../models/customerAnalytics');

const registerAdminResource = (path, Model, populateOpts = '') => {
    router.get(`/${path}`, getAll(Model, populateOpts));
    router.get(`/${path}/:id`, getOne(Model, populateOpts));
    router.post(`/${path}`, createOne(Model));
    router.put(`/${path}/:id`, updateOne(Model));
    router.delete(`/${path}/:id`, deleteOne(Model));
    router.delete(`/${path}`, deleteMany(Model));
};

registerAdminResource('users', User, {
    path: 'role',
    select: 'name',
});
registerAdminResource('roles', Role);
registerAdminResource('movies', Movie);
registerAdminResource('cinemas', Cinema);
registerAdminResource('screens', Screen);
registerAdminResource('seats', Seat, 'screen');
registerAdminResource('showtimes', Showtime, 'movie screen');
registerAdminResource('seatholds', SeatHold, 'showtime user');
registerAdminResource('snacks', Snack);
registerAdminResource('orders', Order, [
    { path: 'user', select: 'name fullName' },
    { path: 'movie', select: 'title posterUrl' },
    { path: 'showtime', select: 'startTime' },
    { path: 'snacks.snack' },
]);
registerAdminResource('contacts', Contact, 'user');
registerAdminResource('reviews', Review, 'user movie');
registerAdminResource('translations', TranslationKey);
registerAdminResource('staff', Staff, 'user cinema');
registerAdminResource('shifts', Shift, 'staff cinema');
registerAdminResource('screen-configurations', ScreenConfiguration, 'screen');
registerAdminResource('equipment', Equipment, 'cinema');
registerAdminResource('maintenance-logs', MaintenanceLog, 'equipment');
registerAdminResource('movie-performance', MoviePerformance, 'movie');
registerAdminResource('customer-analytics', CustomerAnalytics, 'user');

module.exports = router;