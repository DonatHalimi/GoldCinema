export const LOCALES = [
    { code: 'en', label: 'English', dir: 'ltr', intlLocale: 'en' },
    { code: 'sq', label: 'Shqip', dir: 'ltr', intlLocale: 'sq' },
    { code: 'sr-Latn', label: 'Srpski', dir: 'ltr', intlLocale: 'sr-Latn-RS' },
];

export const SUPPORTED_LOCALE_CODES = LOCALES.map((l) => l.code);
export const DEFAULT_LOCALE = 'en';

export function getLocaleConfig(code) {
    return LOCALES.find((l) => l.code === code) || LOCALES.find((l) => l.code === DEFAULT_LOCALE);
}