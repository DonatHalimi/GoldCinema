const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    getAllConfigurations,
    getConfigurationById,
    getConfigurationByScreen,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
} = require('../controllers/screenConfigurations');

const router = express.Router();

router.use(requireAuth);

router.get('/', getAllConfigurations);
router.get('/screen/:screenId', getConfigurationByScreen);
router.get('/:id', getConfigurationById);
router.post('/', createConfiguration);
router.put('/:id', updateConfiguration);
router.delete('/:id', deleteConfiguration);

module.exports = router;