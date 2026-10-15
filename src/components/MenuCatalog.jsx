import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Clock, 
  Star, 
  AlertCircle, 
  Leaf, 
  Sparkles, 
  Check, 
  Flame,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useMenu } from '../context/MenuContext.jsx';
import { useOrders } from '../context/OrderContext.jsx';

export default function MenuCatalog({ onOpenCombos }) {
  const { menu, loading } = useMenu();
  const { cart, addToCart, updateCartQuantity, activeQueueCount } = useOrders();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const categories = ['All', 'Breakfast', 'Snacks', 'Meals', 'Beverages', 'Desserts'];

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cart.find((i) => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAdd = (item) => {
    const res = addToCart(item);
    if (!res.success) {
      showToast(res.message);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 border border-amber-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Welcome & Queue Status Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">
              College Canteen Live Counter
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
            Order Food Online & Skip the Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time preparation tracking, digital token receipts, and scheduled pickups.
          </p>
        </div>

        {/* Live Wait Time & Queue Stats */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700">
            <Clock className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold leading-tight">Est. Wait</span>
              <span className="font-bold text-slate-900 leading-tight">~{8 + activeQueueCount * 2} mins</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950 text-white px-3.5 py-2 rounded-xl text-xs">
            <Flame className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-emerald-300 block font-semibold leading-tight">Live Queue</span>
              <span className="font-extrabold text-white leading-tight">{activeQueueCount} Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Combos Teaser Card */}
      {onOpenCombos && (
        <div 
          onClick={onOpenCombos}
          className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-4 rounded-2xl cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/80 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Combo Saver Deals Available!</span>
                <span className="bg-emerald-700 text-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  Up to 15% Off
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Dosa + Chai, Samosa + Tea, and Meal Thali combos available today.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white shrink-0">
            <span>View Combos</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Dosa, Idli, Biryani, Coffee)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-800 focus:bg-white transition-all"
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

          {/* Veg Only Filter Switch */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <Leaf className={`w-3.5 h-3.5 ${vegOnly ? 'text-emerald-700' : 'text-slate-400'}`} />
            <span>Pure Veg Only</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Cards Grid */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-600">Loading live canteen menu...</p>
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No dishes found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Try adjusting your search keywords or category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenu.map((item) => {
            const quantityInCart = getItemQuantityInCart(item.id);
            const isAvailable = item.isAvailable !== false;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isAvailable ? 'border-slate-200' : 'border-slate-200 opacity-70 bg-slate-50/50'
                }`}
              >
                {/* Image & Badges */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                      !isAvailable ? 'grayscale' : ''
                    }`}
                    loading="lazy"
                  />

                  {/* Veg / Non-Veg Indicator */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-xs border border-slate-200/80">
                    <span 
                      className={`block w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}
                      title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                    />
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {item.category}
                  </div>

                  {/* Sold Out Banner */}
                  {!isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center">
                      <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Prep Time Estimate */}
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                    <Clock className="w-3 h-3 text-emerald-800" />
                    <span>~{item.prepTimeMinutes || 5} mins</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating || 4.7}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-normal leading-relaxed">
                      {item.description || 'Delicious freshly prepared canteen specialty.'}
                    </p>
                  </div>

                  {/* Price & Cart Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Price</span>
                      <span className="text-base font-black text-emerald-950">
                        ₹{item.price}
                      </span>
                    </div>

                    {isAvailable ? (
                      quantityInCart > 0 ? (
                        <div className="flex items-center bg-emerald-900 text-white rounded-xl p-1 gap-2 shadow-xs">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="p-1 hover:bg-emerald-800 rounded-lg transition-colors"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-extrabold px-1 min-w-[1.2rem] text-center">
                            {quantityInCart}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="p-1 hover:bg-emerald-800 rounded-lg transition-colors"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAdd(item)}
                          className="flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Add to Tray</span>
                        </button>
                      )
                    ) : (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                        Unavailable
                      </span>
                    )}
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
