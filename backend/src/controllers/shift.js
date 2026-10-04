const Shift = require('../models/shift');
const Staff = require('../models/staff');

async function getAllShifts(req, res, next) {
    try {
        const { staff, cinema, status, from, to, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (staff) filter.staff = staff;
        if (cinema) filter.cinema = cinema;
        if (status) filter.status = status;
        if (from || to) {
            filter.startTime = {};
            if (from) filter.startTime.$gte = new Date(from);
            if (to) filter.startTime.$lte = new Date(to);
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [shifts, total] = await Promise.all([
            Shift.find(filter)
                .populate({
                    path: 'staff',
                    populate: { path: 'user', select: 'name email' },
                })
                .populate('cinema', 'name location')
                .sort({ startTime: 1 })
                .skip(skip)
                .limit(parseInt(limit, 10)),
            Shift.countDocuments(filter),
        ]);

        res.json({
            success: true,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)) || 1,
            data: shifts,
        });
    } catch (err) {
        next(err);
    }
}

async function getShiftById(req, res, next) {
    try {
        const shift = await Shift.findById(req.params.id)
            .populate({
                path: 'staff',
                populate: { path: 'user', select: 'name email' },
            })
            .populate('cinema', 'name location');

        if (!shift) return res.status(404).json({ error: 'Shift not found.' });

        res.json({ success: true, data: shift });
    } catch (err) {
        next(err);
    }
}

async function getMyShifts(req, res, next) {
    try {
        const staff = await Staff.findOne({ user: req.user.id });
        if (!staff) return res.status(404).json({ error: 'Staff profile not found.' });

        const { from, to, status } = req.query;
        const filter = { staff: staff._id };

        if (status) filter.status = status;
        if (from || to) {
            filter.startTime = {};
            if (from) filter.startTime.$gte = new Date(from);
            if (to) filter.startTime.$lte = new Date(to);
        }

        const shifts = await Shift.find(filter)
            .populate('cinema', 'name location')
            .sort({ startTime: 1 });

        res.json({ success: true, data: shifts });
    } catch (err) {
        next(err);
    }
}

async function createShift(req, res, next) {
    try {
        const { staff, cinema, startTime, endTime, role, notes } = req.body;

        if (!staff || !cinema || !startTime || !endTime) return res.status(400).json({ error: 'staff, cinema, startTime, and endTime are required.' });

        if (new Date(startTime) >= new Date(endTime)) return res.status(400).json({ error: 'startTime must be before endTime.' });

        const conflict = await Shift.findOne({
            staff,
            status: { $in: ['scheduled', 'confirmed'] },
            $or: [
                { startTime: { $lt: new Date(endTime) }, endTime: { $gt: new Date(startTime) } },
            ],
        });
        if (conflict) {
            return res.status(409).json({
                error: 'Staff member already has an overlapping shift.',
                conflictId: conflict._id,
            });
        }

        const shift = await Shift.create({
            staff,
            cinema,
            startTime,
            endTime,
            role,
            notes,
        });

        res.status(201).json({ success: true, data: shift });
    } catch (err) {
        next(err);
    }
}

async function updateShift(req, res, next) {
    try {
        const allowed = ['startTime', 'endTime', 'role', 'status', 'notes'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const shift = await Shift.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!shift) {
            return res.status(404).json({ error: 'Shift not found.' });
        }

        res.json({ success: true, data: shift });
    } catch (err) {
        next(err);
    }
}

async function updateShiftStatus(req, res, next) {
    try {
        const { status } = req.body;
        const valid = ['scheduled', 'confirmed', 'completed', 'no_show', 'cancelled'];
        if (!valid.includes(status)) return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });

        const shift = await Shift.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );

        if (!shift) return res.status(404).json({ error: 'Shift not found.' });

        res.json({ success: true, data: shift });
    } catch (err) {
        next(err);
    }
}

async function deleteShift(req, res, next) {
    try {
        const shift = await Shift.findByIdAndDelete(req.params.id);
        if (!shift) return res.status(404).json({ error: 'Shift not found.' });

        res.json({ success: true, message: 'Shift deleted.' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllShifts,
    getShiftById,
    getMyShifts,
    createShift,
    updateShift,
    updateShiftStatus,
    deleteShift,
};