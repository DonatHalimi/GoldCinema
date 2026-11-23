const express = require('express');
const router = express.Router();
const {
    getRoles,
    createRole,
    getRole,
    updateRole,
    deleteRole,
    replacePermissions,
    getPermissions,
    getGroupedPermissions,
} = require('../controllers/roles');
const {
    validateBody,
    validateParams,
    role: { roleCreateSchema, roleUpdateSchema, roleIdSchema },
} = require('../validations');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');

router.use(requireAuth);
router.get('/', requirePermission('roles:read'), getRoles);
router.post('/', requirePermission('roles:manage'), validateBody(roleCreateSchema), createRole);
router.get('/:id', requirePermission('roles:read'), validateParams(roleIdSchema), getRole);
router.put('/:id', requirePermission('roles:manage'), validateParams(roleIdSchema), validateBody(roleUpdateSchema), updateRole);
router.put('/:id/permissions', requirePermission('roles:manage', 'permissions:manage', { mode: 'all' }), validateParams(roleIdSchema), replacePermissions);
router.delete('/:id', requirePermission('roles:manage'), validateParams(roleIdSchema), deleteRole);


module.exports = router;