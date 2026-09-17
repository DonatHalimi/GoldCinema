import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Plus, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { deletePaymentMethod, getPaymentMethods, setDefaultPaymentMethod } from '../../api/payments';
import CreditCard3D from '../CreditCard3D';
import AddPaymentMethodModal from '../payments/AddPaymentMethodModal';
import RemovePaymentMethodModal from '../payments/RemovePaymentMethodModal';
import { useTranslation } from 'react-i18next';

const BRAND_LABELS = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
};

function formatBrand(brand) {
    return BRAND_LABELS[brand] || (brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : 'Card');
}

function CardSkeleton() {
    return (
        <div className="animate-pulse rounded-xl border border-marquee-line bg-marquee-panel p-5">
            <div className="h-4 w-24 rounded bg-marquee-panel2" />
            <div className="mt-4 h-3 w-32 rounded bg-marquee-panel2" />
            <div className="mt-2 h-3 w-28 rounded bg-marquee-panel2" />
        </div>
    );
}

export default function PaymentMethods() {
    const { t } = useTranslation('account');
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [removeTarget, setRemoveTarget] = useState(null);
    const [removing, setRemoving] = useState(false);
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        loadMethods();
    }, []);

    async function loadMethods() {
        setLoading(true);
        setError('');
        try {
            const data = await getPaymentMethods();
            setMethods(data.paymentMethods || []);
        } catch (err) {
            setError(err.message || 'Failed to load payment methods.');
            toast.error('Failed to load payment methods.');
        } finally {
            setLoading(false);
        }
    }

    async function handleMakeDefault(id) {
        setBusyId(id);
        try {
            await setDefaultPaymentMethod(id);
            setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
            toast.success('Default payment method updated.');
        } catch (err) {
            toast.error(err.message || 'Failed to update default payment method.');
        } finally {
            setBusyId(null);
        }
    }

    async function confirmRemove() {
        if (!removeTarget) return;
        setRemoving(true);
        try {
            await deletePaymentMethod(removeTarget.id);
            setMethods((prev) => prev.filter((m) => m.id !== removeTarget.id));
            toast.success('Payment method removed.');
            setRemoveTarget(null);
        } catch (err) {
            toast.error(err.message || 'Failed to remove payment method.');
        } finally {
            setRemoving(false);
        }
    }

    return (
        <div>
            <main className="flex-1 rounded-xl bg-marquee-panel">
                <div className="mb-8 flex flex-col gap-4 border-b border-marquee-line pb-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                            {t('paymentMethodHeader')}
                        </h2>

                        <p className="mt-1 text-sm text-marquee-muted">
                            {t('managePayments')}
                        </p>
                    </div>


                    {!loading && methods.length > 0 && (
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="flex items-center gap-2 rounded-full bg-marquee-gold px-5 py-2.5 text-sm font-semibold text-marquee-bg transition hover:bg-marquee-goldBright"
                        >
                            <Plus className="h-4 w-4" /> {t('addPaymentMethod')}
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <CardSkeleton />
                        <CardSkeleton />
                    </div>
                )}

                {!loading && error && (
                    <p className="rounded-md border border-marquee-marquee/40 bg-marquee-marquee/10 px-4 py-3 text-sm text-marquee-marquee">
                        {error}
                    </p>
                )}

                {!loading && !error && methods.length === 0 && (
                    <div className="rounded-xl border border-dashed border-marquee-line bg-marquee-bg p-10 text-center">
                        <CreditCard className="mx-auto mb-3 h-8 w-8 text-marquee-goldDim" />
                        <p className="font-serif text-lg text-marquee-cream">No saved payment methods</p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-marquee-muted">
                            Add a card to make your future GoldCinema checkout experience faster.
                        </p>
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-marquee-gold px-6 py-2.5 text-sm font-semibold text-marquee-bg transition hover:bg-marquee-goldBright"
                        >
                            <Plus className="h-4 w-4" /> Add payment method
                        </button>
                    </div>
                )}

                {!loading && !error && methods.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AnimatePresence initial={false}>
                            {methods.map((method) => (
                                <motion.div
                                    key={method.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className={`rounded-2xl p-4 transition-colors ${method.isDefault ? 'bg-marquee-bg/60 ring-1 ring-marquee-gold/40' : 'bg-marquee-bg/30 hover:bg-marquee-bg/50'}`}
                                >
                                    <div className="relative w-full">
                                        <CreditCard3D
                                            cardType={method.brand}
                                            cardNumber={`000000000000${method.last4}`}
                                            expirationDate={`${String(method.expMonth).padStart(2, '0')}/${String(method.expYear).slice(-2)}`}
                                        />

                                        {method.isDefault && (
                                            <span className="absolute -right-2 -top-2 z-10 flex items-center gap-1 rounded-full border border-marquee-gold/40 bg-marquee-panel px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-marquee-gold shadow-md">
                                                <Star className="h-3 w-3 fill-current" />
                                                {t('default')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-marquee-line/60 pt-4">
                                        {method.isDefault ? (
                                            <span className="text-xs text-marquee-muted">{t('defaultPaymentMethod')}</span>
                                        ) : (
                                            <button
                                                onClick={() => handleMakeDefault(method.id)}
                                                disabled={busyId === method.id}
                                                className="text-xs font-semibold text-marquee-gold hover:text-marquee-goldBright transition disabled:opacity-50"
                                            >
                                                {busyId === method.id ? 'Updating...' : 'Make default'}
                                            </button>
                                        )}

                                        <button onClick={() => setRemoveTarget(method)} className="flex items-center gap-1 text-xs font-medium text-marquee-marquee/90 hover:text-marquee-marquee transition">
                                            <Trash2 className="h-3.5 w-3.5" /> {t('remove')}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <AddPaymentMethodModal
                    isOpen={isAddOpen}
                    onClose={() => setIsAddOpen(false)}
                    onAdded={() => {
                        setIsAddOpen(false);
                        loadMethods();
                    }}
                />

                <RemovePaymentMethodModal
                    isOpen={Boolean(removeTarget)}
                    title="Remove payment method?"
                    description={
                        removeTarget
                            ? `Are you sure you want to remove ${formatBrand(removeTarget.brand)} •••• ${removeTarget.last4}? This card will no longer be available for checkout.`
                            : ''
                    }
                    confirmLabel="Remove"
                    isSubmitting={removing}
                    confirmationText="REMOVE"
                    onConfirm={confirmRemove}
                    onClose={() => !removing && setRemoveTarget(null)}
                />
            </main>
        </div>
    );
}