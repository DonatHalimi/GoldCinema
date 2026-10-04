const Equipment = require('../models/equipment');
const Cinema = require('../models/cinema');
const MaintenanceLog = require('../models/maintenanceLog');

async function getAllEquipment(req, res, next) {
    try {
        const { cinema, type, status, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (cinema) filter.cinema = cinema;
        if (type) filter.type = type;
        if (status) filter.status = status;

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [items, total] = await Promise.all([
            Equipment.find(filter)
                .populate('cinema', 'name location')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10)),
            Equipment.countDocuments(filter),
        ]);

        res.json({
            success: true,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)) || 1,
            data: items,
        });
    } catch (err) {
        next(err);
    }
}

async function getEquipmentById(req, res, next) {
    try {
        const equipment = await Equipment.findById(req.params.id).populate('cinema', 'name location');

        if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });

        const logs = await MaintenanceLog.find({ equipment: equipment._id }).sort({ performedAt: -1 }).limit(10);

        res.json({ success: true, data: { equipment, recentLogs: logs } });
    } catch (err) {
        next(err);
    }
}

async function createEquipment(req, res, next) {
    try {
        const { cinema, name } = req.body;
        if (!cinema || !name) return res.status(400).json({ error: 'cinema and name are required.' });

        const cinemaExists = await Cinema.findById(cinema);
        if (!cinemaExists) return res.status(404).json({ error: 'Cinema not found.' });

        const equipment = await Equipment.create(req.body);
        res.status(201).json({ success: true, data: equipment });
    } catch (err) {
        next(err);
    }
}

async function updateEquipment(req, res, next) {
    try {
        const allowed = [
            'name',
            'type',
            'serialNumber',
            'purchaseDate',
            'warrantyExpiry',
            'status',
            'notes',
        ];
        const updates = {};
        for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];

        const equipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('cinema', 'name location');

        if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });

        res.json({ success: true, data: equipment });
    } catch (err) {
        next(err);
    }
}

async function updateEquipmentStatus(req, res, next) {
    try {
        const { status } = req.body;
        const valid = ['operational', 'maintenance', 'broken', 'retired'];
        if (!valid.includes(status)) return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });

        const equipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );

        if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });

        res.json({ success: true, data: equipment });
    } catch (err) {
        next(err);
    }
}

async function deleteEquipment(req, res, next) {
    try {
        const equipment = await Equipment.findByIdAndDelete(req.params.id);
        if (!equipment) return res.status(404).json({ error: 'Equipment not found.' });

        await MaintenanceLog.deleteMany({ equipment: equipment._id });

        res.json({ success: true, message: 'Equipment and its logs deleted.' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    updateEquipmentStatus,
    deleteEquipment,
};