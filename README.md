# GreenNest - Eco-Friendly Ordering System

A modern web application where students can browse products, add them to a cart, and place orders. Features role-based access for students, sellers, and admins.

## Tech Stack

- **Frontend**: React.js 18 with Vite
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Routing**: React Router v6
- **State Management**: Context API (AuthContext, CartContext)
- **Styling**: Plain CSS (no external UI libraries)

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation header with auth info
│   ├── ProductCard.jsx     # Reusable product display component
│   └── ProtectedRoute.jsx  # Route protection wrapper
├── pages/
│   ├── LoginPage.jsx       # User login
│   ├── SignupPage.jsx      # User registration
│   ├── LandingPage.jsx     # Landing page with hero section
│   └── HomePage.jsx        # Product listing
├── context/
│   ├── AuthContext.jsx     # Authentication state & methods
│   └── CartContext.jsx     # Shopping cart state & methods
├── services/
│   └── firebase.js         # Firebase configuration
├── css/
│   ├── index.css          # Global styles
│   ├── Header.css
│   ├── Auth.css
│   ├── ProductCard.css
│   ├── HomePage.css
│   └── App.css
├── App.jsx                # Main app component with routing
└── main.jsx              # Entry point
```

## Prerequisites

- Node.js 16+ and npm
- Firebase project (with Authentication and Firestore enabled)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database in test mode
4. Copy your Firebase credentials
5. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

6. Fill in your Firebase credentials in `.env`:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 3. Set Up Firestore Security Rules

1. Go to **Firebase Console** → **Firestore Database** → **Rules** tab
2. Replace the default rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read products
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid != null;
    }
    
    // Users collection - authenticated users only
    match /users/{uid} {
      // Allow users to read and write their own document
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if request.auth != null && request.auth.uid == uid;
      
      // Allow creation of new user documents
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
    
    // Orders collection
    match /orders/{document=**} {
      allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.uid == resource.data.sellerId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.uid == resource.data.sellerId);
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish** to apply these rules

### 4. Create Firestore Collections

Create the following collections in Firestore:

#### `users` collection
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  role: "user" | "admin",        // "user" is default, change to "admin" manually in Firestore
  createdAt: timestamp,
  orders: array
}
```

#### `products` collection
```javascript
{
  name: string,
  price: number,
  description: string,
  stock: number,
  sellerId: string,
  imageUrl: string (optional),
  createdAt: timestamp,
  category: string (optional)
}
```

#### `orders` collection
```javascript
{
  userId: string,
  items: array,
  totalPrice: number,
  status: "pending" | "preparing" | "completed" | "cancelled",
  createdAt: timestamp,
  shippingAddress: string (optional),
  notes: string (optional)
}
```

### 5. Run Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Features

### Current Implementation
- ✅ User Authentication (Register/Login/Logout)
- ✅ Role-based access (student, seller, admin)
- ✅ Product listing with search
- ✅ Shopping cart with localStorage persistence
- ✅ Protected routes based on authentication
- ✅ Responsive design

### To Implement Next
- [ ] Cart page with quantity management
- [ ] Checkout and order creation
- [ ] Order tracking/history
- [ ] Seller dashboard (product management)
- [ ] Admin dashboard (user & order management)
- [ ] Product detail page
- [ ] Wishlist functionality
- [ ] Product reviews and ratings

## User Roles and Management

### Default Role: "user"
All new registered users automatically get the **"user"** role. This is the standard customer/student role.

### Creating an Admin User
To create an admin user, follow these steps:

1. Register a new account normally on the app
2. Go to your **Firestore Console**
3. Navigate to the **users** collection
4. Find the user document you just created
5. Edit the **role** field and change it from **"user"** to **"admin"**
6. Log out and log back in
7. The user will now see an **"Admin Dashboard"** link in the profile dropdown menu

### Admin Capabilities
- Access the Admin Dashboard at `/admin-dashboard`
- Manage all users, products, and orders in the system
- View system analytics and statistics
- Only accessible to users with role = "admin"

### Attempting to Access Admin Pages
- If a non-admin user tries to access `/admin-dashboard`, they will be redirected to the home page
- Protected routes check the user's role before granting access

## Authentication Flow

1. User registers with email, password, name, and role selection
2. User data stored in Firestore `users` collection
3. On login, user role is fetched from Firestore
4. Protected routes check authentication status and user role
5. Logout clears user state and localStorage cart

## Context API Usage

### AuthContext
```javascript
const { user, userRole, loading, isAuthenticated, register, login, logout } = useAuth()
```

### CartContext
```javascript
const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart()
```

## Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## Contributing

Follow these conventions:
- Use functional components with hooks
- Keep components modular and reusable
- Use descriptive variable and function names
- Add comments for complex logic
- Test protected routes thoroughly

## License

Private project for educational purposes
