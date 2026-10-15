import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { MenuProvider } from './context/MenuContext.jsx';
import { OrderProvider, useOrders } from './context/OrderContext.jsx';

import DemoBanner from './components/DemoBanner.jsx';
import Navbar from './components/Navbar.jsx';
import MenuCatalog from './components/MenuCatalog.jsx';
import CombosView from './components/CombosView.jsx';
import MyOrdersView from './components/MyOrdersView.jsx';
import LiveQueueView from './components/LiveQueueView.jsx';
import KitchenDashboard from './components/KitchenDashboard.jsx';
import MenuManager from './components/MenuManager.jsx';
import ComboManager from './components/ComboManager.jsx';
import StaffFeedbackView from './components/StaffFeedbackView.jsx';
import AnalyticsView from './components/AnalyticsView.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import OrderReceiptModal from './components/OrderReceiptModal.jsx';
import NotificationsModal from './components/NotificationsModal.jsx';
import LoginModal from './components/LoginModal.jsx';

function MainApp() {
  const { isStaff, currentUser } = useAuth();
  const { cart } = useOrders();

  const [activeTab, setActiveTab] = useState(isStaff ? 'kitchen' : 'menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [activeTrackOrder, setActiveTrackOrder] = useState(null);

  // If role switches from banner, sync tab smoothly
  React.useEffect(() => {
    if (isStaff && (activeTab === 'menu' || activeTab === 'combos' || activeTab === 'orders')) {
      setActiveTab('kitchen');
    } else if (!isStaff && (activeTab === 'kitchen' || activeTab === 'manage' || activeTab === 'combos-manage' || activeTab === 'feedback')) {
      setActiveTab('menu');
    }
  }, [isStaff]);

  const cartCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartTotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-800 selection:text-white">
      
      {/* Top Demo Banner */}
      <DemoBanner />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsCartOpen={setIsCartOpen}
        setIsNotifsOpen={setIsNotifsOpen}
        cartCount={cartCount}
        cartTotal={cartTotal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* STUDENT VIEWS */}
        {activeTab === 'menu' && (
          <MenuCatalog onOpenCombos={() => setActiveTab('combos')} />
        )}

        {activeTab === 'combos' && (
          <CombosView onBackToMenu={() => setActiveTab('menu')} />
        )}

        {activeTab === 'orders' && (
          <MyOrdersView onOrderAgainSuccess={() => setIsCartOpen(true)} />
        )}

        {activeTab === 'queue' && (
          <LiveQueueView activeOrder={activeTrackOrder} />
        )}

        {/* STAFF VIEWS */}
        {activeTab === 'kitchen' && (
          <KitchenDashboard />
        )}

        {activeTab === 'manage' && (
          <MenuManager />
        )}

        {activeTab === 'combos-manage' && (
          <ComboManager />
        )}

        {activeTab === 'feedback' && (
          <StaffFeedbackView />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={(order) => {
          setLastPlacedOrder(order);
        }}
      />

      {/* Digital Order Receipt & Pickup Token Modal */}
      {lastPlacedOrder && (
        <OrderReceiptModal
          order={lastPlacedOrder}
          onClose={() => setLastPlacedOrder(null)}
          onViewLiveQueue={(order) => {
            setActiveTrackOrder(order);
            setActiveTab('orders');
          }}
        />
      )}

      {/* In-App Notifications Drawer */}
      <NotificationsModal
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        onTrackOrder={(orderId) => {
          setActiveTab('orders');
        }}
      />

      {/* Login & Role Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-xs text-slate-500 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-950">CanteenQ</span>
            <span>• Smart College Canteen Queue & Pre-Ordering System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Firebase Auth + Cloud Firestore</span>
            <span>Tailwind CSS</span>
            <span>Digital Tokens</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <OrderProvider>
          <MainApp />
        </OrderProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
