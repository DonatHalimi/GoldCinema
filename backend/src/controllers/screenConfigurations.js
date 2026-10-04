const ScreenConfiguration = require('../models/screenConfiguration');
const Screen = require('../models/screen');

async function getAllConfigurations(req, res, next) {
    try {
        const { screenType, has3D, hasHFR, page = 1, limit = 50 } = req.query;
        const filter = {};

        if (screenType) filter.screenType = screenType;
        if (has3D !== undefined) filter.has3D = has3D === 'true';
        if (hasHFR !== undefined) filter.hasHFR = hasHFR === 'true';

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

        const [configs, total] = await Promise.all([
            ScreenConfiguration.find(filter)
                .populate('screen', 'name capacity cinema')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit, 10)),
            ScreenConfiguration.countDocuments(filter),
        ]);

        res.json({
            success: true,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)) || 1,
            data: configs,
        });
    } catch (err) {
        next(err);
    }
}

async function getConfigurationByScreen(req, res, next) {
    try {
        const config = await ScreenConfiguration.findOne({ screen: req.params.screenId }).populate('screen', 'name capacity cinema');

        if (!config) return res.status(404).json({ error: 'Screen configuration not found.' });

        res.json({ success: true, data: config });
    } catch (err) {
        next(err);
    }
}

async function getConfigurationById(req, res, next) {
    try {
        const config = await ScreenConfiguration.findById(req.params.id).populate('screen', 'name capacity cinema');

        if (!config) return res.status(404).json({ error: 'Screen configuration not found.' });

        res.json({ success: true, data: config });
    } catch (err) {
        next(err);
    }
}

async function createConfiguration(req, res, next) {
    try {
        const { screen } = req.body;
        if (!screen) return res.status(400).json({ error: 'screen is required.' });

        const screenExists = await Screen.findById(screen);
        if (!screenExists) return res.status(404).json({ error: 'Screen not found.' });

        const existing = await ScreenConfiguration.findOne({ screen });
        if (existing) return res.status(409).json({ error: 'Configuration already exists for this screen.' });

        const config = await ScreenConfiguration.create(req.body);
        res.status(201).json({ success: true, data: config });
    } catch (err) {
        next(err);
    }
}

async function updateConfiguration(req, res, next) {
    try {
        const allowed = [
            'screenType',
            'soundSystem',
            'projectorType',
            'screenWidth',
            'screenHeight',
            'has3D',
            'hasHFR',
            'notes',
        ];
        const updates = {};
        for (const key of allowed) if (req.body[key] !== undefined) updates[key] = req.body[key];

        const config = await ScreenConfiguration.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('screen', 'name capacity cinema');

        if (!config) return res.status(404).json({ error: 'Screen configuration not found.' });

        res.json({ success: true, data: config });
    } catch (err) {
        next(err);
    }
}

async function deleteConfiguration(req, res, next) {
    try {
        const config = await ScreenConfiguration.findByIdAndDelete(req.params.id);
        if (!config) return res.status(404).json({ error: 'Screen configuration not found.' });

        res.json({ success: true, message: 'Screen configuration deleted.' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllConfigurations,
    getConfigurationById,
    getConfigurationByScreen,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
};