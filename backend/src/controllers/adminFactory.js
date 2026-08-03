// src/controllers/adminFactory.js

exports.getAll = (Model, populateOpts = '') => async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const query = Model.find().skip(skip).limit(limit);
        if (populateOpts) query.populate(populateOpts);

        const [data, total] = await Promise.all([
            query.exec(),
            Model.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            total,
            page,
            pages: Math.ceil(total / limit),
            data
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOne = (Model, populateOpts = '') => async (req, res) => {
    try {
        const query = Model.findById(req.params.id);
        if (populateOpts) query.populate(populateOpts);

        const doc = await query.exec();
        if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });

        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createOne = (Model) => async (req, res) => {
    try {
        const doc = await Model.create(req.body);
        res.status(201).json({ success: true, data: doc });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateOne = (Model) => async (req, res) => {
    try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });

        res.status(200).json({ success: true, data: doc });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteOne = (Model) => async (req, res) => {
    try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });

        res.status(200).json({ success: true, data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteMany = (Model) => async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of IDs to delete' });
        }

        const result = await Model.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} items`,
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        next(err);
    }
};