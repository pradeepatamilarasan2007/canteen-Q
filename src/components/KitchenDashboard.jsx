import React, { useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Play, 
  Ban, 
  Search, 
  Filter, 
  Utensils, 
  Calendar, 
  Phone, 
  Check, 
  DollarSign, 
  AlertCircle,
  TrendingUp,
  X,
  Sliders
} from 'lucide-react';
import { useOrders } from '../context/OrderContext.jsx';

export default function KitchenDashboard() {
  const { orders, updateOrderStatus, updateOrderEstimatedWait } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('active'); // 'active', 'all', 'scheduled', 'ready', 'completed'
  const [adjustingWaitOrderId, setAdjustingWaitOrderId] = useState(null);
  const [customWaitMinutes, setCustomWaitMinutes] = useState(10);
  const [rejectingOrderId, setRejectingOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Item out of stock');

  // Actual Stored Data Statistics
  const todayOrders = orders; // Stored orders for today
  const pendingOrders = orders.filter(o => o.status === 'Order Placed');
  const acceptedOrders = orders.filter(o => o.status === 'Accepted');
  const preparingOrders = orders.filter(o => o.status === 'Preparing');
  const readyOrders = orders.filter(o => o.status === 'Ready for Pickup');
  const collectedOrders = orders.filter(o => o.status === 'Collected');

  const todaySales = orders
    .filter(o => o.status !== 'Cancelled' && o.status !== 'Rejected')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filter and search
  const filteredOrders = orders.filter((ord) => {
    // Search
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q || 
      ord.tokenNumber?.toLowerCase().includes(q) ||
      ord.id?.toLowerCase().includes(q) ||
      ord.customerName?.toLowerCase().includes(q) ||
      ord.phone?.includes(q);

    if (!matchesSearch) return false;

    // Filter type
    if (filterType === 'active') {
      return ord.status === 'Order Placed' || ord.status === 'Accepted' || ord.status === 'Preparing';
    }
    if (filterType === 'ready') {
      return ord.status === 'Ready for Pickup';
    }
    if (filterType === 'scheduled') {
      return ord.isScheduled;
    }
    if (filterType === 'completed') {
      return ord.status === 'Collected';
    }
    return true; // 'all'
  });

  const handleAdjustWait = (e) => {
    e.preventDefault();
    if (adjustingWaitOrderId) {
      updateOrderEstimatedWait(adjustingWaitOrderId, customWaitMinutes);
      setAdjustingWaitOrderId(null);
    }
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (rejectingOrderId) {
      updateOrderStatus(rejectingOrderId, 'Rejected', rejectionReason);
      setRejectingOrderId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header and Statistics Overview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ChefHat className="w-5 h-5 text-emerald-800" />
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                Kitchen Display System (KDS)
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Manage incoming tickets, queue estimates, digital tokens, and prep states.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Synced
            </span>
          </div>
        </div>

        {/* Real Metrics Grid - Stored Data */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Today</span>
            <div className="text-xl font-black text-slate-900">{todayOrders.length}</div>
            <span className="text-[10px] text-slate-500">Recorded orders</span>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">New Placed</span>
            <div className="text-xl font-black text-amber-950">{pendingOrders.length}</div>
            <span className="text-[10px] text-amber-800">Awaiting kitchen</span>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">In Prep</span>
            <div className="text-xl font-black text-blue-950">{preparingOrders.length}</div>
            <span className="text-[10px] text-blue-800">Cooking right now</span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-300">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Ready Pickup</span>
            <div className="text-xl font-black text-emerald-950">{readyOrders.length}</div>
            <span className="text-[10px] text-emerald-700">At counter</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Collected</span>
            <div className="text-xl font-black text-slate-900">{collectedOrders.length}</div>
            <span className="text-[10px] text-slate-500">Fulfilled orders</span>
          </div>

          <div className="bg-emerald-950 text-white p-3 rounded-xl">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Today's Sales</span>
            <div className="text-xl font-black text-white">₹{todaySales}</div>
            <span className="text-[10px] text-emerald-300/80">Net revenue</span>
          </div>

        </div>
      </div>

      {/* Filter and Token Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Token (e.g. CQ025), Order ID, Student Name or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-800 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'active', label: `Active (${pendingOrders.length + acceptedOrders.length + preparingOrders.length})` },
            { id: 'ready', label: `Ready (${readyOrders.length})` },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'completed', label: 'Collected' },
            { id: 'all', label: `All (${orders.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Tickets Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-1" />
          <h3 className="text-sm font-bold text-slate-800">No matching tickets</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            All caught up or try switching your filter options above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => {
            const timeAgoMinutes = Math.floor((Date.now() - new Date(ord.createdAt).getTime()) / 60000);
            
            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
              >
                {/* Ticket Top */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-emerald-950">{ord.tokenNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === 'Ready for Pickup' ? 'bg-emerald-600 text-white animate-pulse' :
                        ord.status === 'Preparing' ? 'bg-amber-100 text-amber-900' :
                        ord.status === 'Accepted' ? 'bg-blue-100 text-blue-900' :
                        ord.status === 'Collected' ? 'bg-slate-200 text-slate-700' :
                        ord.status === 'Cancelled' || ord.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-emerald-100 text-emerald-900'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-2">
                      <span>{ord.customerName}</span>
                      {ord.phone && (
                        <span className="text-slate-400 font-normal text-[11px] flex items-center gap-0.5">
                          <Phone className="w-2.5 h-2.5" /> {ord.phone}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-semibold space-y-0.5">
                    <span className="block font-bold text-emerald-950">₹{ord.totalAmount}</span>
                    <span className="block text-[10px] text-slate-400">{timeAgoMinutes}m ago</span>
                    {ord.isScheduled && (
                      <span className="inline-block bg-purple-100 text-purple-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Pick: {ord.pickupTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="p-3.5 flex-1 space-y-2.5">
                  <div className="space-y-1.5">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-emerald-950 text-white font-extrabold text-[11px] flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-slate-800">{item.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${item.isVeg ? 'text-emerald-700' : 'text-red-700'}`}>
                          {item.isVeg ? 'VEG' : 'NON-VEG'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {ord.specialInstructions && (
                    <div className="bg-amber-50/80 border border-amber-200 p-2 rounded-xl text-xs text-amber-900 font-medium">
                      <strong>Cooking Note:</strong> {ord.specialInstructions}
                    </div>
                  )}

                  {/* Estimated Wait Indicator & Config */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-700" />
                      <span>Est: ~{ord.estimatedWaitMinutes || 10}m</span>
                    </span>

                    <button
                      onClick={() => {
                        setAdjustingWaitOrderId(ord.id);
                        setCustomWaitMinutes(ord.estimatedWaitMinutes || 10);
                      }}
                      className="text-emerald-800 font-bold hover:underline text-[10px] flex items-center gap-1"
                    >
                      <Sliders className="w-2.5 h-2.5" /> Adjust Wait
                    </button>
                  </div>
                </div>

                {/* Workflow Status Action Buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                  
                  {/* Reject / Cancel */}
                  {(ord.status === 'Order Placed' || ord.status === 'Accepted') && (
                    <button
                      onClick={() => setRejectingOrderId(ord.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Reject order"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}

                  {ord.status === 'Order Placed' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'Accepted')}
                      className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept Order
                    </button>
                  )}

                  {ord.status === 'Accepted' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'Preparing')}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Start Cooking
                    </button>
                  )}

                  {ord.status === 'Preparing' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'Ready for Pickup')}
                      className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Mark Ready for Pickup
                    </button>
                  )}

                  {ord.status === 'Ready for Pickup' && (
                    <button
                      onClick={() => updateOrderStatus(ord.id, 'Collected')}
                      className="flex-1 bg-emerald-950 hover:bg-black text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <Utensils className="w-3.5 h-3.5 text-emerald-300" /> Confirm Collected
                    </button>
                  )}

                  {ord.status === 'Collected' && (
                    <span className="text-xs font-bold text-slate-500 py-1.5 px-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Order Collected
                    </span>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Adjust Prep Time Modal */}
      {adjustingWaitOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleAdjustWait} className="bg-white rounded-2xl p-5 max-w-xs w-full space-y-4 border border-slate-200 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" /> Update Wait Estimate
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Estimated Minutes</label>
              <input
                type="number"
                min="1"
                max="60"
                value={customWaitMinutes}
                onChange={(e) => setCustomWaitMinutes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-800"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustingWaitOrderId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-900 text-white hover:bg-emerald-800"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleConfirmReject} className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <h3 className="font-bold text-sm text-red-700 flex items-center gap-2">
              <Ban className="w-4 h-4" /> Reject Order
            </h3>
            <p className="text-xs text-slate-600">
              Provide a reason for rejecting this customer ticket:
            </p>
            <input
              type="text"
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Dosa batter out of stock"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:border-red-600"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
              >
                Confirm Reject
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
