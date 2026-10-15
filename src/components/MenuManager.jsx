import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  LayoutDashboard, 
  Power, 
  Clock, 
  Check, 
  Leaf, 
  AlertCircle 
} from 'lucide-react';
import { useMenu } from '../context/MenuContext.jsx';

export default function MenuManager() {
  const { menu, addMenuItem, updateMenuItem, toggleAvailability, deleteMenuItem } = useMenu();

  const [isAdding, setIsAdding] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Breakfast',
    price: '',
    prepTimeMinutes: '5',
    isVeg: true,
    description: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
  });

  const categories = ['Breakfast', 'Snacks', 'Meals', 'Beverages', 'Desserts'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    if (editingItemId) {
      updateMenuItem(editingItemId, {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        isVeg: Boolean(formData.isVeg),
        description: formData.description,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
      });
      setEditingItemId(null);
    } else {
      addMenuItem({
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        isVeg: Boolean(formData.isVeg),
        description: formData.description,
        image: formData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
      });
      setIsAdding(false);
    }

    setFormData({
      name: '',
      category: 'Breakfast',
      price: '',
      prepTimeMinutes: '5',
      isVeg: true,
      description: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
    });
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      prepTimeMinutes: item.prepTimeMinutes,
      isVeg: item.isVeg,
      description: item.description || '',
      image: item.image || ''
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
              Live Food Availability & Menu
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Toggle stock in real-time, adjust pricing, configure prep times, and add dishes.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingItemId(null);
          }}
          className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs active:scale-95 self-start sm:self-auto"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4 text-emerald-300" />}
          <span>{isAdding ? 'Cancel' : 'Add New Item'}</span>
        </button>
      </div>

      {/* Add / Edit Item Form */}
      {(isAdding || editingItemId) && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-slate-300 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-emerald-950">
              {editingItemId ? 'Edit Menu Item' : 'Create New Menu Item'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingItemId(null);
              }}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Masala Dosa"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="e.g. 60"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prep Time (Minutes) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 5"
                value={formData.prepTimeMinutes}
                onChange={(e) => setFormData({ ...formData, prepTimeMinutes: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Preference</label>
              <select
                value={formData.isVeg ? 'veg' : 'non-veg'}
                onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              >
                <option value="veg">Vegetarian (Pure Veg)</option>
                <option value="non-veg">Non-Vegetarian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Short description of ingredients and taste..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-800 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingItemId(null);
              }}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {editingItemId ? 'Update Dish' : 'Save Dish to Menu'}
            </button>
          </div>
        </form>
      )}

      {/* Menu Management Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            All Menu Items ({menu.length})
          </span>
          <span className="text-xs text-slate-500">
            {menu.filter(i => i.isAvailable !== false).length} Available • {menu.filter(i => i.isAvailable === false).length} Sold Out
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {menu.map((item) => {
            const isAvailable = item.isAvailable !== false;
            return (
              <div 
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-semibold">
                      <span className="text-emerald-950 font-black">₹{item.price}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-700" /> ~{item.prepTimeMinutes || 5}m prep
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle & Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Stock Availability Toggle Button */}
                  <button
                    onClick={() => toggleAvailability(item.id, !isAvailable)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isAvailable
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                        : 'bg-red-50 border-red-300 text-red-900 hover:bg-red-100'
                    }`}
                    title="Toggle Live Stock Status"
                  >
                    <Power className={`w-3.5 h-3.5 ${isAvailable ? 'text-emerald-700' : 'text-red-600'}`} />
                    <span>{isAvailable ? 'Available' : 'Sold Out'}</span>
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteMenuItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
