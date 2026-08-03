import Role from '../models/role.js';

// GET /api/roles
export const getRoles = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const [roles, total] = await Promise.all([
            Role.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
            Role.countDocuments(),
        ]);

        res.status(200).json({
            data: roles,
            page,
            pages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/roles
export const createRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;

        const existingRole = await Role.findOne({ name: name.toLowerCase() });
        if (existingRole) return res.status(400).json({ error: 'Role with this name already exists' });

        const role = await Role.create({
            name: name.toLowerCase(),
            description,
            permissions: permissions || ['read'],
        });

        console.log('Created Role:', role);

        res.status(201).json({ message: 'Role created successfully', role, });
    } catch (err) {
        next(err);
    }
};

// PUT /api/roles/:id
export const updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;

        if (name) {
            const existingRole = await Role.findOne({
                name: name.toLowerCase(),
                _id: { $ne: id },
            });
            if (existingRole) {
                return res.status(400).json({ error: 'Role with this name already exists' });
            }
        }

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            {
                ...(name && { name: name.toLowerCase() }),
                ...(description !== undefined && { description }),
                ...(permissions && { permissions }),
            },
            { new: true, runValidators: true }
        );

        if (!updatedRole) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.status(200).json({
            message: 'Role updated successfully',
            role: updatedRole,
        });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/roles/:id
export const deleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedRole = await Role.findByIdAndDelete(id);
        if (!deletedRole) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.status(200).json({
            message: 'Role deleted successfully',
            id,
        });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/roles/bulk-delete
export const bulkDeleteRoles = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of role IDs' });
        }

        const result = await Role.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} role(s)`,
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        next(err);
    }
};