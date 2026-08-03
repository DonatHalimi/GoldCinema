const express = require('express');
const router = express.Router();
const factory = require('../controllers/adminFactory');

const { protect, authorize } = require('../middleware/auth');

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

const registerAdminResource = (path, Model, populateOpts = '') => {
    router.get(`/${path}`, factory.getAll(Model, populateOpts));
    router.get(`/${path}/:id`, factory.getOne(Model, populateOpts));
    router.post(`/${path}`, factory.createOne(Model));
    router.put(`/${path}/:id`, factory.updateOne(Model));
    router.delete(`/${path}/:id`, factory.deleteOne(Model));
    router.delete(`/${path}`, factory.deleteMany(Model));
};

registerAdminResource('users', User, 'role');
registerAdminResource('roles', Role);
registerAdminResource('movies', Movie);
registerAdminResource('cinemas', Cinema);
registerAdminResource('screens', Screen, 'cinema');
registerAdminResource('seats', Seat, 'screen');
registerAdminResource('showtimes', Showtime, 'movie screen');
registerAdminResource('seatholds', SeatHold, 'showtime user');
registerAdminResource('snacks', Snack);
registerAdminResource('orders', Order, 'user showtime snacks.snack');

module.exports = router;