import React, { useState } from 'react';
import { Sparkles, Plus, Check, Clock, Utensils, AlertCircle } from 'lucide-react';
import { useMenu } from '../context/MenuContext.jsx';
import { useOrders } from '../context/OrderContext.jsx';

export default function CombosView({ onBackToMenu }) {
  const { combos, menu } = useMenu();
  const { addToCart } = useOrders();
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCombo = (combo) => {
    // Check if any item in the combo is unavailable
    const unavailableInCombo = combo.items.some(ci => {
      const match = menu.find(m => m.id === ci.id);
      return match && !match.isAvailable;
    });

    if (unavailableInCombo) {
      showToast(`One or more items in "${combo.name}" are currently sold out.`);
      return;
    }

    // Add as combo item or its components
    const comboItem = {
      id: combo.id,
      name: combo.name,
      price: combo.price,
      quantity: 1,
      isVeg: true,
      prepTimeMinutes: 8,
      isAvailable: combo.isAvailable,
      isCombo: true,
      description: combo.description
    };

    const res = addToCart(comboItem);
    if (res.success) {
      showToast(`Added "${combo.name}" to your tray!`);
    } else {
      showToast(res.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-emerald-700 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
              Special Savings
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
            Canteen Combo Offers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hand-picked breakfast, snack, and meal pairings at discounted bundle prices.
          </p>
        </div>

        <button
          onClick={onBackToMenu}
          className="self-start sm:self-auto text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors"
        >
          ← Back to Full Menu
        </button>
      </div>

      {/* Combos Grid */}
      {combos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No combo deals active right now</h3>
          <p className="text-xs text-slate-400 mt-1">Check back soon for curated daily meal deals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {combos.map((combo) => {
            const savings = combo.originalPrice ? combo.originalPrice - combo.price : 0;
            return (
              <div
                key={combo.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={combo.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"}
                    alt={combo.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    <span>Save ₹{savings}</span>
                  </div>
                  {combo.discountPercent && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      {combo.discountPercent}% OFF
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 mb-1">
                      {combo.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                      {combo.description}
                    </p>

                    {/* Included Items */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Included in this combo:
                      </span>
                      <div className="space-y-1">
                        {combo.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>{it.quantity}x {it.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-emerald-950">
                          ₹{combo.price}
                        </span>
                        {combo.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{combo.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold">Bundle Deal</span>
                    </div>

                    <button
                      onClick={() => handleAddCombo(combo)}
                      className="flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Add Combo</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
