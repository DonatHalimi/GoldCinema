import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import ExpiredHold from '../components/checkout/ExpiredHold';
import GiftCardBox from '../components/checkout/GiftCardBox';
import GiftCardFullCoverage from '../components/checkout/GiftCardFullCoverage';
import PaymentSection from '../components/checkout/PaymentSelection';
import SeatHoldTimer from '../components/checkout/SeatHoldTimer';
import { useNotifications } from '../context/NotificationContext';
import { useExtendSeatHoldMutation, useGetOrderQuery } from '../store/api/bookingsApiSlice';
import { useGetPaymentMethodsQuery } from '../store/api/paymentsApiSlice';
import { clearBooking } from '../store/slices/bookingSlice';
import { resetCheckout, setCheckoutOrder, setPaymentProvider } from '../store/slices/checkoutSlice';
import { apiSlice } from '../store/api/apiSlice';

export default function Checkout() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { fetchNotifications } = useNotifications();
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.checkout.provider);
  const { currentData: order, isLoading: loading, error: orderError } = useGetOrderQuery(orderId);
  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useGetPaymentMethodsQuery();
  const [extendHoldRequest, { isLoading: extending }] = useExtendSeatHoldMutation();

  const [payError, setPayError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(null);
  const movie = order?.movie;
  const showtime = order?.showtime;

  useEffect(() => {
    dispatch(setCheckoutOrder(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (order?.paymentStatus === 'paid') {
      navigate(`/confirmation/${order._id}`, { replace: true });
    }
  }, [navigate, order]);

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

      const data = await extendHoldRequest(order.holdId).unwrap();
      dispatch(apiSlice.util.updateQueryData('getOrder', orderId, (draft) => {
        draft.holdExpiresAt = data.hold.expiresAt;
      }));
    } catch (err) {
      setPayError(err.data?.error || err.message || 'Failed to extend hold');
    }
  }

  async function handleSuccess(response) {
    const paidOrder = response.order ?? response;

    if (!paidOrder?._id) {
      setPayError('Payment completed but order ID missing.');
      return;
    }

    sessionStorage.removeItem(`selectedSeats-${order.showtime?._id || order.showtime}`);
    dispatch(resetCheckout());
    dispatch(clearBooking());
    await fetchNotifications();

    navigate(`/confirmation/${paidOrder._id}`);
  }

  if (loading) {
    return (
      <p className="py-20 text-center text-marquee-muted">
        Loading...
      </p>
    );
  }

  if (orderError || !order) {
    return (
      <p className="py-20 text-center text-marquee-marquee">
        {orderError?.data?.error || 'Order not found'}
      </p>
    );
  }

  const expired = secondsLeft === 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="mb-2 text-center font-serif text-3xl font-bold text-marquee-cream">
        Complete your purchase
      </h1>

      <p className="mb-12 text-center text-sm text-marquee-muted">
        Review your order and complete payment before your seats are released
      </p>

      <section>
        <h2 className="mb-6 font-body text-sm uppercase tracking-widest text-marquee-muted">
          Order summary
        </h2>

        <CheckoutSummary movie={movie} showtime={showtime} order={order} />

        {!expired && order.totalAmount > 0 && (
          <div className="mt-8">
            <GiftCardBox order={order} onOrderUpdated={(updatedOrder) => {
              dispatch(apiSlice.util.updateQueryData('getOrder', orderId, () => updatedOrder));
            }} />
          </div>
        )}
      </section>

      {expired ? (
        <div className="mt-16 border-t border-marquee-line pt-10">
          <ExpiredHold onBack={() => navigate(-1)} />
        </div>
      ) : order.totalAmount === 0 ? (
        <div className="mt-16 border-t border-marquee-line pt-10">
          <GiftCardFullCoverage order={order} onSuccess={handleSuccess} />
        </div>
      ) : (
        <section className="mt-16 border-t border-marquee-line pt-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-body text-sm uppercase tracking-widest text-marquee-muted">
              Payment
            </h2>

            <SeatHoldTimer
              secondsLeft={secondsLeft}
              expired={expired}
              extending={extending}
              onExtend={extendHold}
              inline
            />
          </div>

          <PaymentSection
            key={order.totalAmount}
            provider={provider}
            setProvider={(value) => dispatch(setPaymentProvider(value))}
            order={order}
            onSuccess={handleSuccess}
            onError={setPayError}
            payError={payError}
            paymentMethods={paymentMethods}
            paymentMethodsLoading={paymentMethodsLoading}
          />
        </section>
      )}
    </div>
  );
}