import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, Menu, Package
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {

  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    updateCartCount();
    const handleStorage = () => updateCartCount();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateCartCount = () => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      const items = JSON.parse(cart);
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    } else {
      setCartCount(0);
    }
  };

  const hideHeader = currentPageName === 'Checkout' && false;
  const isAdminPage = ['AdminDashboard', 'SupplierDashboard'].includes(currentPageName);

  const navLinks = [
    { label: 'Home', page: 'Home' },
    { label: 'Shop', page: 'Shop' },
    { label: 'Diagnose', page: 'Consulting' },
    { label: 'Sell Parts', page: 'SupplierRegister' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {!hideHeader && (
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-black" />
                </div>
                <span className="font-bold text-xl text-slate-900 hidden sm:block">AutoParts</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                {navLinks.map(link => (
                  <Link 
                    key={link.page}
                    to={createPageUrl(link.page)}
                    className={`text-sm font-medium transition-colors ${
                      currentPageName === link.page 
                        ? 'text-amber-600' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Right side */}
              <div className="flex items-center gap-3">

                {/* Cart */}
                <Link to={createPageUrl('Checkout')} className="relative p-2 hover:bg-slate-100 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-slate-700" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-amber-500 text-black text-xs w-5 h-5 p-0 flex items-center justify-center">
                      {cartCount}
                    </Badge>
                  )}
                </Link>

                {/* Login removed → replaced with empty div (keeps layout same) */}
                <div></div>

                {/* Mobile menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="right" className="w-72">
                    <nav className="flex flex-col gap-4 mt-8">

                      {navLinks.map(link => (
                        <Link
                          key={link.page}
                          to={createPageUrl(link.page)}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`text-lg font-medium py-2 ${
                            currentPageName === link.page 
                              ? 'text-amber-600' 
                              : 'text-slate-700'
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}

                      <hr className="my-2" />

                      {/* Keep dashboards visible (no user check needed now) */}
                      <Link 
                        to={createPageUrl('SupplierDashboard')}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium py-2 text-slate-700"
                      >
                        Supplier Dashboard
                      </Link>

                      <Link 
                        to={createPageUrl('AdminDashboard')}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg font-medium py-2 text-slate-700"
                      >
                        Admin Dashboard
                      </Link>

                    </nav>
                  </SheetContent>
                </Sheet>

              </div>
            </div>
          </div>
        </header>
      )}

      <main>{children}</main>

      {!isAdminPage && (
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* FOOTER UNCHANGED */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-black" />
                  </div>
                  <span className="font-bold text-lg">AutoParts</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Your trusted marketplace for quality auto spare parts.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <Link to={createPageUrl('Home')} className="block text-slate-400 hover:text-white text-sm">Home</Link>
                  <Link to={createPageUrl('Shop')} className="block text-slate-400 hover:text-white text-sm">Shop</Link>
                  <Link to={createPageUrl('SupplierRegister')} className="block text-slate-400 hover:text-white text-sm">Sell Parts</Link>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Categories</h4>
                <div className="space-y-2">
                  <Link to={createPageUrl('Shop') + '?category=engine'} className="block text-slate-400 hover:text-white text-sm">Engine Parts</Link>
                  <Link to={createPageUrl('Shop') + '?category=brakes'} className="block text-slate-400 hover:text-white text-sm">Brakes</Link>
                  <Link to={createPageUrl('Shop') + '?category=exterior'} className="block text-slate-400 hover:text-white text-sm">Body Parts</Link>
                  <Link to={createPageUrl('Shop') + '?category=electrical'} className="block text-slate-400 hover:text-white text-sm">Electrical</Link>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">help@autoparts.com</p>
                  <p className="text-slate-400 text-sm">+1 (555) 123-4567</p>
                </div>
              </div>

            </div>

            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
              © {new Date().getFullYear()} AutoParts. All rights reserved.
            </div>

          </div>
        </footer>
      )}

    </div>
  );
}