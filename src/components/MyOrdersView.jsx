import React, { useState } from 'react';
import { 
  ReceiptText, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  RotateCcw, 
  Star, 
  Ban, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  MessageSquare,
  Send
} from 'lucide-react';
import { useOrders } from '../context/OrderContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function MyOrdersView({ onOrderAgainSuccess }) {
  const { orders, cancelOrder, rateOrder, reorderItems } = useOrders();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [ratingModalOrder, setRatingModalOrder] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [actionError, setActionError] = useState('');

  // Filter orders for current authenticated student
  const studentOrders = orders.filter(o => !currentUser || o.studentId === currentUser.uid);

  const activeOrders = studentOrders.filter(
    o => o.status !== 'Collected' && o.status !== 'Cancelled' && o.status !== 'Rejected'
  );

  const historyOrders = studentOrders.filter(
    o => o.status === 'Collected' || o.status === 'Cancelled' || o.status === 'Rejected'
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCancel = async (orderId) => {
    try {
      setActionError('');
      await cancelOrder(orderId);
      setCancellingOrderId(null);
      showToast('Order successfully cancelled.');
    } catch (err) {
      setActionError(err.message || 'Cannot cancel order.');
    }
  };

  const handleRate = async (e) => {
    e.preventDefault();
    if (!ratingModalOrder) return;
    try {
      await rateOrder(ratingModalOrder.id, selectedRating, feedbackText);
      setRatingModalOrder(null);
      setFeedbackText('');
      showToast('Thank you for rating your food!');
    } catch (err) {
      setActionError(err.message || 'Error submitting rating.');
    }
  };

  const handleReorder = (order) => {
    const { addedCount, unavailableItems } = reorderItems(order);
    if (unavailableItems.length > 0) {
      showToast(`Added ${addedCount} items. Note: ${unavailableItems.join(', ')} is currently Sold Out.`);
    } else {
      showToast(`Added ${addedCount} items to your tray! Open tray to confirm order.`);
    }
    if (onOrderAgainSuccess) onOrderAgainSuccess();
  };

  const orderStatuses = ['Order Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Collected'];

  const getStatusStepIndex = (status) => {
    const idx = orderStatuses.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ReceiptText className="w-4 h-4 text-emerald-700" />
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
              Student Orders
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
            My Orders & Tokens
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track real-time cooking progress, view tokens, and review completed orders.
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'active'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Tickets ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Orders ({historyOrders.length})
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Orders List */}
      {(activeTab === 'active' ? activeOrders : historyOrders).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <ReceiptText className="w-10 h-10 text-slate-300 mx-auto mb-1" />
          <h3 className="text-sm font-bold text-slate-700">
            {activeTab === 'active' ? 'No active orders in preparation' : 'No past orders recorded'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {activeTab === 'active' 
              ? 'Place an order from the menu to get your digital queue token.' 
              : 'Your collected and previous orders will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(activeTab === 'active' ? activeOrders : historyOrders).map((order) => {
            const currentStep = getStatusStepIndex(order.status);
            const isTerminal = order.status === 'Cancelled' || order.status === 'Rejected';
            const canCancel = order.status === 'Order Placed' || order.status === 'Accepted';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Big Token Display */}
                    <div className="bg-emerald-950 text-white px-3 py-1.5 rounded-xl text-center shadow-xs">
                      <span className="text-[9px] text-emerald-300 uppercase tracking-widest block font-bold">TOKEN</span>
                      <span className="text-xl font-black">{order.tokenNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                          order.status === 'Ready for Pickup' ? 'bg-emerald-600 text-white animate-pulse' :
                          order.status === 'Preparing' ? 'bg-amber-100 text-amber-900' :
                          order.status === 'Accepted' ? 'bg-blue-100 text-blue-900' :
                          order.status === 'Collected' ? 'bg-slate-200 text-slate-800' :
                          isTerminal ? 'bg-red-100 text-red-800' :
                          'bg-emerald-100 text-emerald-900'
                        }`}>
                          {order.status}
                        </span>

                        {order.isScheduled && (
                          <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Scheduled: {order.pickupTime}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-500 block mt-1">
                        Ordered at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.items.length} items
                      </span>
                    </div>
                  </div>

                  {/* Estimated Wait / Time Status */}
                  <div className="text-right">
                    {!isTerminal && order.status !== 'Collected' && (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Est. Prep: ~{order.estimatedWaitMinutes || 10}m</span>
                      </div>
                    )}
                    <span className="text-xs font-black text-slate-900 block mt-1">
                      ₹{order.totalAmount} ({order.paymentMethod})
                    </span>
                  </div>
                </div>

                {/* Progress Stepper (Only for active and completed non-cancelled orders) */}
                {!isTerminal && (
                  <div className="p-4 border-b border-slate-100 bg-white">
                    <div className="relative flex items-center justify-between max-w-xl mx-auto">
                      {/* Connecting Line */}
                      <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-4 h-1 bg-emerald-700 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${(currentStep / (orderStatuses.length - 1)) * 90}%` }}
                      />

                      {orderStatuses.map((st, idx) => {
                        const isPassed = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                          <div key={st} className="relative z-10 flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isPassed 
                                ? 'bg-emerald-900 text-white shadow-xs ring-4 ring-emerald-50' 
                                : 'bg-white border-2 border-slate-300 text-slate-400'
                            }`}>
                              {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-[10px] mt-1 text-center font-bold max-w-[4.5rem] leading-tight ${
                              isCurrent ? 'text-emerald-900' : isPassed ? 'text-slate-700' : 'text-slate-400'
                            }`}>
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items Breakdown */}
                <div className="p-4 space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-950 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                            {it.quantity}x
                          </span>
                          <span className="font-semibold text-slate-800">{it.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                    {order.specialInstructions && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                        Note: {order.specialInstructions}
                      </p>
                    )}
                  </div>

                  {/* Actions & Rating Box */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    
                    {/* Cancellation handling */}
                    {activeTab === 'active' && (
                      canCancel ? (
                        <button
                          onClick={() => setCancellingOrderId(order.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold italic">
                          Cancellation closed (kitchen preparing)
                        </span>
                      )
                    )}

                    {/* Order Again (Reorder) button */}
                    <div className="flex items-center gap-2 ml-auto">
                      {order.status === 'Collected' && !order.rating && (
                        <button
                          onClick={() => setRatingModalOrder(order)}
                          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>Rate Food</span>
                        </button>
                      )}

                      {order.rating && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Rated {order.rating}/5</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Order Again</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3 border border-slate-200 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" /> Confirm Order Cancellation
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this order? This will release your token and alert canteen staff.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingOrderId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Keep Order
              </button>
              <button
                onClick={() => handleCancel(cancellingOrderId)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating & Feedback Modal */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleRate} className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Rate Food Quality
            </h3>
            <p className="text-xs text-slate-600">
              How was your meal for Token <strong>{ratingModalOrder.tokenNumber}</strong>?
            </p>

            {/* 5-star selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star className={`w-7 h-7 ${star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Optional Feedback</label>
              <textarea
                rows={3}
                placeholder="Delicious taste, good packaging, warm food..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRatingModalOrder(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-900 hover:bg-emerald-800 text-white flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-emerald-300" /> Submit Review
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
