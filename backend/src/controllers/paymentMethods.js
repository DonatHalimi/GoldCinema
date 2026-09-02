const stripe = require('../utils/stripeClient');
const User = require('../models/user');

async function getOrCreateStripeCustomer(user) {
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    return customer.id;
}

function serializePaymentMethod(pm, defaultId) {
    return {
        id: pm.id,
        type: pm.type,
        brand: pm.card?.brand || null,
        last4: pm.card?.last4 || null,
        expMonth: pm.card?.exp_month || null,
        expYear: pm.card?.exp_year || null,
        isDefault: pm.id === defaultId,
    };
}

async function listPaymentMethods(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (!user.stripeCustomerId) return res.json({ paymentMethods: [] });

        const [methods, customer] = await Promise.all([
            stripe.paymentMethods.list({ customer: user.stripeCustomerId, type: 'card' }),
            stripe.customers.retrieve(user.stripeCustomerId),
        ]);

        if (customer.deleted) return res.json({ paymentMethods: [] });

        const defaultId = customer.invoice_settings?.default_payment_method || null;

        const paymentMethods = methods.data
            .map((pm) => serializePaymentMethod(pm, defaultId))
            .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

        res.json({ paymentMethods });
    } catch (err) {
        next(err);
    }
}

async function createSetupIntent(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const customerId = await getOrCreateStripeCustomer(user);

        const setupIntent = await stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ['card'],
            usage: 'off_session',
        });

        res.json({ clientSecret: setupIntent.client_secret });
    } catch (err) {
        next(err);
    }
}

async function setDefaultPaymentMethod(req, res, next) {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);

        if (!user?.stripeCustomerId) return res.status(404).json({ error: 'No saved payment methods found.' });

        const pm = await stripe.paymentMethods.retrieve(id);
        if (pm.customer !== user.stripeCustomerId) return res.status(404).json({ error: 'Payment method not found.' });

        await stripe.customers.update(user.stripeCustomerId, { invoice_settings: { default_payment_method: id } });

        res.json({ message: 'Default payment method updated.' });
    } catch (err) {
        next(err);
    }
}

async function removePaymentMethod(req, res, next) {
    try {
        const { id } = req.params;
        const user = await User.findById(req.user.id);

        if (!user?.stripeCustomerId) return res.status(404).json({ error: 'No saved payment methods found.' });

        const pm = await stripe.paymentMethods.retrieve(id);
        if (pm.customer !== user.stripeCustomerId) return res.status(404).json({ error: 'Payment method not found.' });

        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        const wasDefault = !customer.deleted && customer.invoice_settings?.default_payment_method === id;

        await stripe.paymentMethods.detach(id);

        if (wasDefault) {
            const remaining = await stripe.paymentMethods.list({
                customer: user.stripeCustomerId,
                type: 'card',
            });
            const nextDefault = remaining.data[0]?.id || null;

            await stripe.customers.update(user.stripeCustomerId, { invoice_settings: { default_payment_method: nextDefault }, });
        }

        res.json({ message: 'Payment method removed.' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getOrCreateStripeCustomer,
    listPaymentMethods,
    createSetupIntent,
    setDefaultPaymentMethod,
    removePaymentMethod,
};