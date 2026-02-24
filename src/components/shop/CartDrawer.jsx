import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CartDrawer({ isOpen, onClose, items, onUpdateQuantity, onRemove, total }) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart ({items.length})
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">Your cart is empty</h3>
              <p className="text-sm text-slate-500">Start shopping to add items to your cart</p>
            </div>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.part_id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 p-4 border-b border-slate-100"
                >
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&h=100&fit=crop'}
                    alt={item.part_name}
                    className="w-20 h-20 object-cover rounded-lg bg-slate-100"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-slate-800 line-clamp-2 mb-1">
                      {item.part_name}
                    </h4>
                    {item.vehicle_info && (
                      <p className="text-xs text-slate-500 mb-1">{item.vehicle_info}</p>
                    )}
                    <p className="text-xs text-slate-400 mb-2">
                      Sold by {item.supplier_name}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onUpdateQuantity(item.part_id, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded hover:bg-slate-100"
                        >
                          <Minus className="w-4 h-4 text-slate-600" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.part_id, item.quantity + 1)}
                          className="p-1 rounded hover:bg-slate-100"
                        >
                          <Plus className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => onRemove(item.part_id)}
                        className="p-1 rounded hover:bg-red-50 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      ${item.price?.toLocaleString()} each
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-xl font-bold text-slate-900">${total?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500">Shipping calculated at checkout</p>
            <Link to={createPageUrl('Checkout')} onClick={onClose}>
              <Button className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}