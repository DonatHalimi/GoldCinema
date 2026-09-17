const SUPPORTED_LOCALES = ['en', 'sq', 'sr-Latn'];
const DEFAULT_LOCALE = 'en';

function resolveLocale(req, res, next) {
    const queryLocale = req.query.locale;
    const cookieLocale = req.cookies?.gcLocale;
    const headerLocale = req.headers['accept-language']?.split(',')[0]?.trim();

    const candidate = [queryLocale, cookieLocale, headerLocale]
        .find((l) => SUPPORTED_LOCALES.includes(l));

    req.locale = candidate || DEFAULT_LOCALE;
    next();
}

module.exports = { resolveLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE };