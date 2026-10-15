import React from 'react';
import { BarChart3, ShoppingBag, Clock, Flame, Award, TrendingUp } from 'lucide-react';
import { useOrders } from '../context/OrderContext.jsx';

export default function AnalyticsView() {
  const { orders } = useOrders();

  const completedOrders = orders.filter(o => o.status === 'Collected');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled' || o.status === 'Rejected');
  const activeOrders = orders.filter(o => o.status === 'Order Placed' || o.status === 'Accepted' || o.status === 'Preparing');
  const totalRev = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Rejected').reduce((a, b) => a + (b.totalAmount || 0), 0);

  // Compute top items sold from actual data
  const itemCounts = {};
  orders.forEach(ord => {
    if (ord.status !== 'Cancelled' && ord.status !== 'Rejected') {
      ord.items?.forEach(it => {
        itemCounts[it.name] = (itemCounts[it.name] || 0) + it.quantity;
      });
    }
  });

  const sortedTopItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
              Queue & Sales Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time business intelligence calculated from actual database records.
          </p>
        </div>

        <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-1.5 text-xs font-bold text-emerald-900">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <span>Real-time Stored Data</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
          <div className="text-2xl font-black text-emerald-950">₹{totalRev}</div>
          <p className="text-[11px] text-slate-500">Calculated from valid orders</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
          <div className="text-2xl font-black text-slate-900">{orders.length}</div>
          <p className="text-[11px] text-slate-500">{completedOrders.length} collected, {cancelledOrders.length} cancelled</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active in Queue</span>
          <div className="text-2xl font-black text-slate-900">{activeOrders.length}</div>
          <p className="text-[11px] text-slate-500">Pending or in preparation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment Rate</span>
          <div className="text-2xl font-black text-slate-900">
            {orders.length > 0 ? `${Math.round((completedOrders.length / orders.length) * 100)}%` : '100%'}
          </div>
          <p className="text-[11px] text-slate-500">Completed vs total orders</p>
        </div>

      </div>

      {/* Top Dishes Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-800" />
            <span>Top In-Demand Dishes</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Ranked by Portions Sold</span>
        </div>

        {sortedTopItems.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No sales items recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedTopItems.map(([name, count], index) => {
              const maxCount = sortedTopItems[0][1] || 1;
              const percentage = Math.round((count / maxCount) * 100);
              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">#{index + 1} {name}</span>
                    <span className="text-emerald-950 font-bold">{count} portions sold</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="bg-emerald-900 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
