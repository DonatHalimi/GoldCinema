const express = require('express');
const router = express.Router();
const factory = require('../controllers/adminFactory');

const { protect, authorize } = require('../middleware/auth');

const User = require('../models/User');
const Role = require('../models/Role');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');
const Seat = require('../models/Seat');
const Showtime = require('../models/Showtime');
const SeatHold = require('../models/SeatHold');
const Snack = require('../models/Snack');
const Order = require('../models/Order');

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