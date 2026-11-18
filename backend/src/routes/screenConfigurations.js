const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleAccess');
const {
    getAllConfigurations,
    getConfigurationById,
    getConfigurationByScreen,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
} = require('../controllers/screenConfigurations');
const router = express.Router();

router.use(requireAuth, requirePermission('screen-configurations:manage'));
router.get('/', getAllConfigurations);
router.get('/screen/:screenId', getConfigurationByScreen);
router.get('/:id', getConfigurationById);
router.post('/', createConfiguration);
router.put('/:id', updateConfiguration);
router.delete('/:id', deleteConfiguration);

module.exports = router;