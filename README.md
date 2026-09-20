# Full-Stack E-Commerce Architecture & Frontend Implementation Guide

Comprehensive developer guide for building a modern **React + Vite + Tailwind CSS** frontend for the **Laravel 10 E-Commerce API** located at `/home/pila/Desktop/Backend_Ecommerce/e_commerce`.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Backend API Audit & Required Route Adjustment](#2-backend-api-audit--required-route-adjustment)
3. [Frontend Tech Stack & Directory Structure](#3-frontend-tech-stack--directory-structure)
4. [Authentication & Role-Based Access Control (RBAC)](#4-authentication--role-based-access-control-rbac)
5. [Core Frontend Implementation (Code Included)](#5-core-frontend-implementation-code-included)
   - [5.1 API Client & Axios Interceptor (`axiosClient.js`)](#51-api-client--axios-interceptor-axiosclientjs)
   - [5.2 Authentication Context (`AuthContext.jsx`)](#52-authentication-context-authcontextjsx)
   - [5.3 Cart State Context (`CartContext.jsx`)](#53-cart-state-context-cartcontextjsx)
   - [5.4 Route Guards (`ProtectedRoute.jsx` & `AdminRoute.jsx`)](#54-route-guards-protectedroutejsx--adminroutejsx)
   - [5.5 Customer Storefront Navbar with Dynamic Admin Button](#55-customer-storefront-navbar-with-dynamic-admin-button)
   - [5.6 Customer Storefront Pages](#56-customer-storefront-pages)
     - [Product Catalog / Home Page (`HomePage.jsx`)](#product-catalog--home-page-homepagejsx)
     - [Shopping Cart Page (`CartPage.jsx`)](#shopping-cart-page-cartpagejsx)
     - [Checkout Page (`CheckoutPage.jsx`)](#checkout-page-checkoutpagejsx)
     - [Customer Orders History (`OrdersPage.jsx`)](#customer-orders-history-orderspagejsx)
     - [Authentication Pages (`LoginPage.jsx` & `RegisterPage.jsx`)](#authentication-pages-loginpagejsx--registerpagejsx)
   - [5.7 Admin Dashboard Pages](#57-admin-dashboard-pages)
     - [Admin Layout & Sidebar (`AdminLayout.jsx`)](#admin-layout--sidebar-adminlayoutjsx)
     - [Dashboard Overview Metrics (`DashboardOverview.jsx`)](#dashboard-overview-metrics-dashboardoverviewjsx)
     - [Product Management with Image Upload (`ProductManagement.jsx`)](#product-management-with-image-upload-productmanagementjsx)
     - [Order Management & Status Updates (`OrderManagement.jsx`)](#order-management--status-updates-ordermanagementjsx)
   - [5.8 Main App Routing (`App.jsx`)](#58-main-app-routing-appjsx)
6. [Step-by-Step Setup & Run Instructions](#6-step-by-step-setup--run-instructions)
7. [Verification & Role-Testing Checklist](#7-verification--role-testing-checklist)

---

## 1. Architecture Overview

This e-commerce application consists of two integrated interfaces served by a single frontend application:

```
                              ┌─────────────────────────────────────────┐
                              │           Laravel 10 Backend            │
                              │     http://127.0.0.1:8000/api           │
                              └────────────────────┬────────────────────┘
                                                   │
                                       REST API / JWT Bearer
                                                   │
                                                   ▼
                              ┌─────────────────────────────────────────┐
                              │            React 18 Frontend            │
                              │          (Vite + Tailwind CSS)          │
                              └───────┬─────────────────────────┬───────┘
                                      │                         │
                                      ▼                         ▼
                  ┌───────────────────────────────┐ ┌───────────────────────────────┐
                  │      Customer Storefront      │ │        Admin Dashboard        │
                  │        (User Front)           │ │       (Protected Role)        │
                  ├───────────────────────────────┤ ├───────────────────────────────┤
                  │ • Browse Products & Catalog   │ │ • "Go to Dashboard" button    │
                  │ • Search, Filter & Categories │ │   visible ONLY to Admin       │
                  │ • Cart Management             │ │ • Add/Edit/Delete Products    │
                  │ • Checkout & Payment methods  │ │ • Upload Product Images       │
                  │ • Order History & Status      │ │ • Manage Categories & Brands  │
                  │ • Cancel Order (restock stock)│ │ • Process & Update Orders     │
                  │ • Customer Login / Register   │ │ • View Payments & Customers   │
                  └───────────────────────────────┘ └───────────────────────────────┘
```

### Key Requirement: Role-Based Admin Button Visibility
- **When Guest (Unauthenticated)**: Visitors see products, search, category filters, and `Login` / `Register` buttons. The `Admin Dashboard` button is **hidden**.
- **When Regular Customer (`role: "user"`)**: After logging in, customers see their name, `Cart` badge with live item count, `My Orders`, and `Logout`. The `Admin Dashboard` button remains strictly **hidden**.
- **When Admin (`role: "admin"`)**: When an administrator logs in, the navbar immediately renders a prominent **"Admin Dashboard"** button (with shield icon) linking to `/admin`.
- **Security Guarding**: Direct URL access to `/admin` by non-admins or guests is intercepted by `AdminRoute.jsx` and redirected to `/` with an unauthorized alert.

---

## 2. Backend API Audit & Required Route Adjustment

### 2.1 Backend Endpoints Summary

Base URL: `http://127.0.0.1:8000/api`

| Module | Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Public | Register customer (`name`, `email`, `password`) |
| **Auth** | `POST` | `/auth/login` | Public | Login (`email`, `password`) → returns JWT token |
| **Products** | `GET` | `/products` | Customer / Public | List all products with images and prices |
| **Products** | `POST` | `/add-product` | Admin only | Create product (`multipart/form-data`) |
| **Products** | `POST` | `/update-product/{id}` | Admin only | Update product details or replace image |
| **Products** | `DELETE` | `/delete-product/{id}` | Admin only | Delete product |
| **Categories** | `GET` | `/categories` | Customer / Public | List categories |
| **Categories** | `POST` | `/add-category` | Admin only | Create category (`name`) |
| **Categories** | `POST` | `/update-category/{id}` | Admin only | Update category name |
| **Categories** | `DELETE` | `/delete-category/{id}` | Admin only | Delete category |
| **Brands** | `GET` | `/brands` | Customer / Public | List brands |
| **Brands** | `POST` | `/add-brand` | Admin only | Create brand (`brand_name`, `cate_id`) |
| **Brands** | `POST` | `/update-brand/{id}` | Admin only | Update brand |
| **Brands** | `DELETE` | `/delete-brand/{id}` | Admin only | Delete brand |
| **Cart** | `GET` | `/cart` | Authenticated | Get current user cart, subtotal, and items |
| **Cart** | `POST` | `/add-cart` | Authenticated | Add item (`product_id`, `quantity`) |
| **Cart** | `POST` | `/update-cart/{id}` | Authenticated | Update quantity |
| **Cart** | `DELETE` | `/delete-cart/{id}` | Authenticated | Remove item from cart |
| **Cart** | `DELETE` | `/clear-cart` | Authenticated | Clear cart |
| **Orders** | `POST` | `/add-order` | Authenticated | Place order from cart or direct items |
| **Orders** | `GET` | `/orders` | Authenticated | Admin sees all; User sees their own |
| **Orders** | `GET` | `/order-detail/{id}` | Authenticated | View order details |
| **Orders** | `POST` | `/update-order/{id}` | Admin / User | Update status (`pending`, `processing`, `completed`, `cancelled`) |
| **Orders** | `DELETE` | `/delete-order/{id}` | Admin only | Delete order |
| **Payments** | `POST` | `/add-payment` | Authenticated | Record payment (`order_id`, `payment_method`, `amount`) |
| **Payments** | `GET` | `/payments` | Authenticated | List payments |
| **Users** | `GET` | `/users` | Admin only | List all registered users |

---

### 2.2 Critical Backend Adjustment in `routes/api.php`

> [!IMPORTANT]
> In the existing backend `/home/pila/Desktop/Backend_Ecommerce/e_commerce/routes/api.php`, `GET /products`, `GET /categories`, and `GET /brands` are placed inside `Route::middleware(['auth:api','admin'])`.
>
> If not updated, regular shoppers and visitors cannot view products and receive a `401 Unauthorized` response.

Update `routes/api.php` in the backend so public and regular users can browse products and categories:

```php
// ==========================================
// 1. PUBLIC ROUTES (Browsing catalog)
// ==========================================
Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('/register', 'register');
    Route::post('/login', 'login');
});

// Allow visitors and shoppers to view catalog
Route::get('/products', [ProductController::class, 'product']);
Route::get('/categories', [CategoryController::class, 'category']);
Route::get('/brands', [BrandController::class, 'brand']);

// ==========================================
// 2. ADMIN ONLY ROUTES (Create / Update / Delete)
// ==========================================
Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::controller(UserController::class)->group(function () {
        Route::get('/users', 'user');
    });

    Route::controller(CategoryController::class)->group(function () {
        Route::post('/add-category', 'createCategory');
        Route::post('/update-category/{id}', 'updateCategory');
        Route::delete('/delete-category/{id}', 'deleteCategory');
    });

    Route::controller(BrandController::class)->group(function () {
        Route::post('/add-brand', 'createBrand');
        Route::post('/update-brand/{id}', 'updateBrand');
        Route::delete('/delete-brand/{id}', 'deleteBrand');
    });

    Route::controller(ProductController::class)->group(function () {
        Route::post('/add-product', 'createProduct');
        Route::post('/update-product/{id}', 'updateProduct');
        Route::delete('/delete-product/{id}', 'deleteProduct');
    });
});

// ==========================================
// 3. AUTHENTICATED USER ROUTES (Cart, Orders, Payments)
// ==========================================
Route::middleware(['auth:api'])->group(function () {
    // Cart
    Route::controller(CartController::class)->group(function () {
        Route::get('/cart', 'cart');
        Route::post('/add-cart', 'createCart');
        Route::post('/update-cart/{id}', 'updateCart');
        Route::delete('/delete-cart/{id}', 'deleteCart');
        Route::delete('/clear-cart', 'clearCart');
    });

    // Orders
    Route::controller(OrderController::class)->group(function () {
        Route::get('/orders', 'order');
        Route::post('/add-order', 'createOrder');
        Route::post('/update-order/{id}', 'updateOrder');
        Route::delete('/delete-order/{id}', 'deleteOrder');
        Route::get('/order-detail/{id}', 'orderDetail');
    });

    // Payments
    Route::controller(PaymentController::class)->group(function () {
        Route::get('/payments', 'payment');
        Route::post('/add-payment', 'createPayment');
        Route::get('/payment-detail/{id}', 'paymentDetail');
    });
});
```

---

## 3. Frontend Tech Stack & Directory Structure

### Recommended Stack
- **Framework**: React 18 with Vite (rapid HMR, modern ES modules)
- **Styling**: Tailwind CSS v3 (responsive utility classes)
- **Icons**: Lucide React (`lucide-react`)
- **Routing**: React Router DOM v6 (`react-router-dom`)
- **HTTP Client**: Axios with automatic JWT injection
- **JWT Token Decoder**: `jwt-decode` (extracts claims: `name`, `email`, `role`)

### Proposed Project Directory
```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── api/
    │   └── axiosClient.js          # Base Axios instance with Bearer interceptor
    ├── context/
    │   ├── AuthContext.jsx         # User state, JWT role extraction, login/logout
    │   └── CartContext.jsx         # Cart items count, refreshCart, addToCart helper
    ├── routes/
    │   ├── ProtectedRoute.jsx      # Guards routes requiring any authenticated user
    │   └── AdminRoute.jsx          # Guards routes requiring role === 'admin'
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx          # Top navbar with conditional Admin Dashboard button
    │   │   └── Footer.jsx          # Footer component
    │   ├── storefront/
    │   │   ├── ProductCard.jsx     # Product card with image, price, Add to Cart
    │   │   └── HeroBanner.jsx      # Storefront promo banner
    │   └── admin/
    │       └── AdminSidebar.jsx    # Sidebar navigation for admin dashboard
    ├── layouts/
    │   ├── StorefrontLayout.jsx    # Wrapper for customer pages
    │   └── AdminLayout.jsx         # Wrapper for admin dashboard pages
    └── pages/
        ├── storefront/
        │   ├── HomePage.jsx        # Product catalog, search, category filter
        │   ├── CartPage.jsx        # Shopping cart view, quantity +/- & remove
        │   ├── CheckoutPage.jsx    # Shipping, discount & payment submission
        │   ├── OrdersPage.jsx      # Customer order tracking & cancel option
        │   ├── LoginPage.jsx       # Login form (admin & customer)
        │   └── RegisterPage.jsx    # Customer registration form
        └── admin/
            ├── DashboardOverview.jsx # Sales overview, metrics & inventory alerts
            ├── ProductManagement.jsx # Product CRUD with image upload modal
            └── OrderManagement.jsx   # Order status updates (pending -> completed)
```

---

## 4. Authentication & Role-Based Access Control (RBAC)

In this backend (`/home/pila/Desktop/Backend_Ecommerce/e_commerce`), the `User` model configures custom JWT claims in `app/Models/User.php`:

```php
public function getJWTCustomClaims(): array
{
    return [
        'name' => $this->user_name,
        'email' => $this->email,
        'role' => $this->role, // 'admin' or 'user'
    ];
}
```

When a user logs in via `POST /api/auth/login`, the response returns:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "8a3f9c7b12d5e4...",
  "token_type": "bearer"
}
```

By decoding `access_token` on the frontend using `jwt-decode`, we immediately extract:
- `sub`: User ID
- `name`: User Name
- `email`: User Email
- `role`: `"admin"` or `"user"`

### Role Matrix

| Capability | Guest | Regular User (`user`) | Administrator (`admin`) |
| :--- | :---: | :---: | :---: |
| Browse Products & Categories | ✅ | ✅ | ✅ |
| Add to Cart & Checkout | ❌ (Prompts Login) | ✅ | ✅ |
| View "My Orders" | ❌ | ✅ (Own orders only) | ✅ (Own orders) |
| **"Admin Dashboard" Button in Navbar** | ❌ (Hidden) | ❌ (Hidden) | ✅ **VISIBLE** |
| Access `/admin/*` Routes | ❌ (Redirected) | ❌ (Redirected) | ✅ **Full Access** |
| Add / Edit / Delete Products | ❌ | ❌ | ✅ |
| Manage Categories & Brands | ❌ | ❌ | ✅ |
| Update Order Status (Pending → Completed) | ❌ | ❌ (Can only cancel pending) | ✅ |
| View All Customer Orders & Payments | ❌ | ❌ | ✅ |

---

## 5. Core Frontend Implementation (Code Included)

### 5.1 API Client & Axios Interceptor (`axiosClient.js`)

Create `src/api/axiosClient.js`:

```javascript
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry (401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and reload if unauthorized
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

---

### 5.2 Authentication Context (`AuthContext.jsx`)

Create `src/context/AuthContext.jsx`:

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [loading, setLoading] = useState(true);

  // Decode token on mount or token change
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token has expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          logout();
        } else {
          setUser({
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role, // 'admin' or 'user'
          });
        }
      } catch (err) {
        console.error('Failed to decode JWT token:', err);
        logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    const { access_token, refresh_token } = response.data;

    localStorage.setItem('access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }

    setToken(access_token);
    const decoded = jwtDecode(access_token);
    const loggedUser = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (name, email, password) => {
    const response = await axiosClient.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

### 5.3 Cart State Context (`CartContext.jsx`)

Create `src/context/CartContext.jsx`:

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCartCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosClient.get('/cart');
      if (res.data && res.data.cart) {
        setCart(res.data.cart);
        setCartCount(res.data.cart.total_items || 0);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      window.location.href = '/login?message=Please login to add items to your cart';
      return;
    }
    const res = await axiosClient.post('/add-cart', {
      product_id: productId,
      quantity,
    });
    await fetchCart();
    return res.data;
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    await axiosClient.post(`/update-cart/${cartItemId}`, { quantity: newQty });
    await fetchCart();
  };

  const removeFromCart = async (cartItemId) => {
    await axiosClient.delete(`/delete-cart/${cartItemId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await axiosClient.delete('/clear-cart');
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
```

---

### 5.4 Route Guards (`ProtectedRoute.jsx` & `AdminRoute.jsx`)

Create `src/routes/ProtectedRoute.jsx`:

```jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

Create `src/routes/AdminRoute.jsx`:

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Verifying permissions...</div>;
  }

  // Must be authenticated AND have role === 'admin'
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

---

### 5.5 Customer Storefront Navbar with Dynamic Admin Button

Create `src/components/common/Navbar.jsx`:

```jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User, ShieldCheck, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Brand Logo */}
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <ShoppingBag className="w-6 h-6" />
            <span>KhmerStore</span>
          </Link>

          {/* 2. Center Nav Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium transition">
              Catalog
            </Link>
            {isAuthenticated && (
              <Link to="/orders" className="text-gray-700 hover:text-indigo-600 font-medium transition flex items-center gap-1">
                <Package className="w-4 h-4" />
                My Orders
              </Link>
            )}
          </nav>

          {/* 3. Right Action Buttons */}
          <div className="flex items-center gap-3">

            {/* 🔥 KEY REQUIREMENT: Admin Dashboard Button (Only visible when isAdmin is true) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* Cart Icon with Live Badge */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-indigo-600 rounded-full hover:bg-gray-100 transition"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 border-l pl-3 border-gray-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                >
                  Register
                </Link>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
```

---

### 5.6 Customer Storefront Pages

#### Product Catalog / Home Page (`HomePage.jsx`)

Create `src/pages/storefront/HomePage.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useCart } from '../../context/CartContext';
import { Search, ShoppingCart, Tag, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        axiosClient.get('/products'),
        axiosClient.get('/categories'),
      ]);
      setProducts(prodRes.data?.product || []);
      setCategories(catRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.product_id, 1);
      setAddedId(product.product_id);
      setTimeout(() => setAddedId(null), 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || String(p.cate_id) === String(selectedCategory);
    const matchesSearch =
      (p.pro_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-8 sm:p-12 mb-8 shadow-lg">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome to KhmerStore
          </h1>
          <p className="text-indigo-100 text-base sm:text-lg mb-6">
            Discover premium laptops, smartphones, and accessories with instant checkout and rapid delivery.
          </p>
          {/* Search Box */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Products
        </button>
        {categories.map((c) => (
          <button
            key={c.cate_id}
            onClick={() => setSelectedCategory(c.cate_id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              String(selectedCategory) === String(c.cate_id)
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {c.cate_name || c.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading catalog...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <p className="text-gray-500 text-lg">No products found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.product_id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.pro_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Tag className="w-12 h-12 text-gray-300" />
                )}
                {p.qty <= 0 && (
                  <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    Out of Stock
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                    {p.pro_name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {p.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">Price</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ${parseFloat(p.price).toFixed(2)}
                    </span>
                  </div>
                  <button
                    disabled={p.qty <= 0}
                    onClick={() => handleAddToCart(p)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                      addedId === p.product_id
                        ? 'bg-emerald-600 text-white'
                        : p.qty > 0
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {addedId === p.product_id ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Buy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

#### Shopping Cart Page (`CartPage.jsx`)

Create `src/pages/storefront/CartPage.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();

  const items = cart?.cart_items || [];
  const subtotal = parseFloat(cart?.subtotal || 0);
  const shipping = subtotal > 0 ? 15.0 : 0.0;
  const total = subtotal + shipping;

  if (loading) {
    return <div className="text-center py-20">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.cart_item_id}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <img
                src={item.product?.image || 'https://via.placeholder.com/80'}
                alt={item.product?.pro_name || item.product?.product_name}
                className="w-20 h-20 object-cover rounded-lg bg-gray-100"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.product?.pro_name || item.product?.product_name}
                </h3>
                <p className="text-sm text-indigo-600 font-bold">
                  ${parseFloat(item.product?.price || 0).toFixed(2)}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-semibold text-gray-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                  className="p-1.5 text-gray-500 hover:text-gray-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-900">
                  ${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(item.cart_item_id)}
                  className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 justify-end"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-base text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

#### Checkout Page (`CheckoutPage.jsx`)

Create `src/pages/storefront/CheckoutPage.jsx`:

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useCart } from '../../context/CartContext';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = parseFloat(cart?.subtotal || 0);
  const shippingFee = 15.0;
  const discount = 0.0;
  const total = subtotal + shippingFee - discount;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Option A: Checkout from Cart via Backend /add-order
      const orderRes = await axiosClient.post('/add-order', {
        shipping_fee: shippingFee,
        discount: discount,
        payment_method: paymentMethod,
      });

      const order = orderRes.data.order;

      // Automatically submit payment for credit_card if selected
      if (paymentMethod === 'credit_card') {
        await axiosClient.post('/add-payment', {
          order_id: order.order_id,
          payment_method: 'credit_card',
          amount: total,
        });
      }

      await fetchCart(); // Clears frontend cart badge
      navigate('/orders?success=1');
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Payment and Delivery Options */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Select Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { id: 'credit_card', label: 'Credit Card / Visa / MasterCard' },
                { id: 'cash', label: 'Cash on Delivery (COD)' },
                { id: 'aba_pay', label: 'ABA Pay / KHQR' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition ${
                    paymentMethod === m.id
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-800">{m.label}</span>
                  </div>
                  {paymentMethod === m.id && (
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Total Cost Column */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">Order Total</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>${shippingFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-base text-gray-900">
              <span>Final Total</span>
              <span className="text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
          </button>
        </div>

      </form>
    </div>
  );
}
```

---

#### Customer Orders History (`OrdersPage.jsx`)

Create `src/pages/storefront/OrdersPage.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/orders');
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      await axiosClient.post(`/update-order/${orderId}`, { status: 'cancelled' });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><Clock className="w-3.5 h-3.5" /> Processing</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><AlertCircle className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Package className="w-7 h-7 text-indigo-600" /> My Orders
      </h1>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between border-b pb-4 mb-4 gap-2">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Order ID</span>
                  <span className="font-bold text-gray-900">#{order.order_id}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Date</span>
                  <span className="text-sm text-gray-700">{order.order_date ? new Date(order.order_date).toLocaleDateString() : 'Recent'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Total</span>
                  <span className="text-base font-bold text-indigo-600">${parseFloat(order.total).toFixed(2)}</span>
                </div>
                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.order_item_id} className="flex justify-between text-sm">
                      <span className="text-gray-800">{item.product_name} × {item.quantity}</span>
                      <span className="text-gray-600">${parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cancel Button if order is still pending */}
              {order.status === 'pending' && (
                <div className="pt-3 border-t flex justify-end">
                  <button
                    onClick={() => handleCancelOrder(order.order_id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 transition"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

#### Authentication Pages (`LoginPage.jsx` & `RegisterPage.jsx`)

Create `src/pages/storefront/LoginPage.jsx`:

```jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      // If admin logs in, redirect straight to dashboard or original target
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="text-center mb-6">
          <ShoppingBag className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
          <p className="text-sm text-gray-500">Access your store account or admin portal</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
```

Create `src/pages/storefront/RegisterPage.jsx`:

```jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, ShoppingBag } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      // Automatically log in after registration
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="text-center mb-6">
          <ShoppingBag className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-sm text-gray-500">Sign up to purchase and track your orders</p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password (min 8 chars)</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

### 5.7 Admin Dashboard Pages

#### Admin Layout & Sidebar (`AdminLayout.jsx`)

Create `src/layouts/AdminLayout.jsx`:

```jsx
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  ShoppingCart,
  DollarSign,
  Users,
  ArrowLeft,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Brands', path: '/admin/brands', icon: Award },
    { name: 'Payments', path: '/admin/payments', icon: DollarSign },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Logo / Badge */}
          <div className="flex items-center gap-2 px-2 py-4 mb-4 border-b border-gray-800">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
            <div>
              <div className="font-bold text-white text-base leading-tight">Admin Portal</div>
              <div className="text-xs text-indigo-400">KhmerStore Control</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-gray-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customer Store
          </Link>
          <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-400">
            <span>{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 font-semibold"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
```

---

#### Dashboard Overview Metrics (`DashboardOverview.jsx`)

Create `src/pages/admin/DashboardOverview.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { DollarSign, ShoppingBag, Users, Clock } from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        axiosClient.get('/products'),
        axiosClient.get('/orders'),
      ]);

      const products = prodRes.data?.product || [];
      const orders = orderRes.data?.orders || [];

      const totalRevenue = orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

      const pending = orders.filter((o) => o.status === 'pending').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: pending,
        revenue: totalRevenue,
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-500' },
    { title: 'Total Products', value: stats.totalProducts, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Performance Overview</h1>
      
      {loading ? (
        <div className="py-10 text-gray-500">Calculating store metrics...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} text-white p-3 rounded-xl`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

#### Product Management with Image Upload (`ProductManagement.jsx`)

Create `src/pages/admin/ProductManagement.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Plus, Trash2, Edit2, Image as ImageIcon, X } from 'lucide-react';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    pro_name: '',
    qty: '',
    price: '',
    description: '',
    cate_id: '',
    brand_id: '',
    image: null,
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [pRes, cRes, bRes] = await Promise.all([
        axiosClient.get('/products'),
        axiosClient.get('/categories'),
        axiosClient.get('/brands'),
      ]);
      setProducts(pRes.data?.product || []);
      setCategories(cRes.data?.data || []);
      setBrands(bRes.data?.brand || []);
    } catch (err) {
      console.error('Failed to load product data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      pro_name: '',
      qty: '',
      price: '',
      description: '',
      cate_id: categories[0]?.cate_id || '',
      brand_id: brands[0]?.brand_id || '',
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      pro_name: prod.pro_name,
      qty: prod.qty,
      price: prod.price,
      description: prod.description,
      cate_id: prod.cate_id,
      brand_id: prod.brand_id,
      image: null, // Keep null unless new image is selected
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await axiosClient.delete(`/delete-product/${id}`);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('pro_name', formData.pro_name);
      data.append('qty', formData.qty);
      data.append('price', parseFloat(formData.price).toFixed(2));
      data.append('description', formData.description);
      data.append('cate_id', formData.cate_id);
      data.append('brand_id', formData.brand_id);

      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingProduct) {
        await axiosClient.post(`/update-product/${editingProduct.product_id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        if (!formData.image) {
          alert('Please select a product image');
          return;
        }
        await axiosClient.post('/add-product', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsModalOpen(false);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products Inventory</h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.product_id} className="hover:bg-gray-50/50">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={p.image || 'https://via.placeholder.com/48'}
                    alt={p.pro_name}
                    className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{p.pro_name}</div>
                    <div className="text-xs text-gray-400 line-clamp-1">{p.description}</div>
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-800">${parseFloat(p.price).toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.qty > 5
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {p.qty} in stock
                  </span>
                </td>
                <td className="p-4 text-gray-600">ID: {p.cate_id}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.product_id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.pro_name}
                  onChange={(e) => setFormData({ ...formData, pro_name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Stock (Qty)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={formData.cate_id}
                    onChange={(e) => setFormData({ ...formData, cate_id: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.cate_id} value={c.cate_id}>{c.cate_name || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Brand</label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm"
                  >
                    {brands.map((b) => (
                      <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Product Image (.jpg, .png, .jpeg)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

#### Order Management & Status Updates (`OrderManagement.jsx`)

Create `src/pages/admin/OrderManagement.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/orders');
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axiosClient.post(`/update-order/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Orders Processing</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer ID</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Change Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((o) => (
              <tr key={o.order_id} className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-gray-900">#{o.order_id}</td>
                <td className="p-4 text-gray-600">User ID: {o.user_id}</td>
                <td className="p-4 font-bold text-indigo-600">${parseFloat(o.total).toFixed(2)}</td>
                <td className="p-4">
                  <span className="capitalize px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    {o.status}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateStatus(o.order_id, e.target.value)}
                    className="border rounded-lg p-1.5 text-xs bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled (Restock)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

### 5.8 Main App Routing (`App.jsx`)

Create `src/App.jsx`:

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Navigation & Layouts
import Navbar from './components/common/Navbar';
import AdminLayout from './layouts/AdminLayout';

// Route Protection
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Storefront Pages
import HomePage from './pages/storefront/HomePage';
import CartPage from './pages/storefront/CartPage';
import CheckoutPage from './pages/storefront/CheckoutPage';
import OrdersPage from './pages/storefront/OrdersPage';
import LoginPage from './pages/storefront/LoginPage';
import RegisterPage from './pages/storefront/RegisterPage';

// Admin Dashboard Pages
import DashboardOverview from './pages/admin/DashboardOverview';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';

// Customer Storefront Layout Wrapper
function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} KhmerStore E-Commerce. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* 1. Public & Customer Storefront Routes */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Customer Protected Routes */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 2. Admin Only Routes (Guarded by AdminRoute) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
            </Route>

            {/* 3. Fallback Route */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## 6. Step-by-Step Setup & Run Instructions

### Step 6.1: Start the Laravel Backend
In your terminal, navigate to the backend directory and launch the local server:
```bash
cd /home/pila/Desktop/Backend_Ecommerce/e_commerce
php artisan serve --port=8000
```
Your backend will be live at: `http://127.0.0.1:8000`

### Step 6.2: Create the Frontend Application
Navigate to your desired project directory (such as `/home/pila/Desktop/Backend_Ecommerce/FrontEnd` or `/run/media/pila/data/NodeJS/khmerStore`):

```bash
cd /home/pila/Desktop/Backend_Ecommerce/FrontEnd
npm create vite@latest . -- --template react
```

### Step 6.3: Install Required NPM Dependencies
```bash
npm install axios react-router-dom lucide-react jwt-decode
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 6.4: Configure Tailwind CSS
In `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

In `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 6.5: Configure Environment Variables
Create `.env` in the root of your frontend:
```ini
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Step 6.6: Run the Frontend Dev Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 7. Verification & Role-Testing Checklist

| Test Case | Steps | Expected Result |
| :--- | :--- | :--- |
| **1. Visitor / Guest View** | Open `http://localhost:5173` without logging in. | Products and search bar load properly. `Admin Dashboard` button is **NOT visible**. Only `Login` and `Register` appear. |
| **2. Customer Registration** | Click `Register`, fill out form (e.g., `sokha@example.com`, password `password123`). | Registered successfully, redirected to home page logged in as customer. |
| **3. Customer View & Guard** | In customer account, check navbar. Try manually typing `/admin` in the browser address bar. | `Admin Dashboard` button is **NOT visible**. Navigating to `/admin` immediately kicks back to `/` (Home). |
| **4. Shopping & Checkout** | Click `Buy` on any product → navigate to `/cart` → click `Proceed to Checkout` → select `ABA Pay` or `Credit Card` → place order. | Cart clears, order is stored, order shows under `My Orders` with status `pending`. |
| **5. Order Cancellation** | Under `My Orders`, click `Cancel Order` on the pending order. | Order updates to `cancelled` and product stock is restored in the database. |
| **6. Admin Login** | Logout and log in using an admin account (`role: 'admin'`). | Navbar **immediately displays the purple "Admin Dashboard" button** with a shield icon. |
| **7. Admin Dashboard Access** | Click the `Admin Dashboard` button. | Navigates to `/admin`. Left sidebar renders with Products, Orders, Categories, Brands, and Overview. |
| **8. Admin Product Upload** | Go to `/admin/products`, click `Add Product`, fill details and attach an image file. | Product created with image file stored at `public/images/` and listed in table and storefront. |
| **9. Admin Order Processing** | Go to `/admin/orders`, locate customer order, change status from `pending` to `completed`. | Status updates instantly in MySQL and reflects across customer order history. |
