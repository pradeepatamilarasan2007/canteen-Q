import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  db, 
  isFirebaseConfigured, 
  demoStore 
} from '../services/firebase.js';
import { useAuth } from './AuthContext.jsx';
import { useMenu } from './MenuContext.jsx';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { currentUser, isStaff } = useAuth();
  const { menu } = useMenu();

  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cart, setCart] = useState([]);
  const [settings, setSettings] = useState(demoStore.getSettings());
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Track processed ready notifications to avoid duplicates on re-render / reconnection
  const processedReadyOrdersRef = useRef(new Set());

  // Subscribe to Orders & Notifications
  useEffect(() => {
    if (isFirebaseConfigured && db) {
      // If student, can listen to own orders, if staff can listen to all
      let ordersQuery = collection(db, 'orders');
      if (!isStaff && currentUser) {
        ordersQuery = query(collection(db, 'orders'), where('studentId', '==', currentUser.uid));
      }

      const ordersUnsub = onSnapshot(ordersQuery, (snap) => {
        const ordList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        ordList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordList);
        setLoadingOrders(false);
      }, (err) => {
        console.error('Firestore orders error:', err);
        setOrders(demoStore.getOrders());
        setLoadingOrders(false);
      });

      // Notifications query
      let notifQuery = collection(db, 'notifications');
      if (currentUser) {
        notifQuery = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
      }

      const notifUnsub = onSnapshot(notifQuery, (snap) => {
        const notifList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        notifList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(notifList);
      }, (err) => {
        console.error('Firestore notifications error:', err);
        setNotifications(demoStore.getNotifications());
      });

      return () => {
        ordersUnsub();
        notifUnsub();
      };
    } else {
      // Demo Store subscription
      const initialOrders = demoStore.getOrders();
      setOrders(initialOrders);
      setNotifications(demoStore.getNotifications());
      setLoadingOrders(false);

      // Attempt to load and sync with Express backend API
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
            demoStore.setOrders(data.orders);
          }
        })
        .catch(() => {
          // Fallback to local storage if server is not yet running
        });

      const unsubOrders = demoStore.subscribe('orders', (allOrders) => {
        setOrders(allOrders);
      });

      const unsubNotifs = demoStore.subscribe('notifications', (allNotifs) => {
        setNotifications(allNotifs);
      });

      const unsubSettings = demoStore.subscribe('settings', (newSettings) => {
        setSettings(newSettings);
      });

      return () => {
        unsubOrders();
        unsubNotifs();
        unsubSettings();
      };
    }
  }, [currentUser?.uid, isStaff]);

  // Real-time notification trigger when an order status changes to "Ready for Collection"
  useEffect(() => {
    if (!currentUser || isStaff) return;

    // Check user's orders that are "Ready for Collection" or "Ready for Pickup"
    const userReadyOrders = orders.filter(
      o => o.studentId === currentUser.uid && (o.status === 'Ready for Collection' || o.status === 'Ready for Pickup')
    );

    userReadyOrders.forEach((ord) => {
      const notifKey = `ready_${ord.id}`;
      if (!processedReadyOrdersRef.current.has(notifKey)) {
        processedReadyOrdersRef.current.add(notifKey);

        // Check if a notification already exists in state
        const existing = notifications.find(n => n.orderId === ord.id && n.title.includes('Ready'));
        if (!existing) {
          triggerInAppNotification({
            userId: currentUser.uid,
            orderId: ord.id,
            tokenNumber: ord.tokenNumber,
            title: "Ready for Collection! 🔔",
            message: `Hello! Your CanteenQ order #${ord.tokenNumber || ord.id} is ready for collection. Please collect your food from the canteen. Thank you!`
          });
        }
      }
    });
  }, [orders, currentUser?.uid]);

  // Helper to trigger in-app notification
  const triggerInAppNotification = async ({ userId, orderId, tokenNumber, title, message }) => {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId,
      orderId,
      tokenNumber,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'notifications', newNotif.id), newNotif);
    } else {
      const current = demoStore.getNotifications();
      const updated = [newNotif, ...current];
      demoStore.setNotifications(updated);
      setNotifications(updated);
    }
  };

  const markNotificationAsRead = async (notifId) => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } else {
      const current = demoStore.getNotifications();
      const updated = current.map(n => n.id === notifId ? { ...n, read: true } : n);
      demoStore.setNotifications(updated);
      setNotifications(updated);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (isFirebaseConfigured && db) {
      notifications.filter(n => !n.read).forEach(async (n) => {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      });
    } else {
      const current = demoStore.getNotifications();
      const updated = current.map(n => ({ ...n, read: true }));
      demoStore.setNotifications(updated);
      setNotifications(updated);
    }
  };

  // Cart operations
  const addToCart = (item) => {
    // Validation: prevent ordering sold-out items
    if (item.isAvailable === false) {
      return { success: false, message: `"${item.name}" is currently Sold Out.` };
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    return { success: true };
  };

  const updateCartQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Generate unique pickup token like "CQ025", "CQ026"
  const generatePickupToken = () => {
    const existingTokens = new Set(
      orders
        .filter(o => o.status !== 'Collected' && o.status !== 'Cancelled' && o.status !== 'Rejected')
        .map(o => o.tokenNumber)
    );

    // Find highest token index
    let maxNum = 20;
    orders.forEach(o => {
      const match = o.tokenNumber?.match(/CQ(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    let nextNum = maxNum + 1;
    let candidate = `CQ${String(nextNum).padStart(3, '0')}`;
    while (existingTokens.has(candidate)) {
      nextNum++;
      candidate = `CQ${String(nextNum).padStart(3, '0')}`;
    }
    return candidate;
  };

  // Calculate estimated wait time based on item prep times + current queue
  const calculateEstimatedWaitTime = (orderItems) => {
    const activeOrders = orders.filter(o => o.status === 'Order Placed' || o.status === 'Accepted' || o.status === 'Preparing');
    const maxItemPrep = Math.max(...orderItems.map(i => i.prepTimeMinutes || 5), 5);
    const queueFactor = settings.defaultPrepBufferMinutes || 3;
    const estimatedMinutes = maxItemPrep + (activeOrders.length * queueFactor);
    return Math.max(5, estimatedMinutes);
  };

  // Place Order (Immediate or Scheduled)
  const placeOrder = async ({
    customerName,
    phone,
    paymentMethod = 'UPI',
    specialInstructions = '',
    isScheduled = false,
    pickupDate = null,
    pickupTime = null
  }) => {
    if (cart.length === 0) {
      throw new Error('Your cart is empty.');
    }

    // Server/Service-side validation of item availability & prices
    for (const cartItem of cart) {
      const freshItem = menu.find(m => m.id === cartItem.id);
      if (freshItem) {
        if (!freshItem.isAvailable) {
          throw new Error(`Item "${freshItem.name}" just became Sold Out. Please remove it from your tray.`);
        }
        if (freshItem.price !== cartItem.price) {
          // Adjust to current menu price
          cartItem.price = freshItem.price;
        }
      }
    }

    // Validate scheduled pickup time if scheduled
    if (isScheduled) {
      if (!pickupDate || !pickupTime) {
        throw new Error('Please select both a pickup date and time.');
      }

      // Check operating hours
      const [pickupHour, pickupMin] = pickupTime.split(':').map(Number);
      const [openHour, openMin] = (settings.operatingHours.open || '08:00').split(':').map(Number);
      const [closeHour, closeMin] = (settings.operatingHours.close || '19:30').split(':').map(Number);

      const pickupMinutes = pickupHour * 60 + pickupMin;
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      if (pickupMinutes < openMinutes || pickupMinutes > closeMinutes) {
        throw new Error(`Scheduled pickup must be within canteen hours (${settings.operatingHours.open} - ${settings.operatingHours.close}).`);
      }

      // Prevent past time if today
      const now = new Date();
      const scheduledDateTime = new Date(`${pickupDate}T${pickupTime}`);
      if (scheduledDateTime.getTime() <= now.getTime()) {
        throw new Error('Scheduled pickup time cannot be in the past.');
      }
    }

    const tokenNumber = generatePickupToken();
    const estimatedWaitMinutes = calculateEstimatedWaitTime(cart);
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = {
      id: `ord_${Date.now()}`,
      tokenNumber,
      studentId: currentUser?.uid || 'guest_student',
      customerName: customerName || currentUser?.name || 'Student',
      phone: phone || currentUser?.phone || '',
      items: cart.map(i => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        prepTimeMinutes: i.prepTimeMinutes || 5,
        isVeg: Boolean(i.isVeg)
      })),
      totalAmount,
      paymentMethod,
      specialInstructions,
      isScheduled,
      pickupDate,
      pickupTime,
      status: "Order Placed", // Initial status
      estimatedWaitMinutes,
      createdAt: new Date().toISOString(),
      smsNotificationSent: false
    };

    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } else {
      const current = demoStore.getOrders();
      const updated = [newOrder, ...current];
      demoStore.setOrders(updated);
      setOrders(updated);
    }

    // Sync order with Express server backend so server-side SMS and persistence stay aligned
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (err) {
      console.log('[OrderContext] Backend order sync notice:', err.message);
    }

    clearCart();
    return newOrder;
  };

  // Update order status (Staff workflow)
  const updateOrderStatus = async (orderId, newStatus, reason = '') => {
    const validStatuses = [
      'Order Placed', 
      'Accepted', 
      'Preparing', 
      'Ready for Collection', 
      'Ready for Pickup', 
      'Collected', 
      'Cancelled', 
      'Rejected'
    ];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) throw new Error('Order not found');

    const patch = {
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    const isReady = (newStatus === 'Ready for Collection' || newStatus === 'Ready for Pickup');
    if (isReady) {
      patch.readyAt = new Date().toISOString();
    } else if (newStatus === 'Collected') {
      patch.completedAt = new Date().toISOString();
    } else if (newStatus === 'Rejected') {
      patch.rejectionReason = reason || 'Item out of stock or kitchen closed';
    }

    // Requirement 12: Dispatch status update to backend API and receive SMS notification result
    let backendSMSResult = null;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus, 
          reason,
          phone: orderToUpdate.phone,
          customerName: orderToUpdate.customerName,
          tokenNumber: orderToUpdate.tokenNumber,
          order: orderToUpdate
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          patch.smsNotificationSent = data.order.smsNotificationSent;
          patch.smsSentAt = data.order.smsSentAt;
          patch.smsMessageId = data.order.smsMessageId;
          patch.smsStatus = data.order.smsStatus;
          patch.smsError = data.order.smsError;
          patch.smsRecipient = data.order.smsRecipient;
        }
        backendSMSResult = data.sms;
      }
    } catch (err) {
      console.warn('[OrderContext] Backend PATCH status error:', err.message);
    }

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'orders', orderId), patch);
    } else {
      const current = demoStore.getOrders();
      const updated = current.map(o => o.id === orderId ? { ...o, ...patch } : o);
      demoStore.setOrders(updated);
      setOrders(updated);
    }

    // If status became Ready for Collection, send in-app notification to student
    if (isReady) {
      triggerInAppNotification({
        userId: orderToUpdate.studentId,
        orderId: orderToUpdate.id,
        tokenNumber: orderToUpdate.tokenNumber,
        title: "Ready for Collection! 🔔",
        message: `Hello! Your CanteenQ order #${orderToUpdate.tokenNumber || orderToUpdate.id} is ready for collection. Please collect your food from the canteen. Thank you!`
      });
    }

    return { success: true, sms: backendSMSResult };
  };

  // Student Cancel Order
  const cancelOrder = async (orderId) => {
    const orderToCancel = orders.find(o => o.id === orderId);
    if (!orderToCancel) throw new Error('Order not found');

    // Cancellation policy: Only allowed if status is 'Order Placed' or 'Accepted'
    if (orderToCancel.status !== 'Order Placed' && orderToCancel.status !== 'Accepted') {
      throw new Error(`Cancellation not allowed. Your order is already ${orderToCancel.status.toLowerCase()}.`);
    }

    const patch = {
      status: 'Cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: 'Student'
    };

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'orders', orderId), patch);
    } else {
      const current = demoStore.getOrders();
      const updated = current.map(o => o.id === orderId ? { ...o, ...patch } : o);
      demoStore.setOrders(updated);
      setOrders(updated);
    }

    // Trigger notification
    triggerInAppNotification({
      userId: orderToCancel.studentId,
      orderId: orderToCancel.id,
      tokenNumber: orderToCancel.tokenNumber,
      title: "Order Cancelled",
      message: `Your order #${orderToCancel.tokenNumber} was successfully cancelled.`
    });
  };

  // Rate and feedback
  const rateOrder = async (orderId, rating, feedback = '') => {
    const ord = orders.find(o => o.id === orderId);
    if (!ord) throw new Error('Order not found');
    if (ord.status !== 'Collected') {
      throw new Error('Only collected orders can be rated.');
    }

    const patch = {
      rating: Number(rating),
      feedback: feedback.trim(),
      ratedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'orders', orderId), patch);
    } else {
      const current = demoStore.getOrders();
      const updated = current.map(o => o.id === orderId ? { ...o, ...patch } : o);
      demoStore.setOrders(updated);
      setOrders(updated);
    }
  };

  // Reorder: add previously ordered items to cart
  const reorderItems = (order) => {
    let addedCount = 0;
    const unavailableItems = [];

    order.items.forEach(orderItem => {
      const currentItem = menu.find(m => m.id === orderItem.id);
      if (currentItem && currentItem.isAvailable) {
        addToCart(currentItem);
        addedCount++;
      } else {
        unavailableItems.push(orderItem.name);
      }
    });

    return {
      addedCount,
      unavailableItems
    };
  };

  // Update custom prep time estimate (Staff feature)
  const updateOrderEstimatedWait = async (orderId, minutes) => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'orders', orderId), { estimatedWaitMinutes: Number(minutes) });
    } else {
      const current = demoStore.getOrders();
      const updated = current.map(o => o.id === orderId ? { ...o, estimatedWaitMinutes: Number(minutes) } : o);
      demoStore.setOrders(updated);
      setOrders(updated);
    }
  };

  // Active queue count
  const activeQueueCount = orders.filter(
    o => o.status === 'Order Placed' || o.status === 'Accepted' || o.status === 'Preparing'
  ).length;

  const unreadNotifCount = notifications.filter(n => !n.read && (!currentUser || n.userId === currentUser.uid)).length;

  return (
    <OrderContext.Provider value={{
      orders,
      notifications,
      cart,
      settings,
      loadingOrders,
      activeQueueCount,
      unreadNotifCount,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      placeOrder,
      updateOrderStatus,
      cancelOrder,
      rateOrder,
      reorderItems,
      updateOrderEstimatedWait,
      markNotificationAsRead,
      markAllNotificationsAsRead
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
