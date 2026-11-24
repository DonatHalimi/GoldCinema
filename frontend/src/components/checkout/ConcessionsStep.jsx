import { memo, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ChevronDown,
  Package,
} from 'lucide-react';
import {
  useGetConcessionsQuery,
  useSetOrderConcessionsMutation,
} from '../../store/api/bookingsApiSlice';

const CATEGORIES = ['Combo Deals', 'Popcorn', 'Drinks', 'Candy'];
const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const accordionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.25, ease: 'easeInOut' },
      opacity: { duration: 0.15 },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: 'easeOut' },
      opacity: { duration: 0.2, delay: 0.08 },
    },
  },
};

const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
};

const AnimatedAccordion = memo(function AnimatedAccordion({
  category,
  items,
  quantities,
  expanded,
  saving,
  onToggle,
  onQuantityChange,
}) {
  const categorySelected = items.reduce(
    (count, item) => count + (quantities[item.id] || 0),
    0
  );

  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout={!shouldReduceMotion}
      className={`overflow-hidden rounded-xl border transition-colors duration-200 ${expanded
          ? 'border-marquee-gold/40 bg-marquee-panel2'
          : 'border-marquee-line bg-marquee-panel2 hover:border-marquee-gold/25'
        }`}
    >
      <motion.button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-marquee-gold/[0.03]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <motion.span
            animate={{
              backgroundColor: expanded
                ? 'rgba(212, 175, 55, 0.1)'
                : 'rgba(0, 0, 0, 0)',
            }}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${expanded
                ? 'border-marquee-gold/40 text-marquee-gold'
                : 'border-marquee-line bg-marquee-bg text-marquee-muted'
              }`}
          >
            <Package size={16} />
          </motion.span>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-marquee-cream">
              {category}
            </h3>
            <p className="mt-0.5 text-[11px] text-marquee-muted">
              {items.length} {items.length === 1 ? 'product' : 'products'}
              {categorySelected > 0 && (
                <span className="text-marquee-gold">
                  {' '}· {categorySelected} selected
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <AnimatePresence mode="popLayout">
            {categorySelected > 0 && (
              <motion.span
                key="selected-count"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                className="flex h-6 min-w-6 items-center justify-center rounded-full bg-marquee-gold px-2 text-[10px] font-bold text-marquee-bg"
              >
                {categorySelected}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.25,
              ease: 'easeInOut',
            }}
            className="text-marquee-muted"
          >
            <ChevronDown size={17} />
          </motion.span>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="accordion-content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={accordionVariants}
            className="overflow-hidden"
          >
            <div className="border-t border-marquee-line p-3 sm:p-4">
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-3 sm:grid-cols-2"
              >
                {items.map((item) => (
                  <ConcessionCard
                    key={item.id}
                    item={item}
                    quantity={quantities[item.id] || 0}
                    saving={saving}
                    onQuantityChange={onQuantityChange}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

const ConcessionCard = memo(function ConcessionCard({
  item,
  quantity,
  saving,
  onQuantityChange,
}) {
  const shouldReduceMotion = useReducedMotion();

  const savings =
    item.isCombo && item.originalPrice
      ? item.originalPrice - item.price
      : 0;

  return (
    <motion.article
      variants={itemVariants}
      layout={!shouldReduceMotion}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      className="overflow-hidden rounded-lg border border-marquee-line bg-marquee-panel transition-colors hover:border-marquee-gold/25"
    >
      <div className="relative h-32 overflow-hidden bg-marquee-bg">
        {item.image ? (
          <motion.img
            src={item.image}
            alt={item.name}
            loading="lazy"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-marquee-muted">
            <Package size={28} />
          </div>
        )}

        {item.isCombo && (
          <span className="absolute left-3 top-3 rounded-full border border-marquee-gold/50 bg-marquee-bg/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-marquee-gold">
            Combo deal
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-marquee-cream">
            {item.name}
          </h4>

          <div className="shrink-0 text-right">
            <p className="font-display text-base text-marquee-gold">
              {formatMoney(item.price)}
            </p>

            {savings > 0 && (
              <p className="text-[10px] text-marquee-muted">
                <span className="line-through">
                  {formatMoney(item.originalPrice)}
                </span>
                <span className="ml-1 text-emerald-400">
                  Save {formatMoney(savings)}
                </span>
              </p>
            )}
          </div>
        </div>

        <p className="mt-1.5 min-h-8 text-[11px] leading-4 text-marquee-muted">
          {item.description}
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-marquee-line pt-3">
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              aria-label={`Decrease ${item.name} quantity`}
              disabled={quantity === 0 || saving}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
              onClick={() => onQuantityChange(item.id, -1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-marquee-line text-marquee-cream transition hover:border-marquee-gold/60 hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={13} />
            </motion.button>

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={quantity}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.12 }}
                className="min-w-5 text-center text-sm font-semibold tabular-nums text-marquee-cream"
              >
                {quantity}
              </motion.span>
            </AnimatePresence>

            <motion.button
              type="button"
              aria-label={`Increase ${item.name} quantity`}
              disabled={quantity >= 20 || saving}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
              onClick={() => onQuantityChange(item.id, 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-marquee-gold/50 text-marquee-gold transition hover:bg-marquee-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={13} />
            </motion.button>
          </div>

          <motion.button
            type="button"
            disabled={quantity === 0 || saving}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            onClick={() => onQuantityChange(item.id, -quantity)}
            className="inline-flex items-center gap-1.5 text-[11px] text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={12} />
            Remove
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
});

const CheckoutFooter = memo(function CheckoutFooter({
  total,
  selectedCount,
  saving,
  onSkip,
  onContinue,
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      className="mt-5 border-t border-marquee-line pt-4"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-marquee-muted">
            Concessions total
          </p>
          <p className="mt-0.5 text-xs text-marquee-muted">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </p>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={total}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="font-display text-xl font-bold text-marquee-gold"
          >
            {formatMoney(total)}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <motion.button
          type="button"
          disabled={saving}
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          onClick={onSkip}
          className="rounded-full border border-marquee-line px-5 py-3 text-xs font-semibold text-marquee-muted transition hover:border-marquee-gold/50 hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          Skip Snacks &amp; Continue
        </motion.button>

        <motion.button
          type="button"
          disabled={saving}
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          onClick={onContinue}
          className="rounded-full bg-marquee-gold px-6 py-3 text-xs font-bold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-wait disabled:opacity-60"
        >
          {saving
            ? 'Saving...'
            : `Continue to Payment · ${formatMoney(total)}`}
        </motion.button>
      </div>
    </motion.div>
  );
});

export default function ConcessionsStep({ orderId }) {
  const {
    data: concessions = [],
    isLoading,
    error: loadError,
  } = useGetConcessionsQuery();

  const [setOrderConcessions, { isLoading: saving }] =
    useSetOrderConcessionsMutation();

  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('Combo Deals');

  const shouldReduceMotion = useReducedMotion();

  const total = useMemo(
    () =>
      concessions.reduce(
        (cents, item) =>
          cents +
          Math.round(Number(item.price || 0) * 100) *
          (quantities[item.id] || 0),
        0
      ) / 100,
    [concessions, quantities]
  );

  const selectedCount = useMemo(
    () =>
      Object.values(quantities).reduce(
        (count, quantity) => count + quantity,
        0
      ),
    [quantities]
  );

  function changeQuantity(id, amount) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max(0, Math.min(20, (current[id] || 0) + amount)),
    }));
  }

  async function continueToPayment(skip = false) {
    setError('');

    const items = skip
      ? []
      : Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([catalogId, quantity]) => ({ catalogId, quantity }));

    try {
      await setOrderConcessions({ orderId, items }).unwrap();
    } catch (requestError) {
      setError(
        requestError.data?.error ||
        requestError.message ||
        'Unable to save concessions.'
      );
    }
  }

  function toggleCategory(category) {
    setExpandedCategory((current) =>
      current === category ? null : category
    );
  }

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rounded-xl border border-marquee-line bg-marquee-panel p-4 sm:p-6"
    >
      <div className="mb-5 flex items-start gap-3">
        <motion.span
          initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-marquee-gold/30 bg-marquee-gold/10 text-marquee-gold"
        >
          <ShoppingBag size={18} />
        </motion.span>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-marquee-goldDim">
            Optional checkout step
          </p>

          <h2 className="mt-1 font-serif text-xl font-bold text-marquee-cream sm:text-2xl">
            Snacks &amp; Concessions
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-marquee-muted">
            Add snacks and drinks for pickup at the cinema, or skip this step.
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 8 }}
              className="shrink-0 rounded-lg border border-marquee-gold/30 bg-marquee-gold/10 px-3 py-2 text-right"
            >
              <p className="text-lg font-bold leading-none text-marquee-gold">
                {selectedCount}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-wider text-marquee-muted">
                Selected
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-8 text-sm text-marquee-muted"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-marquee-gold/30 border-t-marquee-gold" />
            Loading concessions...
          </motion.div>
        )}
      </AnimatePresence>

      {loadError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-lg border border-marquee-marquee/30 bg-marquee-marquee/10 p-3 text-xs text-marquee-marquee"
        >
          Concessions could not be loaded. You can still skip this step and
          continue.
        </motion.div>
      )}

      {!isLoading && (
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {CATEGORIES.map((category) => {
            const items = concessions.filter(
              (item) => item.category === category
            );

            if (!items.length) return null;

            return (
              <AnimatedAccordion
                key={category}
                category={category}
                items={items}
                quantities={quantities}
                expanded={expandedCategory === category}
                saving={saving}
                onToggle={() => toggleCategory(category)}
                onQuantityChange={changeQuantity}
              />
            );
          })}

          {!concessions.length && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-marquee-line p-5 text-center text-sm text-marquee-muted"
            >
              No concessions are currently available.
            </motion.p>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            role="alert"
            className="mt-4 overflow-hidden rounded-lg border border-marquee-marquee/30 bg-marquee-marquee/10 p-3 text-xs text-marquee-marquee"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <CheckoutFooter
        total={total}
        selectedCount={selectedCount}
        saving={saving}
        onSkip={() => continueToPayment(true)}
        onContinue={() => continueToPayment(false)}
      />
    </motion.section>
  );
}