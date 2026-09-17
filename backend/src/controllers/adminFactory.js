const AuditLog = require('../models/auditLog');
const { redact } = require('../utils/redact');

function getAll(Model, populateOpts = '') {
    return async function getAllResource(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 10;
            const skip = (page - 1) * limit;

            const query = Model.find().skip(skip).limit(limit);
            if (populateOpts) query.populate(populateOpts);

            const [data, total] = await Promise.all([
                query.exec(),
                Model.countDocuments(),
            ]);

            res.status(200).json({
                success: true,
                total,
                page,
                pages: Math.ceil(total / limit),
                data,
            });
        } catch (error) {
            next(error);
        }
    };
}

function getOne(Model, populateOpts = '') {
    return async function getOneResource(req, res, next) {
        try {
            const query = Model.findById(req.params.id);
            if (populateOpts) query.populate(populateOpts);

            const doc = await query.exec();
            if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });

            res.status(200).json({ success: true, data: doc });
        } catch (error) {
            next(error);
        }
    };
}

function auditActor(req) {
    return {
        userId: req.user?.id || req.user?._id || null,
        email: req.user?.email || null,
        role: typeof req.user?.role === 'object' ? req.user.role?.name : req.user?.role || null,
        ip: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
    };
}

function recordAdminMutation({ req, action, resourceType, resourceId, before, after }) {
    AuditLog.create({
        category: 'admin_mutation',
        action,
        resource: { type: resourceType, id: String(resourceId) },
        actor: auditActor(req),
        changes: {
            before: before !== undefined ? redact(before) : undefined,
            after: after !== undefined ? redact(after) : undefined,
        },
        severity: 'info',
        expiresAt: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years — confirm against your compliance requirements.
    }).catch((err) => console.error('[audit] Failed to persist admin mutation log:', err.message));
}

function createOne(Model) {
    return async function createOneResource(req, res, next) {
        try {
            const doc = await Model.create(req.body);
            recordAdminMutation({
                req,
                action: `${Model.modelName}.created`,
                resourceType: Model.modelName,
                resourceId: doc._id,
                after: doc.toObject(),
            });
            res.status(201).json({ success: true, data: doc });
        } catch (error) {
            next(error);
        }
    };
}

function updateOne(Model) {
    return async function updateOneResource(req, res, next) {
        try {
            const before = await Model.findById(req.params.id).lean();
            if (!before) return res.status(404).json({ success: false, message: 'Resource not found' });

            const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });

            recordAdminMutation({
                req,
                action: `${Model.modelName}.updated`,
                resourceType: Model.modelName,
                resourceId: doc._id,
                before,
                after: doc.toObject(),
            });

            res.status(200).json({ success: true, data: doc });
        } catch (error) {
            next(error);
        }
    };
}

function deleteOne(Model) {
    return async function deleteOneResource(req, res, next) {
        try {
            const doc = await Model.findByIdAndDelete(req.params.id);
            if (!doc) return res.status(404).json({ success: false, message: 'Resource not found' });

            recordAdminMutation({
                req,
                action: `${Model.modelName}.deleted`,
                resourceType: Model.modelName,
                resourceId: doc._id,
                before: doc.toObject(),
            });

            res.status(200).json({ success: true, data: null });
        } catch (error) {
            next(error);
        }
    };
}

function deleteMany(Model) {
    return async function deleteManyResource(req, res, next) {
        try {
            const { ids } = req.body;
            if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Please provide an array of IDs to delete' });

            const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
            const targets = await Model.find({ _id: { $in: validIds } }).select('_id').lean();

            const result = await Model.deleteMany({ _id: { $in: validIds } });

            recordAdminMutation({
                req,
                action: `${Model.modelName}.bulk_deleted`,
                resourceType: Model.modelName,
                resourceId: 'bulk',
                before: { ids: targets.map((t) => t._id), count: result.deletedCount },
            });

            res.status(200).json({ success: true, deletedCount: result.deletedCount });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
    deleteMany,
};