function resolveTranslatedFields(doc, locale, fields) {
    if (locale === 'en' || !doc.translations) return doc;

    const localeTranslation = doc.translations[locale];
    if (!localeTranslation) return doc;

    const resolved = { ...doc };
    fields.forEach((field) => {
        if (localeTranslation[field]) resolved[field] = localeTranslation[field];
    });

    return resolved;
}

module.exports = { resolveTranslatedFields };