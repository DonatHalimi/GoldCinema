const Staff = require('../models/staff');
const Shift = require('../models/shift');
const User = require('../models/user');

async function getAllStaff(req, res, next) {
    try {
        const { cinema, position, isActive, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (cinema) filter.cinema = cinema;
        if (position) filter.position = position;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [staff, total] = await Promise.all([
            Staff.find(filter)
                .populate('user', 'name email')
                .populate('cinema', 'name location')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10)),
            Staff.countDocuments(filter),
        ]);

        res.json({
            success: true,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)) || 1,
            data: staff,
        });
    } catch (err) {
        next(err);
    }
}

async function getStaffById(req, res, next) {
    try {
        const staff = await Staff.findById(req.params.id)
            .populate('user', 'name email')
            .populate('cinema', 'name location');

        if (!staff) return res.status(404).json({ error: 'Staff member not found.' });

        res.json({ success: true, data: staff });
    } catch (err) {
        next(err);
    }
}

async function getMyStaffProfile(req, res, next) {
    try {
        const staff = await Staff.findOne({ user: req.user.id }).populate('cinema', 'name location');

        if (!staff) return res.status(404).json({ error: 'Staff profile not found.' });

        const upcomingShifts = await Shift.find({
            staff: staff._id,
            startTime: { $gte: new Date() },
            status: { $in: ['scheduled', 'confirmed'] },
        })
            .sort({ startTime: 1 })
            .limit(10);

        res.json({ success: true, data: { staff, upcomingShifts } });
    } catch (err) {
        next(err);
    }
}

async function createStaff(req, res, next) {
    try {
        const { user, employeeId, position, cinema, hireDate, hourlyRate, notes } = req.body;

        if (!user || !employeeId || !cinema) return res.status(400).json({ error: 'user, employeeId, and cinema are required.' });

        const userExists = await User.findById(user);
        if (!userExists) return res.status(404).json({ error: 'User not found.' });

        const existing = await Staff.findOne({ $or: [{ user }, { employeeId }], });
        if (existing) return res.status(409).json({ error: 'A staff record already exists for this user or employeeId.', });

        const staff = await Staff.create({
            user,
            employeeId,
            position,
            cinema,
            hireDate,
            hourlyRate,
            notes,
        });

        const populated = await staff.populate([
            { path: 'user', select: 'name email' },
            { path: 'cinema', select: 'name location' },
        ]);

        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        next(err);
    }
}

async function updateStaff(req, res, next) {
    try {
        const allowed = ['position', 'cinema', 'hireDate', 'hourlyRate', 'isActive', 'notes'];
        const updates = {};
        for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];

        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        )
            .populate('user', 'name email')
            .populate('cinema', 'name location');

        if (!staff) return res.status(404).json({ error: 'Staff member not found.' });

        res.json({ success: true, data: staff });
    } catch (err) {
        next(err);
    }
}

async function toggleStaffActive(req, res, next) {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) return res.status(404).json({ error: 'Staff member not found.' });

        staff.isActive = !staff.isActive;
        await staff.save();

        res.json({ success: true, data: staff });
    } catch (err) {
        next(err);
    }
}

async function deleteStaff(req, res, next) {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) return res.status(404).json({ error: 'Staff member not found.' });

        await Shift.deleteMany({
            staff: staff._id,
            startTime: { $gte: new Date() },
            status: 'scheduled',
        });

        res.json({ success: true, message: 'Staff member removed.' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllStaff,
    getStaffById,
    getMyStaffProfile,
    createStaff,
    updateStaff,
    toggleStaffActive,
    deleteStaff,
};