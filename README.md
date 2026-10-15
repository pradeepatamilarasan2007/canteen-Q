# CanteenQ – Smart Canteen Queue & Pre-Ordering System

**CanteenQ** is a full-stack, real-time web application designed for college campuses. It allows students to order food online, bypass long queues, track real-time preparation states, receive ready notifications, and collect their freshly prepared meals using digital pickup tokens.

---

## 🚀 Key Features

### 1. Student Portal
- **Secure Authentication**: Register and log in with student name, email, password, and 10-digit mobile number.
- **Dynamic Food Menu**: Filter by categories (Breakfast, Snacks, Meals, Beverages, Desserts) or **Pure Veg Only**, live text search, item images, prices in ₹, and prep time estimates.
- **Immediate & Scheduled Orders**: Order for immediate preparation or schedule a future pickup time with validation against canteen operating hours.
- **Digital Pickup Token**: Unique token generated per order (e.g., `CQ025`) with queue-based estimated wait times.
- **Order Progress Tracker**: Real-time status tracker (`Order Placed` → `Accepted` → `Preparing` → `Ready for Pickup` → `Collected`).
- **In-App Notifications**: Sound & visual notifications when your food is ready for pickup with the token and counter details.
- **Order Cancellation**: Cancel active orders before kitchen begins cooking, immediately freeing your token and updating the queue.
- **Reorder ("Order Again")**: 1-click reorder from order history with live menu stock and price re-verification.
- **Rating & Feedback**: 1-5 star ratings and reviews for collected orders.
- **Combos & Savings**: Special bundle offers (e.g. Masala Dosa + Kulhad Chai, Samosa + Chai).

### 2. Canteen Management & Kitchen Display System (KDS)
- **Role-Based Access**: Restricted to authorized canteen staff.
- **Live Ticket Dashboard**: Real-time incoming tickets with customer name, mobile number, items, and elapsed preparation timer.
- **Token Search & Quick Filter**: Instant search by token number, student name, or order ID, with filters for Active, Ready, Scheduled, and Collected tickets.
- **Kitchen Status Controls**: Accept, start cooking, mark ready for pickup (which instantly notifies the student), and confirm collection.
- **Preparation Time Adjustments**: Ability to configure preparation time estimates per ticket or per dish.
- **Live Food Availability Manager**: Toggle stock (`Available` vs `Sold Out`) in real-time with immediate reflection on student menus. Add, edit, or delete items.
- **Combo Deal Creator**: Bundle multiple items with automated discount calculations.
- **Real-Time Analytics & Feedback**: Daily revenue, total orders, fulfillment rate, top-selling dishes, and customer star reviews from actual stored records.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, Vite 6, Tailwind CSS 4
- **Icons**: Lucide React
- **Database & Auth**: Cloud Firestore + Firebase Authentication (with automatic fall-back to zero-config **Demo Mode**)
- **Backend (Optional API / Static Server)**: Node.js Express 4

---

## 📦 Project Structure

```
fsd exp 10/
├── firestore.rules          # Cloud Firestore role-based security rules
├── .env.example             # Firebase environment variables template
├── package.json             # Scripts & dependencies
├── vite.config.js           # Vite build & proxy configuration
├── server.js                # Express backend (API + production host)
├── data/
│   ├── menu.json            # Local menu storage
│   └── orders.json          # Local orders storage
└── src/
    ├── services/
    │   └── firebase.js      # Firebase SDK adapter + DemoStore event bus
    ├── context/
    │   ├── AuthContext.jsx  # User roles (Student & Staff) and sessions
    │   ├── MenuContext.jsx  # Live menu & combo offers state
    │   └── OrderContext.jsx # Cart, token generation, queue & notification engine
    ├── components/
    │   ├── DemoBanner.jsx   # Top notification bar with 1-click role switcher
    │   ├── Navbar.jsx       # Header with notification bell, cart badge & tabs
    │   ├── MenuCatalog.jsx  # Food cards, search, filters & cart steppers
    │   ├── CombosView.jsx   # Special meal bundle deals
    │   ├── CartDrawer.jsx   # Tray drawer with scheduled pickup selectors
    │   ├── OrderReceiptModal.jsx # Digital token receipt card
    │   ├── MyOrdersView.jsx # Live order stepper, cancellation & ratings
    │   ├── LiveQueueView.jsx # Public & student queue display board
    │   ├── KitchenDashboard.jsx # Staff KDS with ticket status workflows
    │   ├── MenuManager.jsx  # Live food stock toggle and item pricing
    │   ├── ComboManager.jsx # Staff combo configuration
    │   ├── StaffFeedbackView.jsx # Reviews and star rating breakdown
    │   ├── AnalyticsView.jsx# Sales revenue and queue statistics
    │   ├── NotificationsModal.jsx # In-app notification drawer
    │   └── LoginModal.jsx   # Student & Staff login / registration
    ├── App.jsx              # Main application shell
    └── index.css            # Tailwind theme with dark green accents
```

---

## ⚙️ Setup and Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Production Backend & Frontend
```bash
npm run build
npm start
```
The server will be available at [http://localhost:5000](http://localhost:5000).

---

## 🔒 Firebase Configuration & Security Rules

To link your live Firebase project, create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

Deploy the included security rules:
```bash
firebase deploy --only firestore:rules
```

### Firestore Security Rules Summary (`firestore.rules`):
- **Students**: Can read menu & combos; can create and read only their own orders; can cancel orders only if the status is `Order Placed` or `Accepted`.
- **Staff**: Can read and update all orders, manage menu availability, and create combos.
- **Notifications**: Associated strictly with the student's authenticated `uid`.

---

## 💡 Demo Mode (Zero-Config Testing)

If no Firebase credentials are configured in `.env`, CanteenQ automatically switches to **Demo Mode**:
- An informative top banner is displayed.
- Persistent `localStorage` and real-time custom event broadcasting across tabs simulate Firestore listeners seamlessly.
- **1-Click Role Switcher**: Click **"Student"** or **"Staff KDS"** in the top banner to switch personas instantly without entering passwords.
- Pre-seeded with authentic South Indian & North Indian college canteen dishes (Masala Dosa, Idli Sambar, Poori Masala, Chai, Biryani Thali, etc.) and active orders.

---

## ✅ Completed Deliverables Matrix

| Feature | Status | Notes |
|---|---|---|
| White background with dark green accents | Completed | Clean minimal typography, emerald-800/950 palette |
| Student Registration & Login | Completed | Collects name, phone, email, and password |
| Canteen Staff Portal | Completed | Role-based order management and kitchen controls |
| Food Menu & Search Filters | Completed | Category pills, veg-only filter, real-time search |
| Sold-out validation | Completed | Prevents adding or checkout of unavailable items |
| Digital Pickup Token (`CQ025`) | Completed | Unique incremental token generation per active ticket |
| Estimated Waiting Time | Completed | Dynamic formula: max item prep time + (queue length × 3m) |
| Scheduled Pre-Ordering | Completed | Date and time selector restricted to operating hours |
| Live Stock Availability Toggle | Completed | Staff can toggle items `Available` or `Sold Out` instantly |
| Order Cancellation Policy | Completed | Allowed during `Order Placed` / `Accepted`; locked once `Preparing` |
| Real-Time Order Stepper | Completed | 5-step progress: Placed → Accepted → Preparing → Ready → Collected |
| In-App Ready Notifications | Completed | Triggers notification when status changes to Ready for Pickup |
| Food Rating & Feedback | Completed | 1-5 stars & feedback comments on collected orders |
| Reorder ("Order Again") | Completed | Re-adds items to cart with fresh availability checks |
| Combo Offers | Completed | Value bundle creation and student ordering |
| Stored Data Analytics | Completed | Today's revenue, order counts, and dish demand |
