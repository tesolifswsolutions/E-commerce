import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Check, 
  Truck, Shield, RefreshCw, Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const conditionLabels = {
  new: { label: 'New', color: 'bg-green-100 text-green-800' },
  used_excellent: { label: 'Excellent Condition', color: 'bg-blue-100 text-blue-800' },
  used_good: { label: 'Good Condition', color: 'bg-amber-100 text-amber-800' },
  used_fair: { label: 'Fair Condition', color: 'bg-orange-100 text-orange-800' },
  refurbished: { label: 'Refurbished', color: 'bg-purple-100 text-purple-800' },
};

export default function PartDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const partId = urlParams.get('id');
  
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: part, isLoading } = useQuery({
    queryKey: ['part', partId],
    queryFn: async () => {
      const parts = await base44.entities.SparePart.filter({ id: partId });
      return parts[0];
    },
    enabled: !!partId
  });

  const { data: supplier } = useQuery({
    queryKey: ['supplier', part?.supplier_id],
    queryFn: async () => {
      const suppliers = await base44.entities.Supplier.filter({ id: part.supplier_id });
      return suppliers[0];
    },
    enabled: !!part?.supplier_id
  });

  const { data: relatedParts = [] } = useQuery({
    queryKey: ['related-parts', part?.vehicle_make, part?.vehicle_model],
    queryFn: async () => {
      return base44.entities.SparePart.filter({
        vehicle_make: part.vehicle_make,
        vehicle_model: part.vehicle_model,
        status: 'active'
      }, '-created_date', 4);
    },
    enabled: !!part?.vehicle_make
  });

  const addToCart = () => {
    const savedCart = localStorage.getItem('cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    const existing = cart.find(item => item.part_id === part.id);
    if (existing) {
      cart = cart.map(item => 
        item.part_id === part.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      cart.push({
        part_id: part.id,
        part_name: part.name,
        part_number: part.part_number,
        supplier_id: part.supplier_id,
        supplier_name: part.supplier_name,
        price: part.price,
        quantity: quantity,
        image_url: part.images?.[0],
        vehicle_info: `${part.vehicle_make} ${part.vehicle_model}`
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = createPageUrl('Checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Part Not Found</h2>
          <p className="text-slate-600 mb-6">The part you're looking for doesn't exist or has been removed.</p>
          <Link to={createPageUrl('Shop')}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              Browse Parts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = part.images?.length > 0 
    ? part.images 
    : ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop'];
  
  const condition = conditionLabels[part.condition] || conditionLabels.used_good;
  const discount = part.original_price ? Math.round((1 - part.price / part.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link to={createPageUrl('Home')} className="hover:text-amber-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={createPageUrl('Shop')} className="hover:text-amber-600">Shop</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{part.name}</span>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="relative aspect-[4/3] bg-white rounded-2xl overflow-hidden mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={images[currentImage]}
                  alt={part.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className={`${condition.color} text-sm font-medium`}>
                  {condition.label}
                </Badge>
                {discount > 0 && (
                  <Badge className="bg-red-500 text-white text-sm">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      currentImage === i ? 'border-amber-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <div className="text-sm text-slate-500 mb-2">
              {part.vehicle_make} {part.vehicle_model} {part.vehicle_variant && `• ${part.vehicle_variant}`}
              {part.year_from && ` • ${part.year_from}${part.year_to ? `-${part.year_to}` : '+'}`}
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{part.name}</h1>
            
            {part.part_number && (
              <p className="text-slate-500 mb-4">Part Number: <span className="font-medium">{part.part_number}</span></p>
            )}
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-slate-900">${part.price?.toLocaleString()}</span>
              {part.original_price && (
                <span className="text-xl text-slate-400 line-through">${part.original_price?.toLocaleString()}</span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {part.warranty_days > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <Shield className="w-4 h-4" />
                  {part.warranty_days} Day Warranty
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                <Truck className="w-4 h-4" />
                Fast Shipping
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
                <RefreshCw className="w-4 h-4" />
                Easy Returns
              </div>
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                <Check className="w-4 h-4" />
                {part.quantity > 0 ? `${part.quantity} In Stock` : 'In Stock'}
              </div>
            </div>
            
            <div className="flex gap-4 mb-6">
              <div className="flex items-center border rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-slate-100"
                >
                  -
                </button>
                <span className="px-4 py-3 font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-slate-100"
                >
                  +
                </button>
              </div>
              
              <Button 
                onClick={addToCart}
                className="flex-1 h-14 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-lg"
                disabled={part.status === 'sold'}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {part.status === 'sold' ? 'Sold Out' : 'Add to Cart'}
              </Button>
              
              <Button variant="outline" size="icon" className="h-14 w-14">
                <Heart className="w-5 h-5" />
              </Button>
              
              <Button variant="outline" size="icon" className="h-14 w-14">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
            
            {supplier && (
              <div className="bg-white rounded-xl p-4 border mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                    {supplier.logo_url ? (
                      <img src={supplier.logo_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Store className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{supplier.business_name}</h3>
                    <p className="text-sm text-slate-500">{supplier.city || 'Verified Supplier'}</p>
                  </div>
                  <Link to={createPageUrl('Shop') + `?supplier=${supplier.id}`}>
                    <Button variant="outline" size="sm">View Shop</Button>
                  </Link>
                </div>
              </div>
            )}
            
            <Tabs defaultValue="description" className="mt-8">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="compatibility" className="flex-1">Compatibility</TabsTrigger>
                <TabsTrigger value="shipping" className="flex-1">Shipping</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-4">
                <div className="bg-white rounded-xl p-6 border">
                  <p className="text-slate-600 whitespace-pre-wrap">
                    {part.description || 'No description available for this part.'}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="compatibility" className="mt-4">
                <div className="bg-white rounded-xl p-6 border">
                  <h4 className="font-semibold mb-4">Compatible Vehicles</h4>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                      🚗
                    </div>
                    <div>
                      <p className="font-medium">{part.vehicle_make} {part.vehicle_model}</p>
                      <p className="text-sm text-slate-500">
                        {part.vehicle_variant && `${part.vehicle_variant} • `}
                        {part.year_from && `${part.year_from}${part.year_to ? `-${part.year_to}` : '+'}`}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="shipping" className="mt-4">
                <div className="bg-white rounded-xl p-6 border space-y-4">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-slate-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Shipping</h4>
                      <p className="text-sm text-slate-500">Estimated delivery: 3-5 business days</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-slate-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Returns</h4>
                      <p className="text-sm text-slate-500">30-day return policy for unused parts</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {relatedParts.length > 1 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Parts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedParts.filter(p => p.id !== part.id).slice(0, 4).map((relatedPart) => (
                <Link key={relatedPart.id} to={createPageUrl('PartDetails') + `?id=${relatedPart.id}`}>
                  <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img 
                        src={relatedPart.images?.[0] || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop'} 
                        alt={relatedPart.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-slate-800 line-clamp-2">{relatedPart.name}</h3>
                      <p className="text-lg font-bold text-slate-900 mt-2">${relatedPart.price?.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}