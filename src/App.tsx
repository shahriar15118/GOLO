import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import ChatBot from './components/ui/ChatBot';
import { motion, AnimatePresence } from 'motion/react';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Account = lazy(() => import('./pages/Account'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
import NoticeBanner from './components/NoticeBanner';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
              <NoticeBanner />
              <Navbar />
              <CartDrawer />
              
              <main className="flex-grow">
                <Suspense fallback={<div className="h-screen flex items-center justify-center font-display text-2xl animate-pulse">GOLO</div>}>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:slug" element={<ProductDetail />} />
                      <Route path="/auth/login" element={<Login />} />
                      <Route path="/auth/register" element={<Register />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders/:id" element={<OrderConfirmation />} />
                      <Route path="/account/*" element={<Account />} />
                      <Route path="/support" element={<SupportPage />} />
                      <Route path="/admin/*" element={<AdminDashboard />} />
                    </Routes>
                  </AnimatePresence>
                </Suspense>
              </main>

              <Footer />
              <ChatBot />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
  );
}
