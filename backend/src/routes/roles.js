const express = require('express');
const router = express.Router();
const {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
} = require('../controllers/role');
const {
    validateBody,
    validateParams,
    role: { roleCreateSchema, roleUpdateSchema, roleIdSchema },
} = require('../validations');

router.get('/', getRoles);
router.post('/', validateBody(roleCreateSchema), createRole);
router.put('/:id', validateParams(roleIdSchema), validateBody(roleUpdateSchema), updateRole);
router.delete('/:id', validateParams(roleIdSchema), deleteRole);

module.exports = router;