const Favourite = require('../models/favourite');
const Movie = require('../models/movie');
const Cinema = require('../models/cinema');

const TYPE_MODEL_MAP = { movie: 'Movie', cinema: 'Cinema' };
const MODEL_LOOKUP = { Movie, Cinema };

async function toggleFavourite(req, res, next) {
    try {
        const { itemType, itemId } = req.body;
        const modelName = TYPE_MODEL_MAP[itemType];

        const itemExists = await MODEL_LOOKUP[modelName].exists({ _id: itemId });
        if (!itemExists) return res.status(404).json({ error: `${modelName} not found.` });

        const existing = await Favourite.findOne({
            user: req.user.id,
            itemType: modelName,
            item: itemId,
        });

        if (existing) {
            await existing.deleteOne();
            return res.json({ favourited: false });
        }

        await Favourite.create({ user: req.user.id, itemType: modelName, item: itemId });
        return res.json({ favourited: true });
    } catch (err) {
        if (err.code === 11000) {
            return res.json({ favourited: true });
        }
        next(err);
    }
}

async function getMyFavourites(req, res, next) {
    try {
        const { type } = req.query;
        const filter = { user: req.user.id };

        if (type) filter.itemType = TYPE_MODEL_MAP[type];

        const favourites = await Favourite.find(filter)
            .populate('item')
            .sort({ createdAt: -1 });

        const movies = favourites
            .filter((f) => f.itemType === 'Movie' && f.item)
            .map((f) => f.item);

        const cinemas = favourites
            .filter((f) => f.itemType === 'Cinema' && f.item)
            .map((f) => f.item);

        res.json({ movies, cinemas });
    } catch (err) {
        next(err);
    }
}

module.exports = { toggleFavourite, getMyFavourites };