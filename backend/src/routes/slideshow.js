const express = require('express');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const {
    getSlides,
    getSlideById,
    createSlide,
    updateSlide,
    deleteSlide,
} = require('../controllers/slideshow');

const {
    validateParams,
    slideshow: { slideshowIdSchema },
} = require('../validations');

const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', optionalAuth, getSlides);

router.get('/:id', optionalAuth, validateParams(slideshowIdSchema), getSlideById);
router.post('/', requireAuth, upload.single('image'), createSlide);
router.put('/:id', requireAuth, upload.single('image'), validateParams(slideshowIdSchema), updateSlide);
router.delete('/:id', requireAuth, validateParams(slideshowIdSchema), deleteSlide);

module.exports = router;