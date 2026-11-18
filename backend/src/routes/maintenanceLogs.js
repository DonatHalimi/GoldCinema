const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
const {
    getAllLogs,
    getLogById,
    getLogsByEquipment,
    createLog,
    updateLog,
    deleteLog,
} = require('../controllers/maintenanceLogs');
const router = express.Router();

router.use(requireAuth, requirePermission('maintenance:manage'));
router.get('/', getAllLogs);
router.get('/equipment/:equipmentId', getLogsByEquipment);
router.get('/:id', getLogById);
router.post('/', createLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);
module.exports = router;