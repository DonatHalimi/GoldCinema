const catalogDefaults = require('../data/concessions.json');
const Snack = require('../models/snack');

const CATEGORY_NAMES = {
    combo: 'Combo Deals',
    popcorn: 'Popcorn',
    drink: 'Drinks',
    candy: 'Candy',
    gummies: 'Gummies',
    snack: 'Snacks',
    concession: 'Concessions',
    other: 'Snacks',
};

class ConcessionSelectionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConcessionSelectionError';
        this.statusCode = 400;
    }
}

function getDefaultRecord(item) {
    const category = {
        'Combo Deals': 'combo',
        Popcorn: 'popcorn',
        Drinks: 'drink',
        Candy: item.id === 'sour-gummies' ? 'gummies' : 'candy',
    }[item.category];

    return {
        catalogId: item.id,
        name: item.name,
        description: item.description,
        type: item.isCombo
            ? 'concession'
            : item.category === 'Drinks'
                ? 'drink'
                : item.id === 'sour-gummies'
                    ? 'gummies'
                    : 'snack',
        category,
        price: item.price,
        originalPrice: item.originalPrice,
        isCombo: item.isCombo,
        image: item.image,
        available: true,
    };
}

function toCatalogItem(item) {
    return {
        id: item.catalogId,
        name: item.name,
        category: CATEGORY_NAMES[item.category] || CATEGORY_NAMES.other,
        description: item.description || '',
        price: item.price,
        originalPrice: item.originalPrice ?? null,
        isCombo: Boolean(item.isCombo),
        image: item.image || '',
    };
}

async function seedConcessions(SnackModel = Snack) {
    await Promise.all(catalogDefaults.map((item) => SnackModel.updateOne(
        { catalogId: item.id },
        { $setOnInsert: getDefaultRecord(item) },
        { upsert: true }
    )));

    return catalogDefaults.length;
}

async function getConcessionCatalog(SnackModel = Snack) {
    const snacks = await SnackModel.find({
        available: true,
        isDeleted: { $ne: true },
        catalogId: { $exists: true, $ne: '' },
    }).lean();

    return snacks
        .map(toCatalogItem)
        .sort((left, right) => left.category.localeCompare(right.category) || left.name.localeCompare(right.name));
}

async function normalizeConcessions(items, SnackModel = Snack) {
    if (!Array.isArray(items)) {
        throw new ConcessionSelectionError('Concessions must be a list.');
    }

    if (items.length > 25) {
        throw new ConcessionSelectionError('Too many different concession items were selected.');
    }

    const seen = new Set();
    const selections = items.map((selection) => {
        if (!selection || typeof selection !== 'object' || Array.isArray(selection)) {
            throw new ConcessionSelectionError('A selected concession is invalid.');
        }

        const { catalogId, quantity } = selection;
        if (typeof catalogId !== 'string' || !catalogId.trim()) {
            throw new ConcessionSelectionError('A selected concession is invalid.');
        }
        if (seen.has(catalogId)) {
            throw new ConcessionSelectionError('A concession can only appear once in the selection.');
        }
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
            throw new ConcessionSelectionError('Concession quantities must be between 1 and 20.');
        }

        seen.add(catalogId);
        return { catalogId, quantity };
    });

    const products = await SnackModel.find({
        catalogId: { $in: selections.map((item) => item.catalogId) },
        available: true,
        isDeleted: { $ne: true },
    }).lean();
    const productsById = new Map(products.map((item) => [item.catalogId, item]));

    return selections.map(({ catalogId, quantity }) => {
        const item = productsById.get(catalogId);
        if (!item) throw new ConcessionSelectionError('A selected concession is not available.');

        return {
            catalogId: item.catalogId,
            name: item.name,
            category: CATEGORY_NAMES[item.category] || CATEGORY_NAMES.other,
            quantity,
            unitPrice: item.price,
            isCombo: Boolean(item.isCombo),
            originalPrice: item.originalPrice ?? null,
        };
    });
}

function getConcessionAmount(items) {
    const cents = items.reduce((total, item) => total + Math.round(item.unitPrice * 100) * item.quantity, 0);
    return cents / 100;
}

module.exports = {
    ConcessionSelectionError,
    getConcessionAmount,
    getConcessionCatalog,
    normalizeConcessions,
    seedConcessions,
};
