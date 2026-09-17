const localeSchema = yup.string().oneOf(SUPPORTED_LOCALES).default(DEFAULT_LOCALE);

module.exports = { localeSchema };