const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Paths for JSON storage
const DATA_DIR = path.join(__dirname, 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const COMBOS_FILE = path.join(DATA_DIR, 'combos.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Menu Data
const INITIAL_MENU = [
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
    id: "m5",
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
    id: "m6",
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
    id: "m7",
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
    id: "m8",
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
    id: "m9",
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
    id: "m10",
    name: "Cold Coffee with Ice Cream",
    category: "Beverages",
    price: 50,
    isVeg: true,
    prepTimeMinutes: 4,
    isAvailable: true,
    description: "Frothy chilled coffee blended with milk, chocolate drizzle, and crowned with vanilla ice cream.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80",
    rating: 4.8
  }
];

const INITIAL_COMBOS = [
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
  }
];

const INITIAL_ORDERS = [
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
  }
];

// Helper functions for reading/writing storage
function readJSONFile(filePath, defaultData) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Token counter for CQ tokens
let tokenCounter = 24;

// API Routes

// 1. GET /api/menu - Get all menu items
app.get('/api/menu', (req, res) => {
  const menu = readJSONFile(MENU_FILE, INITIAL_MENU);
  res.json({ success: true, menu });
});

// 2. POST /api/menu - Add new menu item
app.post('/api/menu', (req, res) => {
  const menu = readJSONFile(MENU_FILE, INITIAL_MENU);
  const newItem = {
    id: "m" + Date.now(),
    name: req.body.name,
    category: req.body.category || "Snacks",
    price: Number(req.body.price) || 0,
    isVeg: Boolean(req.body.isVeg),
    prepTimeMinutes: Number(req.body.prepTimeMinutes) || 5,
    isAvailable: true,
    description: req.body.description || "",
    image: req.body.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
    rating: 4.8
  };
  menu.push(newItem);
  writeJSONFile(MENU_FILE, menu);
  res.status(201).json({ success: true, item: newItem });
});

// 3. PUT /api/menu/:id - Update item availability or details
app.put('/api/menu/:id', (req, res) => {
  const menu = readJSONFile(MENU_FILE, INITIAL_MENU);
  const index = menu.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  menu[index] = { ...menu[index], ...req.body };
  writeJSONFile(MENU_FILE, menu);
  res.json({ success: true, item: menu[index] });
});

// 4. DELETE /api/menu/:id - Delete menu item
app.delete('/api/menu/:id', (req, res) => {
  let menu = readJSONFile(MENU_FILE, INITIAL_MENU);
  menu = menu.filter(item => item.id !== req.params.id);
  writeJSONFile(MENU_FILE, menu);
  res.json({ success: true, message: 'Item deleted successfully' });
});

// 5. GET /api/combos - Get all combos
app.get('/api/combos', (req, res) => {
  const combos = readJSONFile(COMBOS_FILE, INITIAL_COMBOS);
  res.json({ success: true, combos });
});

// 6. GET /api/orders - Get all orders
app.get('/api/orders', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE, INITIAL_ORDERS);
  res.json({ success: true, orders });
});

// 7. POST /api/orders - Create new order (Immediate or Scheduled)
app.post('/api/orders', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE, INITIAL_ORDERS);
  const menu = readJSONFile(MENU_FILE, INITIAL_MENU);
  const { customerName, phone, items, paymentMethod, specialInstructions, isScheduled, pickupDate, pickupTime, studentId } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart cannot be empty' });
  }

  // Validate item availability and prices
  for (const it of items) {
    const menuItem = menu.find(m => m.id === it.id);
    if (menuItem && !menuItem.isAvailable) {
      return res.status(400).json({ success: false, message: `"${menuItem.name}" is currently Sold Out.` });
    }
  }

  // Calculate active queue and estimated wait time
  const activeOrders = orders.filter(o => o.status === 'Order Placed' || o.status === 'Accepted' || o.status === 'Preparing');
  const maxPrepTime = Math.max(...items.map(i => i.prepTimeMinutes || 5), 5);
  const estimatedWait = maxPrepTime + (activeOrders.length * 3);

  // Generate unique CQ Token
  const currentToken = `CQ${String(tokenCounter++).padStart(3, '0')}`;
  const totalAmount = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const newOrder = {
    id: "ord_" + Date.now(),
    tokenNumber: currentToken,
    studentId: studentId || "student_guest",
    customerName: customerName || "Student",
    phone: phone || "9876543210",
    items,
    totalAmount,
    paymentMethod: paymentMethod || "UPI",
    specialInstructions: specialInstructions || "",
    isScheduled: Boolean(isScheduled),
    pickupDate: pickupDate || null,
    pickupTime: pickupTime || null,
    status: "Order Placed",
    createdAt: new Date().toISOString(),
    estimatedWaitMinutes: estimatedWait
  };

  orders.unshift(newOrder);
  writeJSONFile(ORDERS_FILE, orders);

  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    order: newOrder
  });
});

// 8. PATCH /api/orders/:id/status - Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE, INITIAL_ORDERS);
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const { status, reason } = req.body;
  const allowed = ['Order Placed', 'Accepted', 'Preparing', 'Ready for Pickup', 'Collected', 'Cancelled', 'Rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status transition' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === 'Ready for Pickup') order.readyAt = new Date().toISOString();
  if (status === 'Collected') order.completedAt = new Date().toISOString();
  if (status === 'Rejected') order.rejectionReason = reason || 'Item out of stock';

  writeJSONFile(ORDERS_FILE, orders);
  res.json({ success: true, order });
});

// 9. POST /api/orders/:id/cancel - Student cancellation endpoint
app.post('/api/orders/:id/cancel', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE, INITIAL_ORDERS);
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Cancellation policy check
  if (order.status !== 'Order Placed' && order.status !== 'Accepted') {
    return res.status(400).json({ 
      success: false, 
      message: `Cannot cancel. Order is already in "${order.status}" status.` 
    });
  }

  order.status = 'Cancelled';
  order.cancelledAt = new Date().toISOString();
  writeJSONFile(ORDERS_FILE, orders);
  res.json({ success: true, message: 'Order cancelled successfully', order });
});

// 10. POST /api/orders/:id/rate - Customer rating endpoint
app.post('/api/orders/:id/rate', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE, INITIAL_ORDERS);
  const order = orders.find(o => o.id === req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (order.status !== 'Collected') {
    return res.status(400).json({ success: false, message: 'Only collected orders can be rated' });
  }

  order.rating = Number(req.body.rating) || 5;
  order.feedback = (req.body.feedback || '').trim();
  order.ratedAt = new Date().toISOString();
  writeJSONFile(ORDERS_FILE, orders);
  res.json({ success: true, message: 'Rating saved', order });
});

// 11. GET /api/queue/stats - Get analytics
app.get('/api/queue/stats', (req, res) => {
  const orders = readJSONFile(ORDERS_FILE, INITIAL_ORDERS);

  const pending = orders.filter(o => o.status === 'Order Placed' || o.status === 'Accepted').length;
  const preparing = orders.filter(o => o.status === 'Preparing').length;
  const ready = orders.filter(o => o.status === 'Ready for Pickup').length;
  const completed = orders.filter(o => o.status === 'Collected').length;
  
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled' && o.status !== 'Rejected')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    success: true,
    stats: {
      totalOrders: orders.length,
      pending,
      preparing,
      ready,
      completed,
      totalRevenue
    }
  });
});

// Serve frontend static build files
const DIST_PATH = path.join(__dirname, 'dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` CanteenQ Smart Queue & Canteen Server Running!`);
  console.log(` API Endpoint: http://localhost:${PORT}/api/menu`);
  console.log(` Web Interface: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
