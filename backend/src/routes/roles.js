import express from 'express';
import { getRoles, createRole, updateRole, deleteRole, bulkDeleteRoles, } from '../controllers/roleController.js';

const router = express.Router();

router.delete('/bulk-delete', bulkDeleteRoles);

router.get('/', getRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;