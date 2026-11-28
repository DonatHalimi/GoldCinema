require('dotenv').config({
    path: require('path').resolve(__dirname, '../../.env'),
});

const path = require('node:path');

const { connectDB, disconnectDB } = require('../config/db');
const TranslationKey = require('../models/translationKey');

const translationsSeed = require('./translationsSeed.json');
const { default: mongoose } = require('mongoose');

const REQUIRED_LOCALES = ['en', 'sq', 'sr-Latn'];
const BATCH_SIZE = 500;

function validateTranslations(translations) {
    if (!Array.isArray(translations)) {
        throw new Error('translationsSeed must be an array.');
    }

    const seen = new Set();

    translations.forEach((translation, index) => {
        const entryNumber = index + 1;

        if (!translation.namespace || typeof translation.namespace !== 'string') {
            throw new Error(`Entry ${entryNumber}: namespace is required.`);
        }

        if (!translation.key || typeof translation.key !== 'string') {
            throw new Error(`Entry ${entryNumber}: key is required.`);
        }

        if (!translation.values || typeof translation.values !== 'object') {
            throw new Error(`Entry ${entryNumber}: values must be an object.`);
        }

        REQUIRED_LOCALES.forEach((locale) => {
            const value = translation.values[locale];

            if (typeof value !== 'string' || !value.trim()) {
                throw new Error(
                    `Entry ${entryNumber}: missing or invalid translation for "${locale}" (${translation.namespace}.${translation.key}).`
                );
            }
        });

        const identity = `${translation.namespace}:${translation.key}`;

        if (seen.has(identity)) {
            throw new Error(`Duplicate translation key: ${identity}`);
        }

        seen.add(identity);
    });
}

async function seedTranslations() {
    let connected = false;

    try {
        console.log('\nStarting translation seed...\n');

        validateTranslations(translationsSeed);

        console.log(`Validated ${translationsSeed.length} translation entries.`);

        await connectDB();
        connected = true;

        await TranslationKey.init();

        let inserted = 0;
        let modified = 0;
        let unchanged = 0;

        for (let i = 0; i < translationsSeed.length; i += BATCH_SIZE) {
            const batch = translationsSeed.slice(i, i + BATCH_SIZE);

            const operations = batch.map((translation) => ({
                updateOne: {
                    filter: {
                        namespace: translation.namespace,
                        key: translation.key,
                    },
                    update: {
                        $set: {
                            values: translation.values,
                            context: translation.context ?? null,
                        },
                    },
                    upsert: true,
                },
            }));

            const result = await TranslationKey.bulkWrite(operations, {
                ordered: true,
            });

            inserted += result.upsertedCount || 0;
            modified += result.modifiedCount || 0;
            unchanged += batch.length -
                (result.upsertedCount || 0) -
                (result.modifiedCount || 0);

            console.log(
                `Processed ${Math.min(i + BATCH_SIZE, translationsSeed.length)} / ${translationsSeed.length}`
            );
        }

        console.log('Mongoose:', mongoose.version);
        console.log('Schema paths:', Object.keys(TranslationKey.schema.paths));

        const raw = await TranslationKey.collection.find({}).limit(3).toArray();
        console.log('Raw docs:', JSON.stringify(raw, null, 2));

        console.log(
            "Raw docs with namespace 'auth':",
            await TranslationKey.collection.countDocuments({ namespace: 'auth' })
        );

        console.log('\nTranslation seed completed successfully.');
        console.log('----------------------------------------');
        console.log(`Total entries: ${translationsSeed.length}`);
        console.log(`Inserted:      ${inserted}`);
        console.log(`Updated:       ${modified}`);
        console.log(`Unchanged:     ${unchanged}`);
        console.log('----------------------------------------\n');
    } catch (error) {
        console.error('\nTranslation seed failed:', error);
        process.exitCode = 1;
    } finally {
        if (connected) {
            await disconnectDB();
        }
    }
}

seedTranslations();