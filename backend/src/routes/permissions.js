const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
const {
    getPermissions,
    getGroupedPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    restorePermission,
} = require('../controllers/roles');
const { validateBody, validateParams } = require('../validations');
const {
    permissionCreateSchema,
    permissionUpdateSchema,
    permissionParamsSchema,
} = require('../validations/permission');

const router = express.Router();
router.use(requireAuth);
router.get('/', requirePermission('permissions:read'), getPermissions);
router.get('/grouped', requirePermission('permissions:read'), getGroupedPermissions);
router.post('/', requirePermission('permissions:manage'), validateBody(permissionCreateSchema), createPermission);
router.put('/:id', requirePermission('permissions:manage'), validateParams(permissionParamsSchema), validateBody(permissionUpdateSchema), updatePermission);
router.delete('/:id', requirePermission('permissions:manage'), validateParams(permissionParamsSchema), deletePermission);
router.post('/:id/restore', requirePermission('permissions:manage'), validateParams(permissionParamsSchema), restorePermission);

module.exports = router;
