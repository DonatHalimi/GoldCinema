const stripe = require('./stripeClient');

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

module.exports = { getOrCreateStripeCustomer };