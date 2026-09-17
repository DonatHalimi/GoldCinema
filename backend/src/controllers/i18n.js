const TranslationKey = require('../models/translationKey');

async function getManifest(req, res, next) {
    try {
        const version = await getTranslationsVersion();
        res.set('Cache-Control', 'public, max-age=60');
        res.json({ version });
    } catch (err) {
        next(err);
    }
}

async function getBundle(req, res, next) {
    try {
        const { locale, namespace } = req.params;

        const keys = await TranslationKey.find({ namespace }).lean();
        const bundle = {};
        keys.forEach((k) => { bundle[k.key] = k.values[locale] || k.values.en; });

        const version = await getTranslationsVersion();
        const etag = `"${namespace}-${locale}-${version}"`;

        if (req.headers['if-none-match'] === etag) return res.status(304).end();

        res.set('ETag', etag);
        res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        res.json(bundle);
    } catch (err) {
        next(err);
    }
}

async function getMissingTranslations(req, res, next) {
    try {
        const missing = await TranslationKey.find({
            $or: [{ 'values.sq': null }, { 'values.sr-Latn': null }],
        }).select('namespace key values context').lean();

        res.json({ missing, count: missing.length });
    } catch (err) {
        next(err);
    }
}

async function getTranslationsVersion() {
    const [latest] = await TranslationKey.aggregate([
        { $group: { _id: null, maxUpdatedAt: { $max: '$updatedAt' } } },
    ]);
    return latest ? new Date(latest.maxUpdatedAt).getTime() : 0;
}

module.exports = { getManifest, getBundle, getMissingTranslations };