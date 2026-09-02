import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';


import { getOrderById } from '../api/orders';
import { getPaymentMethods } from '../api/payments';
import { extendSeatHold } from '../api/seatHolds';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import ExpiredHold from '../components/checkout/ExpiredHold';
import PaymentSection from '../components/checkout/PaymentSelection';
import SeatHoldTimer from '../components/checkout/SeatHoldTimer';

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState(null);

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

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

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  async function loadOrder() {
    try {
      console.log('Checkout orderId:', orderId);

      const result = await getOrderById(orderId);

      console.log('Checkout getOrderById result:', result);

      const data = result.data ?? result;

      console.log('Checkout order data:', data);

      const loadedOrder = data.order;

      console.log('Checkout loaded order:', loadedOrder);

      if (!loadedOrder) {
        throw new Error('Order was not returned by the API');
      }

      setOrder(loadedOrder);
      setMovie(loadedOrder.movie);
      setShowtime(loadedOrder.showtime);

      if (loadedOrder.paymentStatus === 'paid') {
        navigate(`/confirmation/${loadedOrder._id}`, {
          replace: true,
        });
      }
    } catch (err) {
      console.error('Checkout loadOrder failed:', err);
      console.error('Response:', err.response?.data);

      setLoadError(
        err.response?.data?.error ||
        err.message ||
        'Failed to load order'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPaymentMethods() {
    try {
      setPaymentMethodsLoading(true);

      const data = await getPaymentMethods();

      setPaymentMethods(data.paymentMethods || []);
    } catch (err) {
      console.error('Failed to load saved payment methods:', err);
      setPaymentMethods([]);
    } finally {
      setPaymentMethodsLoading(false);
    }
  }

  useEffect(() => {
    if (!order?.holdExpiresAt) return;

    function updateTimer() {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(order.holdExpiresAt).getTime() -
            Date.now()) /
          1000
        )
      );

      setSecondsLeft(remaining);
    }

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order]);

  async function extendHold() {
    try {
      setExtending(true);

      const { data } = await extendSeatHold(order.holdId);

      setOrder((prev) => ({
        ...prev,
        holdExpiresAt: data.hold.expiresAt,
      }));
    } catch (err) {
      setPayError(err.response?.data?.error || err.message || 'Failed to extend hold');
    } finally {
      setExtending(false);
    }
  }

  function handleSuccess(response) {
    const paidOrder = response.order ?? response;

    if (!paidOrder?._id) {
      setPayError('Payment completed but order ID missing.');
      return;
    }

    sessionStorage.removeItem(`selectedSeats-${order.showtime}`);

    navigate(`/confirmation/${paidOrder._id}`);
  }

  if (loading) {
    return (
      <p className="py-20 text-center text-marquee-muted">
        Loading...
      </p>
    );
  }

  if (loadError || !order) {
    return (
      <p className="py-20 text-center text-marquee-marquee">
        {loadError || 'Order not found'}
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
          paymentMethods={paymentMethods}
          paymentMethodsLoading={paymentMethodsLoading}
        />
      )}
    </div>
  );
}