import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  Sparkles,
  Info
} from 'lucide-react';
import { useOrders } from '../context/OrderContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartDrawer({ isOpen, onClose, onOrderSuccess }) {
  const { cart, updateCartQuantity, removeFromCart, clearCart, placeOrder, settings } = useOrders();
  const { currentUser } = useAuth();

  const [customerName, setCustomerName] = useState(currentUser?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(currentUser?.phone || '9876543210');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Scheduled / Pre-Order states
  const [isScheduled, setIsScheduled] = useState(false);
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState(() => {
    // Default to 45 mins in the future
    const d = new Date(Date.now() + 45 * 60000);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const order = await placeOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        paymentMethod,
        specialInstructions,
        isScheduled,
        pickupDate: isScheduled ? pickupDate : null,
        pickupTime: isScheduled ? pickupTime : null
      });

      onClose();
      if (onOrderSuccess) {
        onOrderSuccess(order);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10 h-full">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-300" />
            <h2 className="text-base font-bold">Your Order Tray</h2>
            <span className="bg-emerald-800 text-emerald-100 text-xs font-bold px-2 py-0.5 rounded-full">
              {totalItemCount} Items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & Items Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">Tray is currently empty</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Select freshly cooked food items or combo deals from the menu to get your digital pickup token.
              </p>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-1">
                  <span>Selected Items</span>
                  <button 
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-bold normal-case text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Tray
                  </button>
                </div>

                {cart.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <div className="space-y-0.5 max-w-[55%]">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        <span className="font-bold text-slate-800 truncate block">{item.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">₹{item.price} each</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Stepper */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-extrabold px-2 text-slate-900 min-w-[1.2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-emerald-950 min-w-[3rem] text-right">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Mode: Immediate vs Scheduled */}
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    Pickup Schedule
                  </span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setIsScheduled(false)}
                      className={`px-2 py-0.5 rounded transition-all ${
                        !isScheduled ? 'bg-emerald-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      Immediate
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsScheduled(true)}
                      className={`px-2 py-0.5 rounded transition-all ${
                        isScheduled ? 'bg-emerald-900 text-white' : 'text-slate-600'
                      }`}
                    >
                      Schedule
                    </button>
                  </div>
                </div>

                {!isScheduled ? (
                  <p className="text-[11px] text-emerald-800">
                    Your food preparation starts immediately upon token confirmation (~10 mins wait).
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] text-slate-600">
                      Canteen Operating Hours: <strong>{settings.operatingHours.open} - {settings.operatingHours.close}</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date</label>
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Time</label>
                        <input
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Student Details Form */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter student name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Special Cooking Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Less spicy, pack chutney separately"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
                  />
                </div>

                {/* Payment Option */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'Cash', 'Campus Card'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          paymentMethod === method
                            ? 'bg-emerald-900 border-emerald-900 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer with Calculations and Confirm Order Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Canteen Service Fee</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-black text-emerald-950 pt-1 border-t border-slate-200">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Token...</span>
              ) : (
                <>
                  <span>Confirm Order • ₹{totalAmount}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
