const MaintenanceLog = require('../models/maintenanceLog');
const Equipment = require('../models/equipment');

async function getAllLogs(req, res, next) {
    try {
        const {
            equipment,
            maintenanceType,
            from,
            to,
            page = 1,
            limit = 20,
        } = req.query;

        const filter = {};
        if (equipment) filter.equipment = equipment;
        if (maintenanceType) filter.maintenanceType = maintenanceType;
        if (from || to) {
            filter.performedAt = {};
            if (from) filter.performedAt.$gte = new Date(from);
            if (to) filter.performedAt.$lte = new Date(to);
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [logs, total] = await Promise.all([
            MaintenanceLog.find(filter)
                .populate({
                    path: 'equipment',
                    select: 'name type cinema',
                    populate: { path: 'cinema', select: 'name' },
                })
                .sort({ performedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10)),
            MaintenanceLog.countDocuments(filter),
        ]);

        res.json({
            success: true,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)) || 1,
            data: logs,
        });
    } catch (err) {
        next(err);
    }
}

async function getLogById(req, res, next) {
    try {
        const log = await MaintenanceLog.findById(req.params.id)
            .populate({
                path: 'equipment',
                select: 'name type cinema',
                populate: { path: 'cinema', select: 'name' },
            });

        if (!log) return res.status(404).json({ error: 'Maintenance log not found.' });

        res.json({ success: true, data: log });
    } catch (err) {
        next(err);
    }
}

async function getLogsByEquipment(req, res, next) {
    try {
        const logs = await MaintenanceLog.find({ equipment: req.params.equipmentId }).sort({ performedAt: -1 });

        res.json({ success: true, data: logs });
    } catch (err) {
        next(err);
    }
}

async function createLog(req, res, next) {
    try {
        const { equipment, description } = req.body;
        if (!equipment || !description) return res.status(400).json({ error: 'equipment and description are required.' });

        const equipmentExists = await Equipment.findById(equipment);
        if (!equipmentExists) return res.status(404).json({ error: 'Equipment not found.' });

        const log = await MaintenanceLog.create(req.body);

        if (req.body.maintenanceType === 'repair' && equipmentExists.status === 'broken') {
            equipmentExists.status = 'maintenance';
            await equipmentExists.save();
        }

        res.status(201).json({ success: true, data: log });
    } catch (err) {
        next(err);
    }
}

async function updateLog(req, res, next) {
    try {
        const allowed = [
            'maintenanceType',
            'description',
            'cost',
            'performedBy',
            'performedAt',
            'nextDueAt',
            'notes',
        ];
        const updates = {};
        for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];

        const log = await MaintenanceLog.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!log) return res.status(404).json({ error: 'Maintenance log not found.' });

        res.json({ success: true, data: log });
    } catch (err) {
        next(err);
    }
}

async function deleteLog(req, res, next) {
    try {
        const log = await MaintenanceLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ error: 'Maintenance log not found.' });

        res.json({ success: true, message: 'Maintenance log deleted.' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllLogs,
    getLogById,
    getLogsByEquipment,
    createLog,
    updateLog,
    deleteLog,
};