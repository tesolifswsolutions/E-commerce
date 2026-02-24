import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, CreditCard, Truck, Shield, Check, 
  Trash2, Package, MapPin, User, Phone, Mail,
  Banknote, CheckCircle2, ArrowRight, Tag, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_zip: '',
    payment_method: 'cod',
    notes: ''
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setFormData(prev => ({
            ...prev,
            customer_name: user.full_name || '',
            customer_email: user.email || ''
          }));
        }
      } catch (e) {}
    };
    loadUser();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 500 ? 0 : 25;
  const total = subtotal + shippingCost;

  const removeItem = (partId) => {
    const newCart = cartItems.filter(item => item.part_id !== partId);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setIsLoading(true);
    
    const orderNum = 'ORD-' + Date.now().toString(36).toUpperCase();
    
    const orderData = {
      order_number: orderNum,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      shipping_address: formData.shipping_address,
      shipping_city: formData.shipping_city,
      shipping_zip: formData.shipping_zip,
      items: cartItems,
      subtotal: subtotal,
      shipping_cost: shippingCost,
      total: total,
      payment_method: formData.payment_method,
      notes: formData.notes,
      status: 'pending',
      payment_status: formData.payment_method === 'cod' ? 'pending' : 'pending'
    };
    
    await base44.entities.Order.create(orderData);
    
    for (const item of cartItems) {
      await base44.entities.SparePart.update(item.part_id, { status: 'sold' });
    }
    
    localStorage.removeItem('cart');
    setCartItems([]);
    setOrderNumber(orderNum);
    setOrderPlaced(true);
    setIsLoading(false);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-3xl max-w-lg w-full text-center shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          {/* Top banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 right-8 w-32 h-32 rounded-full bg-white" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-1">Order Confirmed!</h1>
            <p className="text-green-100 text-sm">We've received your order and will process it shortly.</p>
          </div>

          <div className="p-8">
            <div className="bg-gradient-to-r from-slate-50 to-amber-50 rounded-2xl p-5 mb-6 border border-amber-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Order Number</p>
              <p className="text-2xl font-black text-slate-900 tracking-wide">{orderNumber}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8 text-center">
              {[
                { icon: <Package className="w-5 h-5" />, label: 'Processing', color: 'text-amber-500 bg-amber-50' },
                { icon: <Truck className="w-5 h-5" />, label: 'Shipping', color: 'text-blue-500 bg-blue-50' },
                { icon: <Star className="w-5 h-5" />, label: 'Delivered', color: 'text-green-500 bg-green-50' },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.color} ${i === 0 ? 'ring-2 ring-amber-300' : 'opacity-40'}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-medium ${i === 0 ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</span>
                </div>
              ))}
            </div>

            <Link to={createPageUrl('Shop')}>
              <Button className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl gap-2 shadow-lg shadow-amber-200">
                Continue Shopping <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-amber-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Shop')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Shop</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-black" />
              </div>
              <h1 className="text-lg font-bold">Checkout</h1>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span>Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Cart', 'Details', 'Payment', 'Confirm'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= 1 ? 'bg-amber-500 text-black' : 'bg-slate-200 text-slate-400'}`}>
                  {i < 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i <= 1 ? 'text-slate-700' : 'text-slate-400'}`}>{step}</span>
              </div>
              {i < 3 && <div className={`h-px w-8 sm:w-12 ${i < 1 ? 'bg-amber-500' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Add some parts to your cart to continue shopping</p>
            <Link to={createPageUrl('Shop')}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 h-11 rounded-xl gap-2">
                Browse Parts <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-5">

                {/* Contact Info */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 text-amber-600" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Contact Information</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name *</Label>
                      <Input id="name" value={formData.customer_name}
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                        required className="mt-1.5 h-11 rounded-xl" placeholder="John Doe" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email *</Label>
                      <Input id="email" type="email" value={formData.customer_email}
                        onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                        required className="mt-1.5 h-11 rounded-xl" placeholder="john@email.com" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="phone" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone Number *</Label>
                      <Input id="phone" value={formData.customer_phone}
                        onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                        required className="mt-1.5 h-11 rounded-xl" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                </motion.div>
                
                {/* Shipping Address */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Shipping Address</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Street Address *</Label>
                      <Textarea id="address" value={formData.shipping_address}
                        onChange={(e) => setFormData({...formData, shipping_address: e.target.value})}
                        required className="mt-1.5 rounded-xl" rows={2} placeholder="123 Main Street" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">City *</Label>
                        <Input id="city" value={formData.shipping_city}
                          onChange={(e) => setFormData({...formData, shipping_city: e.target.value})}
                          required className="mt-1.5 h-11 rounded-xl" placeholder="New York" />
                      </div>
                      <div>
                        <Label htmlFor="zip" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ZIP Code *</Label>
                        <Input id="zip" value={formData.shipping_zip}
                          onChange={(e) => setFormData({...formData, shipping_zip: e.target.value})}
                          required className="mt-1.5 h-11 rounded-xl" placeholder="10001" />
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Payment Method */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Payment Method</h2>
                  </div>
                  <RadioGroup 
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({...formData, payment_method: value})}
                    className="space-y-3"
                  >
                    <label htmlFor="cod" className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.payment_method === 'cod' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                      <RadioGroupItem value="cod" id="cod" />
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">Cash on Delivery</div>
                        <div className="text-sm text-slate-500">Pay when you receive the item</div>
                      </div>
                      {formData.payment_method === 'cod' && <Check className="w-5 h-5 text-amber-500" />}
                    </label>
                    <label htmlFor="bank" className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.payment_method === 'bank_transfer' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                      <RadioGroupItem value="bank_transfer" id="bank" />
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">Bank Transfer</div>
                        <div className="text-sm text-slate-500">Transfer to our bank account</div>
                      </div>
                      {formData.payment_method === 'bank_transfer' && <Check className="w-5 h-5 text-amber-500" />}
                    </label>
                  </RadioGroup>
                </motion.div>
                
                {/* Notes */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Tag className="w-4 h-4 text-slate-500" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Order Notes <span className="text-slate-400 font-normal text-sm">(Optional)</span></h2>
                  </div>
                  <Textarea id="notes" value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="rounded-xl" rows={3} placeholder="Any special instructions for your order..." />
                </motion.div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 sticky top-24 overflow-hidden">
                  
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-400" /> Order Summary
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
                  </div>

                  <div className="p-5">
                    <div className="space-y-3 mb-5">
                      {cartItems.map((item) => (
                        <div key={item.part_id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                          <img 
                            src={item.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&h=100&fit=crop'}
                            alt={item.part_name}
                            className="w-14 h-14 object-cover rounded-lg bg-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-slate-800 line-clamp-1">{item.part_name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                            <p className="text-sm font-bold text-amber-600 mt-0.5">${(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                          <button type="button" onClick={() => removeItem(item.part_id)}
                            className="text-slate-300 hover:text-red-500 transition-colors self-start mt-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-medium">${subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Shipping</span>
                        <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                          {shippingCost === 0 ? 'FREE' : `$${shippingCost}`}
                        </span>
                      </div>
                      {shippingCost === 0 && (
                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-lg px-2 py-1">
                          <Check className="w-3 h-3" />
                          Free shipping on orders over $500!
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mb-5 pt-2 border-t">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-black text-slate-900">${total.toLocaleString()}</span>
                    </div>
                    
                    <Button 
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-xl shadow-lg shadow-amber-200 gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                      ) : (
                        <>Place Order <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                    
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500" /> Secure</span>
                      <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-500" /> Fast Delivery</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-amber-500" /> Verified</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}