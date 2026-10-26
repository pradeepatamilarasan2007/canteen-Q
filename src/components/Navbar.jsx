import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  LayoutDashboard, 
  BarChart3, 
  Bell, 
  Sparkles, 
  ReceiptText, 
  Star, 
  LogOut, 
  User, 
  CheckCircle,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useOrders } from '../context/OrderContext.jsx';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  setIsCartOpen, 
  setIsNotifsOpen,
  cartCount, 
  cartTotal 
}) {
  const { currentUser, isStaff, logout, switchDemoRole } = useAuth();
  const { orders, unreadNotifCount, activeQueueCount } = useOrders();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active student orders count
  const myActiveOrdersCount = orders.filter(
    o => o.studentId === currentUser?.uid && 
         (o.status === 'Order Placed' || o.status === 'Accepted' || o.status === 'Preparing' || o.status === 'Ready for Collection' || o.status === 'Ready for Pickup')
  ).length;

  const studentNavItems = [
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'combos', label: 'Combos', icon: Sparkles },
    { id: 'orders', label: 'My Orders', icon: ReceiptText, badge: myActiveOrdersCount > 0 ? myActiveOrdersCount : null },
    { id: 'queue', label: 'Live Queue', icon: Clock, badge: activeQueueCount > 0 ? activeQueueCount : null },
  ];

  const staffNavItems = [
    { id: 'kitchen', label: 'Kitchen KDS', icon: ChefHat, badge: activeQueueCount > 0 ? activeQueueCount : null },
    { id: 'manage', label: 'Menu Manager', icon: LayoutDashboard },
    { id: 'combos-manage', label: 'Combo Deals', icon: Sparkles },
    { id: 'feedback', label: 'Ratings', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const navItems = isStaff ? staffNavItems : studentNavItems;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo with Dark Green Accent */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer" 
            onClick={() => setActiveTab(isStaff ? 'kitchen' : 'menu')}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-900 flex items-center justify-center text-white shadow-xs">
              <UtensilsCrossed className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-emerald-950 tracking-tight">CanteenQ</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isStaff ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isStaff ? 'Staff Portal' : 'Student'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block -mt-0.5">Smart Queue & Pre-Ordering</span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-950 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-emerald-900' : 'bg-emerald-800 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Tray */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Notification Bell (In-App notifications) */}
            <button
              onClick={() => setIsNotifsOpen(true)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-emerald-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Tray Cart Button (For Students) */}
            {!isStaff && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                <span className="hidden sm:inline">Tray</span>
                <span className="bg-emerald-950 text-emerald-200 px-1.5 py-0.5 rounded-full text-[11px] font-bold">
                  {cartCount}
                </span>
                <span className="font-bold border-l border-emerald-700/80 pl-2">₹{cartTotal}</span>
              </button>
            )}

            {/* Profile Dropdown / Info */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.name?.split(' ')[0] || 'User'}
                </span>
                <span className="block text-[10px] text-slate-500 leading-tight">
                  {currentUser?.phone ? `+91 ${currentUser.phone}` : currentUser?.email || 'Logged In'}
                </span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-emerald-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-white text-emerald-900' : 'bg-emerald-800 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
}
