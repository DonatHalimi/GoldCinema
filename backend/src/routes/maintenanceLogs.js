const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getAllLogs,
    getLogById,
    getLogsByEquipment,
    createLog,
    updateLog,
    deleteLog,
} = require('../controllers/maintenanceLogs');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllLogs);
router.get('/equipment/:equipmentId', getLogsByEquipment);
router.get('/:id', getLogById);
router.post('/', createLog);
router.put('/:id', updateLog);
router.delete('/:id', deleteLog);

module.exports = router;