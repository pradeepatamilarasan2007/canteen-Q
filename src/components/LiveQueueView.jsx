import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle2, RefreshCw, ChefHat, BellRing, Play, ArrowRight, X } from 'lucide-react';
import { useOrders } from '../context/OrderContext.jsx';

export default function LiveQueueView({ activeOrder }) {
  const { orders } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(activeOrder || null);

  useEffect(() => {
    if (activeOrder) {
      setTrackedOrder(activeOrder);
    }
  }, [activeOrder]);

  // Keep trackedOrder dynamically updated when kitchen changes status
  useEffect(() => {
    if (trackedOrder) {
      const live = orders.find(o => o.id === trackedOrder.id || (o.tokenNumber && o.tokenNumber === trackedOrder.tokenNumber));
      if (live && JSON.stringify(live) !== JSON.stringify(trackedOrder)) {
        setTrackedOrder(live);
      }
    }
  }, [orders]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase().trim();
    const found = orders.find(o => 
      o.tokenNumber?.toLowerCase().includes(query) ||
      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
      (o.phone && o.phone.includes(query))
    );
    setTrackedOrder(found || null);
  };

  const readyOrders = orders.filter(o => o.status === 'Ready for Collection' || o.status === 'Ready for Pickup');
  const preparingOrders = orders.filter(o => o.status === 'Preparing');
  const pendingOrders = orders.filter(o => o.status === 'Order Placed' || o.status === 'Accepted');

  const orderStatuses = ['Order Placed', 'Accepted', 'Preparing', 'Ready for Collection', 'Collected'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
              COLLEGE CANTEEN LIVE COUNTER
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
            Digital Token Queue Display
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time board showing tickets currently ready for pickup and in preparation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
          <Clock className="w-4 h-4 text-emerald-800" />
          <span>Auto-updating via Firestore Listeners</span>
        </div>
      </div>

      {/* Token Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Token (e.g. CQ022) or Customer Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-800 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            Track Token
          </button>
        </form>

        {/* Tracked Order Progress Detail Card */}
        {trackedOrder && (
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-300 space-y-3 animate-fadeIn relative">
            <button
              onClick={() => setTrackedOrder(null)}
              className="absolute top-3 right-3 text-emerald-800 hover:text-emerald-950"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/60 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Active Token</span>
                <h2 className="text-3xl font-black text-emerald-950">{trackedOrder.tokenNumber}</h2>
                <p className="text-xs text-slate-700 font-semibold">{trackedOrder.customerName} • {trackedOrder.items.length} items</p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${
                  (trackedOrder.status === 'Ready for Collection' || trackedOrder.status === 'Ready for Pickup') ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse' :
                  trackedOrder.status === 'Preparing' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  'bg-white text-slate-700 border-slate-300'
                }`}>
                  {trackedOrder.status === 'Ready for Pickup' ? 'Ready for Collection' : trackedOrder.status}
                </span>
                <span className="block text-[11px] text-slate-500 mt-1">
                  Est. Wait: ~{trackedOrder.estimatedWaitMinutes || 8}m
                </span>
              </div>
            </div>

            {/* Stepper */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs">
                {orderStatuses.map((st, idx) => {
                  let currentIdx = orderStatuses.indexOf(trackedOrder.status);
                  if (currentIdx === -1 && trackedOrder.status === 'Ready for Pickup') currentIdx = 3;
                  const isPassed = idx <= currentIdx;
                  return (
                    <div key={st} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isPassed ? 'bg-emerald-900 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 mt-1 text-center hidden sm:inline">
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Big Screen Live Token Board (Ready vs In Prep) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Ready for Collection column */}
        <div className="bg-white rounded-2xl border-2 border-emerald-500/80 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-emerald-600 animate-bounce" />
              <h2 className="text-base font-black text-emerald-950 uppercase tracking-wide">
                Now Ready For Collection
              </h2>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-full">
              {readyOrders.length} Ready
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No orders waiting for collection at counter.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setTrackedOrder(ord)}
                  className="bg-emerald-900 text-white p-3 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform shadow-xs"
                >
                  <span className="text-2xl font-black block">{ord.tokenNumber}</span>
                  <span className="text-[10px] text-emerald-200 font-semibold truncate block mt-0.5">
                    {ord.customerName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* In Preparation column */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                Cooking In Kitchen
              </h2>
            </div>
            <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-2.5 py-1 rounded-full">
              {preparingOrders.length} Cooking
            </span>
          </div>

          {preparingOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Kitchen is all caught up.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {preparingOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setTrackedOrder(ord)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 p-3 rounded-xl text-center cursor-pointer hover:border-emerald-700 transition-all shadow-2xs"
                >
                  <span className="text-2xl font-black text-emerald-950 block">{ord.tokenNumber}</span>
                  <span className="text-[10px] text-slate-500 font-semibold truncate block mt-0.5">
                    ~{ord.estimatedWaitMinutes || 8}m left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
