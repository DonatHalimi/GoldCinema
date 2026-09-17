export function formatDate(date, locale, opts = { dateStyle: 'medium' }) {
    return new Intl.DateTimeFormat(locale, opts).format(new Date(date));
}

export function formatCurrency(amount, locale, currency) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}