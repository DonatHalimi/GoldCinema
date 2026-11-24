const test = require('node:test');
const assert = require('node:assert/strict');
const Order = require('../src/models/order');
const { SeatHold } = require('../src/models');
const Movie = require('../src/models/movie');
const Showtime = require('../src/models/showtime');
const Snack = require('../src/models/snack');
const {
    getConcessionAmount,
    getConcessionCatalog,
    normalizeConcessions,
    seedConcessions,
} = require('../src/services/concessions');
const { createOrder, updateOrderConcessions } = require('../src/controllers/orders');
const { buildOrderPaymentDetails } = require('../src/controllers/payments');
const { buildTicketPayload } = require('../src/utils/qr');
const { snackUpdateSchema } = require('../src/validations/snack');

function createSnackModel() {
    return class FakeSnackModel {
        static records = [];

        static async updateOne(filter, update) {
            if (!this.records.some((item) => item.catalogId === filter.catalogId)) {
                this.records.push({ ...update.$setOnInsert });
            }
        }

        static find(filter) {
            const records = this.records.filter((item) => (
                (!filter.available || item.available === filter.available) &&
                (!filter.isDeleted || item.isDeleted !== true) &&
                (filter.catalogId?.$in
                    ? filter.catalogId.$in.includes(item.catalogId)
                    : item.catalogId && item.catalogId !== '')
            ));

            return { lean: async () => records };
        }
    };
}

test('concession defaults seed idempotently and produce complete categorized catalog items', async () => {
    const FakeSnackModel = createSnackModel();
    await seedConcessions(FakeSnackModel);
    const firstSeedCount = FakeSnackModel.records.length;
    FakeSnackModel.records[0].name = 'Admin Edited Product';
    FakeSnackModel.records[0].isDeleted = true;
    await seedConcessions(FakeSnackModel);
    const catalog = await getConcessionCatalog(FakeSnackModel);
    const categories = new Set(catalog.map((item) => item.category));

    assert.deepEqual([...categories].sort(), ['Candy', 'Combo Deals', 'Drinks', 'Gummies', 'Popcorn']);
    assert.ok(catalog.length > 4);
    assert.equal(FakeSnackModel.records.length, firstSeedCount);
    assert.equal(FakeSnackModel.records[0].name, 'Admin Edited Product');
    assert.ok(!catalog.some((item) => item.id === FakeSnackModel.records[0].catalogId));

    for (const item of catalog) {
        assert.ok(item.id && item.name && item.description);
        assert.ok(Number.isFinite(item.price) && item.price > 0);
        assert.equal(typeof item.isCombo, 'boolean');
        assert.equal(new URL(item.image).protocol, 'https:');
        assert.ok(Object.hasOwn(item, 'originalPrice'));
        if (item.isCombo) assert.ok(item.originalPrice > item.price);
    }
});

test('server prices selected concessions and rejects invalid catalog IDs and quantities', async () => {
    const FakeSnackModel = createSnackModel();
    await seedConcessions(FakeSnackModel);
    const selected = await normalizeConcessions([
        { catalogId: 'sweet-salty-combo', quantity: 2 },
        { catalogId: 'bottled-water', quantity: 1 },
    ], FakeSnackModel);

    assert.equal(selected[0].unitPrice, 11.49);
    assert.equal(getConcessionAmount(selected), 26.47);
    await assert.rejects(() => normalizeConcessions([null], FakeSnackModel), /selected concession is invalid/);
    await assert.rejects(() => normalizeConcessions([{ catalogId: 'unknown', quantity: 1 }], FakeSnackModel), /not available/);
    await assert.rejects(() => normalizeConcessions([{ catalogId: 'soda', quantity: 21 }], FakeSnackModel), /between 1 and 20/);
    await assert.rejects(() => normalizeConcessions([
        { catalogId: 'soda', quantity: 1 },
        { catalogId: 'soda', quantity: 2 },
    ], FakeSnackModel), /only appear once/);
});

test('snack partial updates do not inject a default catalog identifier', async () => {
    const update = await snackUpdateSchema.validate({
        _id: 'mongo-id',
        id: 'mongo-id',
        name: 'Updated Popcorn',
        catalogId: 'large-popcorn',
        createdAt: new Date(),
    });

    assert.equal(update.catalogId, undefined);
    assert.equal(update.name, 'Updated Popcorn');
    assert.equal(update._id, undefined);
    await assert.rejects(() => snackUpdateSchema.validate({
        isCombo: true,
        price: 9,
        originalPrice: 8,
    }), /original price must be greater/);
});

test('concession selection persists snapshots and calculates the combined order total', async () => {
    const originalFindOrder = Order.findById;
    const originalFindHold = SeatHold.findById;
    const originalFindSnack = Snack.find;
    const userId = 'customer-id';
    const holdId = 'hold-id';
    const order = {
        user: { toString: () => userId },
        paymentStatus: 'pending',
        concessionsSelected: false,
        stripePaymentIntentId: null,
        paypalOrderId: null,
        giftCardAmount: 0,
        ticketAmount: 25,
        snacks: [],
        snackAmount: 0,
        totalAmount: 25,
        holdId,
        showtime: { toString: () => 'showtime-id' },
        seats: ['A1', 'A2'],
        save: async () => {},
    };
    const hold = {
        user: { toString: () => userId },
        showtime: { toString: () => 'showtime-id' },
        expiresAt: new Date(Date.now() + 60_000),
        seats: ['A1', 'A2'],
    };

    Order.findById = async () => order;
    SeatHold.findById = async () => hold;
    const FakeSnackModel = createSnackModel();
    await seedConcessions(FakeSnackModel);
    Snack.find = FakeSnackModel.find.bind(FakeSnackModel);

    try {
        let response;
        const res = {
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(body) {
                response = body;
                return this;
            },
        };

        await updateOrderConcessions({
            params: { id: 'order-id' },
            user: { id: userId },
            body: { items: [{ catalogId: 'popcorn-large', quantity: 1 }] },
        }, res, (error) => {
            throw error;
        });

        assert.equal(res.statusCode, undefined);
        assert.equal(order.snackAmount, 8.49);
        assert.equal(order.totalAmount, 33.49);
        assert.equal(order.concessionsSelected, true);
        assert.equal(order.snacks[0].name, 'Large Popcorn');
        assert.equal(order.snacks[0].quantity, 1);
        assert.equal(response.order, order);
    } finally {
        Order.findById = originalFindOrder;
        SeatHold.findById = originalFindHold;
        Snack.find = originalFindSnack;
    }
});

test('order creation calculates ticket pricing from the movie and active seat hold', async () => {
    const originalMovieFind = Movie.findById;
    const originalShowtimeFind = Showtime.findById;
    const originalHoldFind = SeatHold.findById;
    const originalOrderCreate = Order.create;
    const movie = { _id: 'movie-id', id: 'movie-id', price: 12.5 };
    const showtime = {
        _id: 'showtime-id',
        id: 'showtime-id',
        movie: { toString: () => 'movie-id' },
    };
    const hold = {
        user: { toString: () => 'customer-id' },
        showtime: { toString: () => 'showtime-id' },
        expiresAt: new Date(Date.now() + 60_000),
        seats: ['A1', 'A2'],
    };
    let orderData;

    Movie.findById = async () => movie;
    Showtime.findById = async () => showtime;
    SeatHold.findById = async () => hold;
    Order.create = async (data) => {
        orderData = data;
        return data;
    };

    try {
        let response;
        const res = {
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(body) {
                response = body;
                return this;
            },
        };

        await createOrder({
            body: {
                movie: 'movie-id',
                showtime: 'showtime-id',
                seats: ['A1', 'A2'],
                ticketAmount: 0.01,
                totalAmount: 0.01,
                snacks: [{ snack: 'untrusted', quantity: 20, unitPrice: 0.01 }],
                holdId: 'hold-id',
            },
            user: { id: 'customer-id' },
        }, res, (error) => {
            throw error;
        });

        assert.equal(res.statusCode, 201);
        assert.equal(orderData.ticketAmount, 25);
        assert.equal(orderData.totalAmount, 25);
        assert.equal(orderData.snackAmount, 0);
        assert.deepEqual(orderData.snacks, []);
        assert.equal(response.order, orderData);
    } finally {
        Movie.findById = originalMovieFind;
        Showtime.findById = originalShowtimeFind;
        SeatHold.findById = originalHoldFind;
        Order.create = originalOrderCreate;
    }
});

test('QR ticket payload includes concessions for counter pickup', () => {
    const payload = JSON.parse(buildTicketPayload({
        orderId: 'order-123',
        seats: ['A1'],
        concessions: [{ catalogId: 'popcorn-large', name: 'Large Popcorn', quantity: 2 }],
    }));

    assert.deepEqual(payload, [
        'order-123',
        ['A1'],
        [['popcorn-large', 'Large Popcorn', 2]],
    ]);
});

test('Stripe payment details use the combined total and include concession line items', () => {
    const details = buildOrderPaymentDetails({
        _id: 'order-123',
        ticketAmount: 25,
        snackAmount: 8.49,
        totalAmount: 33.49,
        snacks: [{ catalogId: 'popcorn-large', quantity: 1 }],
    }, 'customer-123');

    assert.equal(details.amount, 3349);
    assert.equal(details.metadata.orderId, 'order-123');
    assert.equal(details.metadata.ticketAmount, '25');
    assert.equal(details.metadata.snackAmount, '8.49');
    assert.deepEqual(JSON.parse(details.metadata.concessions), [['popcorn-large', 1]]);
});
