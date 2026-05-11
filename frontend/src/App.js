import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Admin Components & Pages
import AdminRoute from './components/Admin/AdminRoute';
import AdminLayout from './components/Admin/Layout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminPostsList from './pages/Admin/PostsList';
import AdminPostEdit from './pages/Admin/PostEdit';
import AdminMediaGallery from './pages/Admin/MediaGallery';
import AdminHeroManager from './pages/Admin/HeroManager';
import AdminSliderManager from './pages/Admin/SliderManager';
import AdminProductsManager from './pages/Admin/ProductsManager';
import AdminOrdersManager from './pages/Admin/OrdersManager';
import AdminContactMessages from './pages/Admin/ContactMessages';

// Client Components & Pages (Placeholders since they were requested)
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<AdminPostsList />} />
          <Route path="posts/:id" element={<AdminPostEdit />} />
          <Route path="media" element={<AdminMediaGallery />} />
          <Route path="hero" element={<AdminHeroManager />} />
          <Route path="slider" element={<AdminSliderManager />} />
          <Route path="products" element={<AdminProductsManager />} />
          <Route path="orders" element={<AdminOrdersManager />} />
          <Route path="messages" element={<AdminContactMessages />} />
        </Route>
      </Route>

      {/* Client Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
