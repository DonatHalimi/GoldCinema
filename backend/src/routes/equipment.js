const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    updateEquipmentStatus,
    deleteEquipment,
} = require('../controllers/equipment');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllEquipment);
router.get('/:id', getEquipmentById);
router.post('/', createEquipment);
router.put('/:id', updateEquipment);
router.patch('/:id/status', updateEquipmentStatus);
router.delete('/:id', deleteEquipment);

module.exports = router;