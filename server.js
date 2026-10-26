require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { 
  sendFoodReadySMS, 
  sendTestSMS, 
  getGatewayConfigStatus, 
  normalizePhoneNumber 
} = require('./smsService');

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
  const { 
    id,
    tokenNumber,
    customerName, 
    phone, 
    items, 
    paymentMethod, 
    specialInstructions, 
    isScheduled, 
    pickupDate, 
    pickupTime, 
    studentId 
  } = req.body;

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

  // Validate and normalize customer phone number
  const phoneValidation = normalizePhoneNumber(phone || '');
  const registeredPhone = phoneValidation.isValid ? phoneValidation.formatted : (phone || '');

  // Calculate active queue and estimated wait time
  const activeOrders = orders.filter(o => o.status === 'Order Placed' || o.status === 'Accepted' || o.status === 'Preparing');
  const maxPrepTime = Math.max(...items.map(i => i.prepTimeMinutes || 5), 5);
  const estimatedWait = maxPrepTime + (activeOrders.length * 3);

  // Generate or reuse unique token
  let orderToken = tokenNumber;
  if (!orderToken) {
    orderToken = `CQ${String(tokenCounter++).padStart(3, '0')}`;
  } else {
    // Keep internal counter ahead of incoming token numbers
    const numMatch = orderToken.match(/\d+/);
    if (numMatch) {
      const parsedNum = parseInt(numMatch[0], 10);
      if (parsedNum >= tokenCounter) tokenCounter = parsedNum + 1;
    }
  }

  const orderId = id || ("ord_" + Date.now());
  const totalAmount = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const newOrder = {
    id: orderId,
    tokenNumber: orderToken,
    studentId: studentId || "student_guest",
    customerName: customerName || "Student",
    phone: registeredPhone,
    rawPhone: phone || '',
    phoneValid: phoneValidation.isValid,
    items,
    totalAmount,
    paymentMethod: paymentMethod || "UPI",
    specialInstructions: specialInstructions || "",
    isScheduled: Boolean(isScheduled),
    pickupDate: pickupDate || null,
    pickupTime: pickupTime || null,
    status: req.body.status || "Order Placed",
    createdAt: req.body.createdAt || new Date().toISOString(),
    estimatedWaitMinutes: req.body.estimatedWaitMinutes || estimatedWait,
    smsNotificationSent: false
  };

  // Check if order with this id already exists (e.g. from frontend sync)
  const existingIndex = orders.findIndex(o => o.id === newOrder.id);
  if (existingIndex >= 0) {
    orders[existingIndex] = { ...orders[existingIndex], ...newOrder };
  } else {
    orders.unshift(newOrder);
  }

  writeJSONFile(ORDERS_FILE, orders);

  console.log(`[Order Created] Order #${orderId} (${orderToken}) created for ${newOrder.customerName} | Phone: ${newOrder.phone}`);

  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    order: newOrder
  });
});

// 8. PATCH /api/orders/:id/status - Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  const orders = readJSONFile(ORDERS_FILE, INITIAL_ORDERS);
  let order = orders.find(o => o.id === req.params.id);

  if (!order) {
    // If not found in file, auto-register using order details provided in request body
    if (req.body.order || req.body.phone) {
      const incomingPhone = req.body.phone || req.body.order?.phone || '';
      const phoneVal = normalizePhoneNumber(incomingPhone);
      order = {
        id: req.params.id,
        tokenNumber: req.body.tokenNumber || req.body.order?.tokenNumber || 'CQ000',
        customerName: req.body.customerName || req.body.order?.customerName || 'Student',
        phone: phoneVal.isValid ? phoneVal.formatted : incomingPhone,
        rawPhone: incomingPhone,
        status: req.body.status || 'Order Placed',
        items: req.body.order?.items || [],
        totalAmount: req.body.order?.totalAmount || 0,
        createdAt: req.body.order?.createdAt || new Date().toISOString(),
        smsNotificationSent: false
      };
      orders.unshift(order);
    } else {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
  }

  // Ensure the phone number from the placed order is always present
  if ((!order.phone || order.phone.trim() === '') && (req.body.phone || req.body.order?.phone)) {
    const fallbackPhone = req.body.phone || req.body.order?.phone;
    const phoneVal = normalizePhoneNumber(fallbackPhone);
    order.phone = phoneVal.isValid ? phoneVal.formatted : fallbackPhone;
  }

  const { status, reason } = req.body;
  const allowed = [
    'Order Placed', 
    'Accepted', 
    'Preparing', 
    'Ready for Collection', 
    'Ready for Pickup', 
    'Collected', 
    'Cancelled', 
    'Rejected'
  ];

  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status transition: ' + status });
  }

  const previousStatus = order.status;
  order.status = status;
  order.updatedAt = new Date().toISOString();

  const isReadyStatus = (status === 'Ready for Collection' || status === 'Ready for Pickup');
  if (isReadyStatus) {
    order.readyAt = new Date().toISOString();
  }
  if (status === 'Collected') order.completedAt = new Date().toISOString();
  if (status === 'Rejected') order.rejectionReason = reason || 'Item out of stock';

  // Requirement 12: Ensure notification is sent only AFTER backend successfully processes the status change.
  // Requirement 7: Avoid sending duplicate SMS messages if the same order status is updated repeatedly.
  // Requirement 6: Trigger SMS only when order status changes to "Ready for Collection" (or "Ready for Pickup").
  let smsResult = null;

  if (isReadyStatus) {
    if (order.smsNotificationSent) {
      console.log(`[SMS Prevention] Order ${order.id} (${order.tokenNumber}) is ALREADY marked ready. SMS previously dispatched on ${order.smsSentAt}. Skipping duplicate SMS.`);
      smsResult = {
        sent: false,
        skipped: true,
        reason: 'Duplicate SMS avoided: notification already sent for this order',
        sentAt: order.smsSentAt,
        messageId: order.smsMessageId || null,
        recipient: order.phone
      };
    } else {
      // 1. Commit the status transition to storage FIRST (Requirement 12)
      writeJSONFile(ORDERS_FILE, orders);

      // 2. Dispatch the SMS notification strictly to the customer's registered phone
      const targetPhone = order.phone || req.body.phone || req.body.order?.phone;
      console.log(`[Order Status Changed] Order ${order.id} (${order.tokenNumber}) status changed: "${previousStatus}" -> "${status}". Triggering SMS notification to customer phone: ${targetPhone}...`);
      smsResult = await sendFoodReadySMS({
        orderId: order.id,
        tokenNumber: order.tokenNumber,
        customerName: order.customerName,
        phone: targetPhone
      });

      // 3. Record SMS outcome on the order object
      order.whatsappUrl = smsResult.whatsappUrl;
      order.smsUrl = smsResult.smsUrl;
      order.notificationText = smsResult.messageText;

      if (smsResult.success) {
        order.smsNotificationSent = true;
        order.smsSentAt = new Date().toISOString();
        order.smsMessageId = smsResult.messageId;
        order.smsStatus = 'SENT';
        order.smsRecipient = smsResult.recipient;
        delete order.smsError;
      } else {
        order.smsNotificationSent = false;
        order.smsStatus = smsResult.notConfigured ? 'GATEWAY_NOT_CONFIGURED' : (smsResult.isTrialRestriction ? 'TRIAL_RESTRICTION' : 'DELIVERY_FAILED');
        order.smsError = smsResult.error;
        order.smsRecipient = smsResult.recipient || order.phone;
        order.isTrialRestriction = Boolean(smsResult.isTrialRestriction);
      }
    }
  }

  // Persist updated order with SMS delivery status
  writeJSONFile(ORDERS_FILE, orders);

  res.json({
    success: true,
    order,
    sms: smsResult
  });
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
  const ready = orders.filter(o => o.status === 'Ready for Collection' || o.status === 'Ready for Pickup').length;
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

// 12. GET /api/sms/status - Get SMS gateway configuration & health
app.get('/api/sms/status', (req, res) => {
  const status = getGatewayConfigStatus();
  res.json({ success: true, ...status });
});

// 13. POST /api/sms/test - Send test SMS to verify phone & credentials
app.post('/api/sms/test', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Recipient phone number is required' });
  }

  const result = await sendTestSMS({ phone, message });
  res.json({ success: result.success, ...result });
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
