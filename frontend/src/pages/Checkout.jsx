import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client'; ``
import StripeCheckout from '../components/StripeCheckout';
import PaypalCheckout from '../components/PaypalCheckout';

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [paymentReady, setPaymentReady] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [payError, setPayError] = useState('');

  const [provider, setProvider] = useState('stripe');

  const [secondsLeft, setSecondsLeft] = useState(null);
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function loadOrder() {
    try {
      const { data } = await api.get(`/orders/${orderId}`);

      const loadedOrder = data.order;

      setOrder(loadedOrder);
      setMovie(loadedOrder.movie);
      setShowtime(loadedOrder.showtime);

      if (loadedOrder.paymentStatus === 'paid') {
        navigate(`/confirmation/${loadedOrder._id}`, {
          replace: true
        });
      }
    } catch (err) {
      console.error("ORDER LOAD ERROR:", err);
      setLoadError(
        err.response?.data?.error ||
        err.message ||
        'Failed to load order'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!order?.holdExpiresAt) return;

    function updateTimer() {
      const remaining = Math.max(0, Math.floor((new Date(order.holdExpiresAt).getTime() - Date.now()) / 1000));

      setSecondsLeft(remaining);
    }
    updateTimer();

    const interval = setInterval(
      updateTimer,
      1000
    );

    return () => clearInterval(interval);
  }, [order]);

  async function extendHold() {
    try {
      setExtending(true);

      const { data } = await api.post('/extend-hold', { holdId: order.holdId });
      setOrder(prev => ({
        ...prev,
        holdExpiresAt: data.hold.expiresAt
      }));
    } catch (err) {
      setPayError(
        err.response?.data?.error ||
        err.message ||
        'Failed to extend hold'
      );
    } finally {
      setExtending(false);
    }
  }

  function handleSuccess(response) {
    const paidOrder = response.order ?? response;

    if (!paidOrder?._id) {
      setPayError("Payment completed but order ID missing.");
      return;
    }

    sessionStorage.removeItem(`selectedSeats-${order.showtime}`);

    navigate(`/confirmation/${paidOrder._id}`);
  }

  if (loadError || !order) {
    return (
      <p className="py-20 text-center text-marquee-marquee">
        {loadError || "Order not found"}
      </p>
    );
  }

  const expired = secondsLeft === 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-center font-serif text-3xl font-bold text-marquee-cream">
        Complete your purchase
      </h1>

      <div className="mb-8 rounded-xl border border-marquee-line bg-marquee-panel p-6">
        <div className="flex justify-between gap-4">
          <div className="flex gap-5">
            {movie?.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={`${movie.title} poster`}
                className="h-52 w-36 rounded-lg border border-marquee-line object-cover shadow-glow"
              />
            )}

            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-marquee-goldDim">
                {movie?.title}
              </p>

              <p className="mt-1 text-sm text-marquee-muted">
                {movie?.genres?.join(', ')}
                {" · "}
                {movie?.rating}
                {" · "}
                {movie?.duration} min
              </p>

              {showtime && (
                <p className="mt-1 text-sm text-marquee-muted">
                  {new Date(showtime.startTime).toLocaleDateString()}
                  {" · "}
                  {new Date(showtime.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}

              <p className="mt-2 font-mono text-sm text-marquee-muted">
                Seats: {order.seats?.join(', ')}
              </p>
            </div>
          </div>

          <p className="font-display text-3xl tracking-wide text-marquee-gold">
            ${order.totalAmount.toFixed(2)}
          </p>
        </div>

        {secondsLeft !== null && (
          <div className="mt-5 text-center">
            <p
              className={
                `text-sm ${secondsLeft < 60
                  ?
                  'text-marquee-marquee'
                  :
                  'text-marquee-muted'
                }`
              }
            >
              {expired
                ?
                "Your seat hold has expired."
                :
                `Seats reserved for ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
              }
            </p>

            {!expired && (
              <button
                onClick={extendHold}
                disabled={extending}
                className="mt-3 rounded-full border border-marquee-gold px-5 py-2 text-sm text-marquee-gold hover:bg-marquee-gold hover:text-marquee-bg disabled:opacity-40"
              >
                {extending ?
                  "Extending..."
                  :
                  "Extend time"
                }
              </button>
            )
            }
          </div>
        )}
      </div>

      {expired ?
        (
          <div className="rounded-xl border border-marquee-marquee/40 bg-marquee-marquee/10 p-6 text-center">
            <p className="mb-4 text-marquee-cream">
              Your seats are no longer reserved.
            </p>

            <button
              onClick={() => navigate(-1)}
              className="rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg"
            >
              Choose seats again
            </button>
          </div>
        )
        :
        (
          <div className="rounded-xl border border-marquee-line bg-marquee-panel p-6">
            <div className="mb-6 flex gap-2">
              <TabButton
                active={provider === "stripe"}
                onClick={() => setProvider("stripe")}
              >
                Card (Stripe)
              </TabButton>

              <TabButton
                active={provider === "paypal"}
                onClick={() => setProvider("paypal")}
              >
                PayPal
              </TabButton>

            </div>
            {payError && (
              <p className="mb-4 rounded-md border border-marquee-marquee/40 bg-marquee-marquee/10 px-4 py-2 text-sm text-marquee-marquee">
                {payError}
              </p>
            )
            }
            {provider === "stripe"
              ?
              <StripeCheckout
                order={order}
                onSuccess={handleSuccess}
                onError={setPayError}
                onReady={() => setPaymentReady(true)}
              />
              :
              <PaypalCheckout
                order={order}
                onSuccess={handleSuccess}
                onError={setPayError}
              />
            }
            <p className="mt-6 text-center text-xs text-marquee-muted">
              🔒 Payments are processed securely by Stripe and PayPal.
            </p>
          </div>
        )
      }
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 rounded-full border px-4 py-2 text-sm font-semibold transition
        ${active
          ?
          'border-marquee-gold bg-marquee-gold text-marquee-bg'
          :
          'border-marquee-line text-marquee-muted hover:border-marquee-gold hover:text-marquee-gold'
        }
      `}
    >
      {children}
    </button>
  );
}