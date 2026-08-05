const express = require('express');
const {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    bulkDeleteRoles,
} = require('../controllers/role');
const {
    validateBody,
    validateParams,
    role: { roleCreateSchema, roleUpdateSchema, roleIdSchema },
} = require('../validations');

const router = express.Router();

router.delete('/bulk-delete', bulkDeleteRoles);

router.get('/', getRoles);
router.post('/', validateBody(roleCreateSchema), createRole);
router.put('/:id', validateParams(roleIdSchema), validateBody(roleUpdateSchema), updateRole);
router.delete('/:id', validateParams(roleIdSchema), deleteRole);

module.exports = router;