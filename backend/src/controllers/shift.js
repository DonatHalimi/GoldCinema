const Shift = require('../models/shift');
const Staff = require('../models/staff');

function managerCinema(req) {
    return String(req.activeRole?.name || '').toLowerCase() === 'cinema_manager'
        ? req.accessScope?.cinemaId
        : null;
}

async function getAllShifts(req, res, next) {
    try {
        const { staff, cinema, status, from, to, page = 1, limit = 20 } = req.query;
        const filter = {};
        const scope = managerCinema(req);
        if (scope) filter.cinema = scope;
        else if (cinema) filter.cinema = cinema;
        if (staff) filter.staff = staff;
        if (status) filter.status = status;
        if (from || to) {
            filter.startTime = {};
            if (from) filter.startTime.$gte = new Date(from);
            if (to) filter.startTime.$lte = new Date(to);
        }
        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
        const safePage = Math.max(parseInt(page, 10) || 1, 1);
        const skip = (safePage - 1) * safeLimit;
        const [shifts, total] = await Promise.all([
            Shift.find(filter).populate({ path: 'staff', populate: { path: 'user', select: 'name email' } })
                .populate('cinema', 'name location').sort({ startTime: 1 }).skip(skip).limit(safeLimit),
            Shift.countDocuments(filter),
        ]);
        return res.json({ success: true, total, page: safePage, pages: Math.ceil(total / safeLimit) || 1, data: shifts });
    } catch (err) {
        return next(err);
    }
}

async function getShiftById(req, res, next) {
    try {
        const filter = { _id: req.params.id };
        const scope = managerCinema(req);
        if (scope) filter.cinema = scope;
        const shift = await Shift.findOne(filter).populate({ path: 'staff', populate: { path: 'user', select: 'name email' } }).populate('cinema', 'name location');
        if (!shift) return res.status(404).json({ error: 'Shift not found.' });
        return res.json({ success: true, data: shift });
    } catch (err) {
        return next(err);
    }
}

async function getMyShifts(req, res, next) {
    try {
        const staff = await Staff.findOne({ user: req.user._id, isActive: true });
        if (!staff) return res.status(404).json({ error: 'Staff profile not found.' });
        const { from, to, status } = req.query;
        const filter = { staff: staff._id };
        if (status) filter.status = status;
        if (from || to) {
            filter.startTime = {};
            if (from) filter.startTime.$gte = new Date(from);
            if (to) filter.startTime.$lte = new Date(to);
        }
        const shifts = await Shift.find(filter).populate('cinema', 'name location').sort({ startTime: 1 });
        return res.json({ success: true, data: shifts });
    } catch (err) {
        return next(err);
    }
}

async function createShift(req, res, next) {
    try {
        const { staff, cinema, startTime, endTime, role, notes } = req.body;
        if (!staff || !cinema || !startTime || !endTime) return res.status(400).json({ error: 'staff, cinema, startTime, and endTime are required.' });
        if (new Date(startTime) >= new Date(endTime)) return res.status(400).json({ error: 'startTime must be before endTime.' });
        const scope = managerCinema(req);
        if (scope && String(scope) !== String(cinema)) return res.status(403).json({ error: 'You can only create shifts at your assigned cinema.' });
        const staffRecord = await Staff.findOne({ _id: staff, ...(scope ? { cinema: scope } : {}) });
        if (!staffRecord) return res.status(404).json({ error: 'Staff member not found in your cinema.' });
        const conflict = await Shift.findOne({ staff, status: { $in: ['scheduled', 'confirmed'] }, startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } });
        if (conflict) return res.status(409).json({ error: 'Staff member already has an overlapping shift.', conflictId: conflict._id });
        const shift = await Shift.create({ staff, cinema, startTime, endTime, role, notes });
        return res.status(201).json({ success: true, data: shift });
    } catch (err) {
        return next(err);
    }
}

async function updateShift(req, res, next) {
    try {
        const scope = managerCinema(req);
        const existing = await Shift.findOne({ _id: req.params.id, ...(scope ? { cinema: scope } : {}) });
        if (!existing) return res.status(404).json({ error: 'Shift not found.' });
        const allowed = ['startTime', 'endTime', 'role', 'status', 'notes'];
        const updates = {};
        for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];
        const shift = await Shift.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
        return res.json({ success: true, data: shift });
    } catch (err) { return next(err); }
}

async function updateShiftStatus(req, res, next) {
    try {
        const { status } = req.body;
        const valid = ['scheduled', 'confirmed', 'completed', 'no_show', 'cancelled'];
        if (!valid.includes(status)) return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
        const scope = managerCinema(req);
        const shift = await Shift.findOneAndUpdate({ _id: req.params.id, ...(scope ? { cinema: scope } : {}) }, { $set: { status } }, { new: true });
        if (!shift) return res.status(404).json({ error: 'Shift not found.' });
        return res.json({ success: true, data: shift });
    } catch (err) {
        return next(err);
    }
}

async function deleteShift(req, res, next) {
    try {
        const scope = managerCinema(req);
        const shift = await Shift.findOneAndDelete({ _id: req.params.id, ...(scope ? { cinema: scope } : {}) });
        if (!shift) return res.status(404).json({ error: 'Shift not found.' });
        return res.json({ success: true, message: 'Shift deleted.' });
    } catch (err) {
        return next(err);
    }
}

module.exports = { getAllShifts, getShiftById, getMyShifts, createShift, updateShift, updateShiftStatus, deleteShift };