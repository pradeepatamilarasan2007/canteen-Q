import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  X, 
  Power, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useMenu } from '../context/MenuContext.jsx';

export default function ComboManager() {
  const { combos, menu, addCombo, toggleComboAvailability, deleteCombo } = useMenu();

  const [isAdding, setIsAdding] = useState(false);
  const [comboName, setComboName] = useState('');
  const [comboDescription, setComboDescription] = useState('');
  const [comboPrice, setComboPrice] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [comboImage, setComboImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80');

  const handleSelectItem = (itemId) => {
    const item = menu.find(m => m.id === itemId);
    if (!item) return;

    if (selectedItems.find(i => i.id === itemId)) {
      setSelectedItems(selectedItems.filter(i => i.id !== itemId));
    } else {
      setSelectedItems([...selectedItems, { id: item.id, name: item.name, quantity: 1, price: item.price }]);
    }
  };

  const calculatedRegularTotal = selectedItems.reduce((acc, curr) => {
    const fresh = menu.find(m => m.id === curr.id);
    return acc + (fresh ? fresh.price * curr.quantity : curr.price * curr.quantity);
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comboName || !comboPrice || selectedItems.length === 0) return;

    const discountPercent = calculatedRegularTotal > Number(comboPrice)
      ? Math.round(((calculatedRegularTotal - Number(comboPrice)) / calculatedRegularTotal) * 100)
      : 0;

    addCombo({
      name: comboName,
      description: comboDescription,
      price: Number(comboPrice),
      originalPrice: calculatedRegularTotal,
      discountPercent,
      items: selectedItems,
      image: comboImage,
      isAvailable: true
    });

    setComboName('');
    setComboDescription('');
    setComboPrice('');
    setSelectedItems([]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
              Combo Offers Management
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Combine popular menu items into value meal combos with discounted pricing.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs active:scale-95 self-start sm:self-auto"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-emerald-300" />}
          <span>{isAdding ? 'Cancel' : 'Create New Combo'}</span>
        </button>
      </div>

      {/* Add Combo Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-slate-300 shadow-md space-y-4 animate-fadeIn">
          <h3 className="text-sm font-bold text-emerald-950 border-b border-slate-100 pb-2">
            Configure New Food Combo
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Combo Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chai + Samosa Delight"
                value={comboName}
                onChange={(e) => setComboName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Combo Deal Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 45"
                value={comboPrice}
                onChange={(e) => setComboPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. Hot savory snack served with masala kulhad tea."
              value={comboDescription}
              onChange={(e) => setComboDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
            />
          </div>

          {/* Select items from menu */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Select Dishes to Include *</span>
              <span className="text-emerald-900">
                Regular Total: ₹{calculatedRegularTotal}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {menu.map(item => {
                const isSelected = selectedItems.some(i => i.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                      isSelected
                        ? 'bg-emerald-900 border-emerald-900 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    <span className={isSelected ? 'text-emerald-200 font-bold' : 'text-slate-500 font-bold'}>
                      ₹{item.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedItems.length === 0}
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs disabled:opacity-50"
            >
              Save Combo Offer
            </button>
          </div>
        </form>
      )}

      {/* Existing Combos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combos.map((combo) => (
          <div
            key={combo.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{combo.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{combo.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-950 block">₹{combo.price}</span>
                  {combo.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">₹{combo.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Items included */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items:</span>
                {combo.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700 font-semibold">
                    <span>{it.quantity}x {it.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => toggleComboAvailability(combo.id, !combo.isAvailable)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  combo.isAvailable !== false
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{combo.isAvailable !== false ? 'Active' : 'Paused'}</span>
              </button>

              <button
                onClick={() => deleteCombo(combo.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                title="Delete Combo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
