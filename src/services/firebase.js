import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

// Check if valid Firebase configuration is provided
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.apiKey !== ''
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[CanteenQ] Connected to Cloud Firestore & Firebase Auth');
  } catch (err) {
    console.warn('[CanteenQ] Firebase initialization error, falling back to Demo Mode:', err);
  }
}

// ==========================================
// DEMO / OFFLINE REALTIME STORE
// ==========================================

const INITIAL_DEMO_MENU = [
  {
    id: "m1",
    name: "Masala Dosa",
    category: "Breakfast",
    price: 60,
    isVeg: true,
    prepTimeMinutes: 8,
    isAvailable: true,
    description: "Crispy fermented rice crepe loaded with spiced potato masala, served with coconut chutney & sambar.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80",
    rating: 4.8
  },
  {
    id: "m2",
    name: "Idli Sambar (2 pcs)",
    category: "Breakfast",
    price: 40,
    isVeg: true,
    prepTimeMinutes: 4,
    isAvailable: true,
    description: "Steamed fluffy rice-lentil cakes served with piping hot drumstick sambar and fresh coconut chutney.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80",
    rating: 4.7
  },
  {
    id: "m3",
    name: "Poori Masala (2 pcs)",
    category: "Breakfast",
    price: 50,
    isVeg: true,
    prepTimeMinutes: 6,
    isAvailable: true,
    description: "Golden puffed whole wheat pooris served with spiced potato and onion sagu.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
    rating: 4.6
  },
  {
    id: "m4",
    name: "Medu Vada (2 pcs)",
    category: "Breakfast",
    price: 35,
    isVeg: true,
    prepTimeMinutes: 5,
    isAvailable: true,
    description: "Crispy golden lentil doughnuts tempered with curry leaves and black peppercorns, with sambar.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80",
    rating: 4.7
  },
  {
    id: "m5",
    name: "Ghee Podi Thatte Idli",
    category: "Breakfast",
    price: 45,
    isVeg: true,
    prepTimeMinutes: 4,
    isAvailable: true,
    description: "Soft plate idli smeared with aromatic gunpowder chutney podi and clarified desi ghee.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80",
    rating: 4.9
  },
  {
    id: "m6",
    name: "Onion Uttapam",
    category: "Breakfast",
    price: 50,
    isVeg: true,
    prepTimeMinutes: 7,
    isAvailable: true,
    description: "Thick savory rice-lentil pancake generously topped with caramelized onions, coriander and chilies.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80",
    rating: 4.6
  },
  {
    id: "m7",
    name: "Samosa (2 pcs)",
    category: "Snacks",
    price: 30,
    isVeg: true,
    prepTimeMinutes: 3,
    isAvailable: true,
    description: "Crispy triangular flaky pastry stuffed with seasoned potato and peas, served with sweet tamarind chutney.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
    rating: 4.9
  },
  {
    id: "m8",
    name: "Veg Cheese Grilled Sandwich",
    category: "Snacks",
    price: 75,
    isVeg: true,
    prepTimeMinutes: 7,
    isAvailable: true,
    description: "Crispy grilled bread packed with capsicum, onion, tomato, mint chutney and melted cheese.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80",
    rating: 4.8
  },
  {
    id: "m9",
    name: "Pav Bhaji (Special Butter)",
    category: "Snacks",
    price: 80,
    isVeg: true,
    prepTimeMinutes: 8,
    isAvailable: true,
    description: "Spiced mashed vegetable gravy loaded with butter, served with 2 warm toasted pavs and onions.",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80",
    rating: 4.8
  },
  {
    id: "m10",
    name: "Mumbai Vada Pav",
    category: "Snacks",
    price: 25,
    isVeg: true,
    prepTimeMinutes: 2,
    isAvailable: true,
    description: "Deep fried spiced potato dumpling placed inside a soft bread bun with dry garlic & green chutneys.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
    rating: 4.7
  },
  {
    id: "m11",
    name: "Crispy Peri Peri Fries",
    category: "Snacks",
    price: 60,
    isVeg: true,
    prepTimeMinutes: 5,
    isAvailable: true,
    description: "Golden crispy skin-on potato fries dusted with fiery peri-peri seasoning and creamy garlic dip.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80",
    rating: 4.6
  },
  {
    id: "m12",
    name: "Paneer Tikka Roll",
    category: "Snacks",
    price: 85,
    isVeg: true,
    prepTimeMinutes: 8,
    isAvailable: true,
    description: "Char-grilled spicy cottage cheese cubes wrapped in flaky paratha with sliced onion and mint dressing.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80",
    rating: 4.8
  },
  {
    id: "m13",
    name: "Chicken Tikka Kathi Roll",
    category: "Snacks",
    price: 95,
    isVeg: false,
    prepTimeMinutes: 8,
    isAvailable: true,
    description: "Juicy tandoori chicken tikka pieces wrapped in warm paratha with sliced onions and tangy mint chutney.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80",
    rating: 4.9
  },
  {
    id: "m14",
    name: "Chicken Biryani Combo",
    category: "Meals",
    price: 140,
    isVeg: false,
    prepTimeMinutes: 12,
    isAvailable: true,
    description: "Aromatic basmati rice cooked on slow dum with tender chicken pieces, served with cucumber raita & boiled egg.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
    rating: 4.9
  },
  {
    id: "m15",
    name: "Paneer Butter Masala Thali",
    category: "Meals",
    price: 120,
    isVeg: true,
    prepTimeMinutes: 10,
    isAvailable: true,
    description: "Cottage cheese cubes simmered in creamy makhani gravy, with 2 butter naans, jeera rice, salad and gulab jamun.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
    rating: 4.8
  },
  {
    id: "m16",
    name: "Chole Bhature (2 pcs)",
    category: "Meals",
    price: 95,
    isVeg: true,
    prepTimeMinutes: 9,
    isAvailable: true,
    description: "Puffed golden bhaturas served with robust Amritsari spiced chickpeas, pickled chili and sliced onions.",
    image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&q=80",
    rating: 4.8
  },
  {
    id: "m17",
    name: "Veg Fried Rice with Manchurian",
    category: "Meals",
    price: 110,
    isVeg: true,
    prepTimeMinutes: 9,
    isAvailable: true,
    description: "Wok-tossed seasoned basmati rice served with savory vegetable Manchurian balls in garlic-soya gravy.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80",
    rating: 4.7
  },
  {
    id: "m18",
    name: "South Indian Special Thali",
    category: "Meals",
    price: 85,
    isVeg: true,
    prepTimeMinutes: 6,
    isAvailable: true,
    description: "Comfort meal with hot steamed rice, drumstick sambar, rasam, kootu, curd, crisp papad and sweet payasam.",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80",
    rating: 4.8
  },
  {
    id: "m19",
    name: "Kulhad Masala Chai",
    category: "Beverages",
    price: 20,
    isVeg: true,
    prepTimeMinutes: 3,
    isAvailable: true,
    description: "Authentic ginger and cardamom spiced Indian tea boiled to perfection, served in an earthen kulhad.",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80",
    rating: 4.9
  },
  {
    id: "m20",
    name: "Fresh Orange Juice",
    category: "Beverages",
    price: 50,
    isVeg: true,
    prepTimeMinutes: 4,
    isAvailable: true,
    description: "Freshly squeezed sweet Nagpur oranges with no added artificial flavours or preservatives.",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80",
    rating: 4.7
  },
  {
    id: "m21",
    name: "Cold Coffee with Ice Cream",
    category: "Beverages",
    price: 50,
    isVeg: true,
    prepTimeMinutes: 4,
    isAvailable: true,
    description: "Frothy chilled coffee blended with milk, chocolate drizzle, and crowned with vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80",
    rating: 4.8
  },
  {
    id: "m22",
    name: "Sweet Mango Lassi",
    category: "Beverages",
    price: 45,
    isVeg: true,
    prepTimeMinutes: 3,
    isAvailable: true,
    description: "Thick creamy yogurt churned with sweet Alphonso mango pulp and topped with chopped pistachios.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80",
    rating: 4.9
  },
  {
    id: "m23",
    name: "Chocolate Brownie Sundae",
    category: "Desserts",
    price: 85,
    isVeg: true,
    prepTimeMinutes: 5,
    isAvailable: true,
    description: "Warm fudge brownie topped with vanilla ice cream, hot chocolate fudge and roasted nuts.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80",
    rating: 4.9
  },
  {
    id: "m24",
    name: "Hot Gulab Jamun (2 pcs)",
    category: "Desserts",
    price: 35,
    isVeg: true,
    prepTimeMinutes: 2,
    isAvailable: true,
    description: "Golden milk-solid dumplings deep fried and dipped in warm saffron-cardamom sugar syrup.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80",
    rating: 4.8
  }
];

const INITIAL_DEMO_COMBOS = [
  {
    id: "c1",
    name: "Morning Kickstart Combo",
    items: [
      { id: "m1", name: "Masala Dosa", quantity: 1 },
      { id: "m6", name: "Kulhad Masala Chai", quantity: 1 }
    ],
    price: 70,
    originalPrice: 80,
    discountPercent: 12,
    description: "Hot crispy Masala Dosa paired with fragrant Kulhad Chai for an energizing start.",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&q=80",
    isAvailable: true
  },
  {
    id: "c2",
    name: "Tea Time Crunch Combo",
    items: [
      { id: "m5", name: "Samosa (2 pcs)", quantity: 1 },
      { id: "m6", name: "Kulhad Masala Chai", quantity: 1 }
    ],
    price: 45,
    originalPrice: 50,
    discountPercent: 10,
    description: "2 hot samosas served with sweet & mint chutney along with piping hot tea.",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
    isAvailable: true
  },
  {
    id: "c3",
    name: "Royal Thali & Dessert Deal",
    items: [
      { id: "m9", name: "Paneer Butter Masala Thali", quantity: 1 },
      { id: "m10", name: "Cold Coffee with Ice Cream", quantity: 1 }
    ],
    price: 155,
    originalPrice: 170,
    discountPercent: 9,
    description: "Complete Paneer Butter Masala thali with chilled thick Cold Coffee.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80",
    isAvailable: true
  }
];

const INITIAL_DEMO_ORDERS = [
  {
    id: "ord_101",
    tokenNumber: "CQ021",
    studentId: "student_demo_1",
    customerName: "Rahul Sharma",
    phone: "9876543210",
    items: [
      { id: "m1", name: "Masala Dosa", price: 60, quantity: 2, prepTimeMinutes: 8 },
      { id: "m6", name: "Kulhad Masala Chai", price: 20, quantity: 2, prepTimeMinutes: 3 }
    ],
    totalAmount: 160,
    paymentMethod: "UPI",
    specialInstructions: "Extra coconut chutney please",
    isScheduled: false,
    pickupTime: null,
    status: "Collected",
    estimatedWaitMinutes: 10,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    completedAt: new Date(Date.now() - 20 * 60000).toISOString(),
    rating: 5,
    feedback: "Super crispy dosa and fast counter service!"
  },
  {
    id: "ord_102",
    tokenNumber: "CQ022",
    studentId: "student_demo_2",
    customerName: "Ananya Roy",
    phone: "9123456780",
    items: [
      { id: "m8", name: "Chicken Biryani Combo", price: 140, quantity: 1, prepTimeMinutes: 12 },
      { id: "m10", name: "Cold Coffee with Ice Cream", price: 50, quantity: 1, prepTimeMinutes: 4 }
    ],
    totalAmount: 190,
    paymentMethod: "UPI",
    specialInstructions: "Mild spice level",
    isScheduled: false,
    pickupTime: null,
    status: "Ready for Pickup",
    estimatedWaitMinutes: 14,
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    readyAt: new Date(Date.now() - 2 * 60000).toISOString()
  },
  {
    id: "ord_103",
    tokenNumber: "CQ023",
    studentId: "student_demo_1",
    customerName: "Rahul Sharma",
    phone: "9876543210",
    items: [
      { id: "m4", name: "Veg Cheese Grilled Sandwich", price: 75, quantity: 2, prepTimeMinutes: 7 },
      { id: "m7", name: "Fresh Orange Juice", price: 50, quantity: 1, prepTimeMinutes: 4 }
    ],
    totalAmount: 200,
    paymentMethod: "Cash",
    specialInstructions: "Toast extra crispy",
    isScheduled: false,
    pickupTime: null,
    status: "Preparing",
    estimatedWaitMinutes: 12,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    id: "ord_104",
    tokenNumber: "CQ024",
    studentId: "student_demo_3",
    customerName: "Vikas Patel",
    phone: "9988776655",
    items: [
      { id: "m2", name: "Idli Sambar (2 pcs)", price: 40, quantity: 1, prepTimeMinutes: 4 },
      { id: "m3", name: "Poori Masala (2 pcs)", price: 50, quantity: 1, prepTimeMinutes: 6 }
    ],
    totalAmount: 90,
    paymentMethod: "UPI",
    specialInstructions: "Pack sambar in separate bowl",
    isScheduled: true,
    pickupTime: new Date(Date.now() + 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pickupDate: new Date().toISOString().split('T')[0],
    status: "Order Placed",
    estimatedWaitMinutes: 8,
    createdAt: new Date(Date.now() - 4 * 60000).toISOString()
  }
];

const INITIAL_SETTINGS = {
  canteenName: "CanteenQ Campus Central",
  operatingHours: {
    open: "08:00",
    close: "19:30"
  },
  cancellationAllowedUntil: "Accepted", // 'Order Placed' or 'Accepted'
  defaultPrepBufferMinutes: 3,
  acceptingOrders: true
};

// LocalStorage helpers
const getStored = (key, fallback) => {
  try {
    const val = localStorage.getItem(`canteenq_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(`canteenq_${key}`, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent(`canteenq_change_${key}`, { detail: val }));
  } catch (err) {
    console.error('Storage error:', err);
  }
};

// Event bus for Demo real-time simulation
export const demoStore = {
  getMenu: () => getStored('menu', INITIAL_DEMO_MENU),
  setMenu: (m) => setStored('menu', m),

  getOrders: () => getStored('orders', INITIAL_DEMO_ORDERS),
  setOrders: (o) => setStored('orders', o),

  getCombos: () => getStored('combos', INITIAL_DEMO_COMBOS),
  setCombos: (c) => setStored('combos', c),

  getSettings: () => getStored('settings', INITIAL_SETTINGS),
  setSettings: (s) => setStored('settings', s),

  getNotifications: () => getStored('notifications', [
    {
      id: "notif_1",
      userId: "student_demo_1",
      orderId: "ord_101",
      tokenNumber: "CQ021",
      title: "Order Collected",
      message: "Your pickup token CQ021 has been marked as collected. Enjoy your meal!",
      read: true,
      createdAt: new Date(Date.now() - 20 * 60000).toISOString()
    },
    {
      id: "notif_2",
      userId: "student_demo_2",
      orderId: "ord_102",
      tokenNumber: "CQ022",
      title: "Ready for Pickup!",
      message: "Your order is ready! Pickup Token: CQ022. Please collect your food at Counter 1.",
      read: false,
      createdAt: new Date(Date.now() - 2 * 60000).toISOString()
    }
  ]),
  setNotifications: (n) => setStored('notifications', n),

  // Subscribe helper
  subscribe: (key, cb) => {
    const handler = (e) => cb(e.detail);
    window.addEventListener(`canteenq_change_${key}`, handler);
    return () => window.removeEventListener(`canteenq_change_${key}`, handler);
  }
};

export { app, auth, db };
