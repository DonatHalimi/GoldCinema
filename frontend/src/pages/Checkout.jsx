import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import StripeCheckout from '../components/checkout/StripeCheckout';
import PaypalCheckout from '../components/checkout/PaypalCheckout';
import PaymentSection from '../components/checkout/PaymentSelection';
import ExpiredHold from '../components/checkout/ExpiredHold';
import SeatHoldTimer from '../components/checkout/SeatHoldTimer';
import CheckoutSummary from '../components/checkout/CheckoutSummary';

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

      <CheckoutSummary
        movie={movie}
        showtime={showtime}
        order={order}
      />

      <SeatHoldTimer
        secondsLeft={secondsLeft}
        expired={expired}
        extending={extending}
        onExtend={extendHold}
      />

      {expired ? (
        <ExpiredHold onBack={() => navigate(-1)} />
      ) : (
        <PaymentSection
          provider={provider}
          setProvider={setProvider}
          order={order}
          onSuccess={handleSuccess}
          onError={setPayError}
          payError={payError}
        />
      )}

    </div>
  );
}