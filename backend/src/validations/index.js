const auth = require('./auth');
const cinema = require('./cinema');
const movie = require('./movie');
const order = require('./order');
const role = require('./role');
const screen = require('./screen');
const seat = require('./seat');
const seatHold = require('./seatHold');
const showtime = require('./showtime');
const snack = require('./snack');
const user = require('./user');
const { validateBody, validateQuery, validateParams } = require('./common');

module.exports = {
    auth,
    cinema,
    movie,
    order,
    role,
    screen,
    seat,
    seatHold,
    showtime,
    snack,
    user,
    validateBody,
    validateQuery,
    validateParams,
};