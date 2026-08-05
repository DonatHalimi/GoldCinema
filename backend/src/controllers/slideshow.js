const Slideshow = require('../models/slideshow');

async function getSlides(req, res) {
    try {
        const slides = await Slideshow
            .find({ isActive: true })
            .sort({ order: 1 });

        res.json(slides);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

async function getSlideById(req, res) {
    try {
        const slide = await Slideshow.findById(req.params.id);

        if (!slide) return res.status(404).json({ message: 'Slide not found' });

        res.json(slide);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

async function createSlide(req, res) {
    try {
        const {
            title,
            description,
            imageUrl,
            buttonText,
            buttonLink,
            order
        } = req.body;


        let finalImageUrl = imageUrl;

        if (req.file) { finalImageUrl = `/uploads/slideshows/${req.file.filename}`; }

        if (!finalImageUrl) {
            return res.status(400).json({
                message: "Image is required"
            });
        }

        const slide = await Slideshow.create({
            title,
            description,
            imageUrl: finalImageUrl,
            buttonText,
            buttonLink,
            order
        });

        res.status(201).json(slide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateSlide(req, res) {
    try {
        const slide = await Slideshow.findById(req.params.id);

        if (!slide) return res.status(404).json({ message: "Slide not found" });

        if (req.file) slide.imageUrl = `/uploads/slideshows/${req.file.filename}`;

        Object.assign(
            slide,
            req.body
        );

        await slide.save();

        res.json(slide);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function deleteSlide(req, res) {
    try {
        await Slideshow.findByIdAndDelete(req.params.id);

        res.json({ message: "Slide deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getSlides,
    getSlideById,
    createSlide,
    updateSlide,
    deleteSlide,
};