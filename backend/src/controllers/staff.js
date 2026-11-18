const Staff = require('../models/staff');
const Shift = require('../models/shift');
const User = require('../models/user');

function managerScope(req) {
    return String(req.activeRole?.name || '').toLowerCase() === 'cinema_manager'
        ? req.accessScope?.cinemaId
        : null;
}

async function findStaffInScope(req, id) {
    const cinemaId = managerScope(req);
    return Staff.findOne({ _id: id, ...(cinemaId ? { cinema: cinemaId } : {}) });
}

async function getAllStaff(req, res, next) {
    try {
        const { cinema, position, isActive, page = 1, limit = 20 } = req.query;
        const filter = {};
        const cinemaId = managerScope(req);
        if (cinemaId) filter.cinema = cinemaId;
        else if (cinema) filter.cinema = cinema;
        if (position) filter.position = position;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const skip = (safePage - 1) * safeLimit;
        const [staff, total] = await Promise.all([
            Staff.find(filter).populate('user', 'name email').populate('cinema', 'name location')
                .sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
            Staff.countDocuments(filter),
        ]);
        return res.json({ success: true, total, page: safePage, pages: Math.ceil(total / safeLimit) || 1, data: staff });
    } catch (err) { return next(err); }
}

async function getStaffById(req, res, next) {
    try {
        const staff = await findStaffInScope(req, req.params.id);
        if (!staff) return res.status(404).json({ error: 'Staff member not found.' });
        await staff.populate([{ path: 'user', select: 'name email' }, { path: 'cinema', select: 'name location' }]);
        return res.json({ success: true, data: staff });
    } catch (err) { return next(err); }
}

async function getMyStaffProfile(req, res, next) {
    try {
        const staff = await Staff.findOne({ user: req.user._id, isActive: true }).populate('cinema', 'name location');
        if (!staff) return res.status(404).json({ error: 'Staff profile not found.' });
        const upcomingShifts = await Shift.find({ staff: staff._id, startTime: { $gte: new Date() }, status: { $in: ['scheduled', 'confirmed'] } })
            .sort({ startTime: 1 }).limit(10);
        return res.json({ success: true, data: { staff, upcomingShifts } });
    } catch (err) { return next(err); }
}

async function createStaff(req, res, next) {
    try {
        const { user, employeeId, position, cinema, hireDate, hourlyRate, notes } = req.body;
        if (!user || !employeeId || !cinema) return res.status(400).json({ error: 'user, employeeId, and cinema are required.' });
        const scopedCinema = managerScope(req);
        if (scopedCinema && String(scopedCinema) !== String(cinema)) return res.status(403).json({ error: 'You can only manage staff at your assigned cinema.' });
        const userExists = await User.findById(user);
        if (!userExists) return res.status(404).json({ error: 'User not found.' });
        const existing = await Staff.findOne({ $or: [{ user }, { employeeId }] });
        if (existing) return res.status(409).json({ error: 'A staff record already exists for this user or employeeId.' });
        const staff = await Staff.create({ user, employeeId, position, cinema, hireDate, hourlyRate, notes });
        await staff.populate([{ path: 'user', select: 'name email' }, { path: 'cinema', select: 'name location' }]);
        return res.status(201).json({ success: true, data: staff });
    } catch (err) { return next(err); }
}

async function updateStaff(req, res, next) {
    try {
        const existing = await findStaffInScope(req, req.params.id);
        if (!existing) return res.status(404).json({ error: 'Staff member not found.' });
        const scopedCinema = managerScope(req);
        if (scopedCinema && req.body.cinema && String(req.body.cinema) !== String(scopedCinema)) return res.status(403).json({ error: 'You cannot move staff outside your assigned cinema.' });

        const allowed = ['position', 'cinema', 'hireDate', 'hourlyRate', 'isActive', 'notes'];
        const updates = {};
        for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
        const staff = await Staff.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
            .populate('user', 'name email').populate('cinema', 'name location');
        return res.json({ success: true, data: staff });
    } catch (err) { return next(err); }
}

async function toggleStaffActive(req, res, next) {
    try {
        const staff = await findStaffInScope(req, req.params.id);
        if (!staff) return res.status(404).json({ error: 'Staff member not found.' });
        staff.isActive = !staff.isActive;
        await staff.save();
        return res.json({ success: true, data: staff });
    } catch (err) { return next(err); }
}

async function deleteStaff(req, res, next) {
    try {
        const staff = await findStaffInScope(req, req.params.id);
        if (!staff) return res.status(404).json({ error: 'Staff member not found.' });
        await staff.deleteOne();
        await Shift.deleteMany({ staff: staff._id, startTime: { $gte: new Date() }, status: 'scheduled' });
        return res.json({ success: true, message: 'Staff member removed.' });
    } catch (err) { return next(err); }
}

module.exports = { getAllStaff, getStaffById, getMyStaffProfile, createStaff, updateStaff, toggleStaffActive, deleteStaff };