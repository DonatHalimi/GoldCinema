const express = require('express');
const router = express.Router();
const {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
    deleteMany,
    softDeleteOne,
    softDeleteMany,
} = require('../controllers/adminFactory');
const { getUsers, getUser, createUser, updateUser, deleteUser, deleteUsersBulk } = require('../controllers/adminUsers');
const { requirePermission } = require('../middleware/roleAccess');
const { requireAuth } = require('../middleware/auth');
const {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
} = require('../controllers/staff');
const {
    getAllShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift,
} = require('../controllers/shift');

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
const ScreenConfiguration = require('../models/screenConfiguration');
const Equipment = require('../models/equipment');
const MaintenanceLog = require('../models/maintenanceLog');
const MoviePerformance = require('../models/moviePerformance');
const CustomerAnalytics = require('../models/customerAnalytics');
const { validateBody } = require('../validations/common');
const { adminUserCreateSchema } = require('../validations/user');
const { snackCreateSchema, snackUpdateSchema } = require('../validations/snack');

router.use(requireAuth);

const registerAdminResource = (path, Model, populateOpts = '') => {
    const adminAccess = requirePermission('admin:access');
    router.get(`/${path}`, adminAccess, getAll(Model, populateOpts));
    router.get(`/${path}/:id`, adminAccess, getOne(Model, populateOpts));
    router.post(`/${path}`, adminAccess, createOne(Model));
    router.put(`/${path}/:id`, adminAccess, updateOne(Model));
    router.delete(`/${path}/bulk-delete`, adminAccess, deleteMany(Model));
    router.delete(`/${path}/:id`, adminAccess, deleteOne(Model));
};

router.get('/users', requirePermission('users:read'), getUsers);
router.get('/users/:id', requirePermission('users:read'), getUser);
router.post('/users', requirePermission('users:manage'), validateBody(adminUserCreateSchema), createUser);
router.put('/users/:id', requirePermission('users:manage'), updateUser);
router.delete('/users/bulk-delete', requirePermission('users:manage'), deleteUsersBulk);
router.delete('/users/:id', requirePermission('users:manage'), deleteUser);

router.get('/staff', requirePermission('staff:read'), getAllStaff);
router.get('/staff/:id', requirePermission('staff:read'), getStaffById);
router.post('/staff', requirePermission('staff:manage'), createStaff);
router.put('/staff/:id', requirePermission('staff:manage'), updateStaff);
router.delete('/staff/:id', requirePermission('staff:manage'), deleteStaff);

router.get('/shifts', requirePermission('shifts:read'), getAllShifts);
router.get('/shifts/:id', requirePermission('shifts:read'), getShiftById);
router.post('/shifts', requirePermission('shifts:manage'), createShift);
router.put('/shifts/:id', requirePermission('shifts:manage'), updateShift);
router.delete('/shifts/:id', requirePermission('shifts:manage'), deleteShift);

const snackAdminAccess = requirePermission('admin:access');
const activeSnacks = { isDeleted: { $ne: true } };
router.get('/snacks', snackAdminAccess, getAll(Snack, '', activeSnacks));
router.get('/snacks/:id', snackAdminAccess, getOne(Snack, '', activeSnacks));
router.post('/snacks', snackAdminAccess, validateBody(snackCreateSchema), createOne(Snack));
router.put('/snacks/:id', snackAdminAccess, validateBody(snackUpdateSchema), updateOne(Snack));
router.delete('/snacks/bulk-delete', snackAdminAccess, softDeleteMany(Snack));
router.delete('/snacks/:id', snackAdminAccess, softDeleteOne(Snack));

registerAdminResource('roles', Role);
registerAdminResource('movies', Movie);
registerAdminResource('cinemas', Cinema);
registerAdminResource('screens', Screen);
registerAdminResource('seats', Seat, 'screen');
registerAdminResource('showtimes', Showtime, 'movie screen');
registerAdminResource('seatholds', SeatHold, 'showtime user');
registerAdminResource('orders', Order, [
    { path: 'user', select: 'name fullName' },
    { path: 'movie', select: 'title posterUrl' },
    { path: 'showtime', select: 'startTime' },
    { path: 'snacks.snack' },
]);
registerAdminResource('contacts', Contact, 'user');
registerAdminResource('reviews', Review, 'user movie');
registerAdminResource('translations', TranslationKey);
registerAdminResource('screen-configurations', ScreenConfiguration, 'screen');
registerAdminResource('equipment', Equipment, 'cinema');
registerAdminResource('maintenance-logs', MaintenanceLog, 'equipment');
registerAdminResource('movie-performance', MoviePerformance, 'movie');
registerAdminResource('customer-analytics', CustomerAnalytics, 'user');

module.exports = router;