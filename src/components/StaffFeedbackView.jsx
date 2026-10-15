import React from 'react';
import { Star, MessageSquare, ThumbsUp, Award, Clock } from 'lucide-react';
import { useOrders } from '../context/OrderContext.jsx';

export default function StaffFeedbackView() {
  const { orders } = useOrders();

  // Extract all orders that have a rating
  const ratedOrders = orders.filter(o => o.rating && o.rating > 0);

  const totalReviews = ratedOrders.length;
  const avgRating = totalReviews > 0 
    ? (ratedOrders.reduce((sum, o) => sum + o.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  // Star breakdown
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratedOrders.forEach(o => {
    if (starCounts[o.rating] !== undefined) {
      starCounts[o.rating]++;
    }
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
              Customer Ratings & Feedback
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Reviews submitted by college students after collecting their food orders.
          </p>
        </div>

        <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 flex items-center gap-3">
          <div className="text-3xl font-black text-emerald-950">{avgRating}</div>
          <div>
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">{totalReviews} Ratings</span>
          </div>
        </div>
      </div>

      {/* Ratings Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Star distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 md:col-span-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Rating Breakdown
          </h3>
          {[5, 4, 3, 2, 1].map(stars => {
            const count = starCounts[stars] || 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-700 w-8">{stars} ★</span>
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-slate-400 font-semibold w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Recent Feedback Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 md:col-span-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>Recent Student Reviews</span>
          </h3>

          {ratedOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No reviews submitted yet today.
            </div>
          ) : (
            <div className="space-y-3">
              {ratedOrders.map((ord) => (
                <div 
                  key={ord.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-950 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {ord.tokenNumber}
                      </span>
                      <span className="font-bold text-slate-800">{ord.customerName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      {[...Array(ord.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {ord.feedback ? (
                    <p className="text-slate-700 italic">
                      "{ord.feedback}"
                    </p>
                  ) : (
                    <p className="text-slate-400 italic text-[11px]">
                      No written comment left.
                    </p>
                  )}

                  <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-2">
                    <span>Items: {ord.items.map(i => i.name).join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
