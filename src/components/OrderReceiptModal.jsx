import React from 'react';
import { CheckCircle2, Clock, X, ArrowRight, Calendar, Sparkles } from 'lucide-react';

export default function OrderReceiptModal({ order, onClose, onViewLiveQueue }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-700" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Order Confirmed & Queued
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1.5">Digital Pickup Ticket</h2>
          <p className="text-xs text-slate-500">
            Show this token at the collection counter when your status is ready.
          </p>
        </div>

        {/* Digital Pickup Token Box */}
        <div className="bg-emerald-950 text-white p-5 rounded-2xl space-y-2 relative shadow-inner">
          <div className="text-[11px] text-emerald-300 font-bold uppercase tracking-widest">
            YOUR PICKUP TOKEN
          </div>
          <div className="text-5xl font-black tracking-wider text-white">
            {order.tokenNumber}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-100 font-semibold bg-emerald-900/90 py-1.5 px-3 rounded-xl mx-auto w-fit border border-emerald-800">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>
              Est. Preparation: ~{order.estimatedWaitMinutes || 10} mins
            </span>
          </div>

          <span className="block text-[10px] text-emerald-400/80 italic">
            * Estimated time based on active queue, not guaranteed completion time.
          </span>
        </div>

        {/* Scheduled Info if applicable */}
        {order.isScheduled && (
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900 font-semibold flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span>
              Scheduled Pickup: {order.pickupDate} at {order.pickupTime}
            </span>
          </div>
        )}

        {/* Order Details Breakdown */}
        <div className="bg-slate-50 p-3.5 rounded-2xl text-left border border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-900 font-bold border-b border-slate-200 pb-1.5">
            <span>Customer: {order.customerName}</span>
            <span className="text-emerald-900">₹{order.totalAmount} • {order.paymentMethod}</span>
          </div>
          <ul className="space-y-1 text-slate-600">
            {order.items.map((it, idx) => (
              <li key={idx} className="flex justify-between font-medium">
                <span>{it.quantity}x {it.name}</span>
                <span className="font-bold text-slate-800">₹{it.price * it.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              if (onViewLiveQueue) onViewLiveQueue(order);
            }}
            className="w-full py-3 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Track Order Status</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
