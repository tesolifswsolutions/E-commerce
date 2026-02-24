import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Eye, Heart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const conditionLabels = {
  new: { label: 'New', color: 'bg-green-100 text-green-800' },
  used_excellent: { label: 'Excellent', color: 'bg-blue-100 text-blue-800' },
  used_good: { label: 'Good', color: 'bg-amber-100 text-amber-800' },
  used_fair: { label: 'Fair', color: 'bg-orange-100 text-orange-800' },
  refurbished: { label: 'Refurbished', color: 'bg-purple-100 text-purple-800' },
};

export default function PartCard({ part, onAddToCart, isInCart = false }) {
  const condition = conditionLabels[part.condition] || conditionLabels.used_good;
  const mainImage = part.images?.[0] || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop';
  const discount = part.original_price ? Math.round((1 - part.price / part.original_price) * 100) : 0;

  return (
    <motion.div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-xl transition-all duration-300"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Image */}
      <Link to={createPageUrl('PartDetails') + `?id=${part.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img 
            src={mainImage} 
            alt={part.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className={`${condition.color} text-xs font-medium`}>
              {condition.label}
            </Badge>
            {discount > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                -{discount}%
              </Badge>
            )}
          </div>
          
          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white shadow-lg">
              <Heart className="w-4 h-4 text-slate-600" />
            </button>
            <button className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white shadow-lg">
              <Eye className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          
          {part.status === 'sold' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-lg font-bold">SOLD</span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Content */}
      <div className="p-4">
        {/* Vehicle compatibility */}
        <div className="text-xs text-slate-500 mb-1">
          {part.vehicle_make} {part.vehicle_model} {part.vehicle_variant && `• ${part.vehicle_variant}`}
          {part.year_from && ` • ${part.year_from}${part.year_to ? `-${part.year_to}` : '+'}`}
        </div>
        
        <Link to={createPageUrl('PartDetails') + `?id=${part.id}`}>
          <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2 hover:text-amber-600 transition-colors">
            {part.name}
          </h3>
        </Link>
        
        {part.part_number && (
          <p className="text-xs text-slate-400 mb-2">Part #: {part.part_number}</p>
        )}
        
        {/* Supplier */}
        <p className="text-xs text-slate-500 mb-3">
          Sold by <span className="font-medium text-slate-700">{part.supplier_name || 'Supplier'}</span>
        </p>
        
        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-slate-900">${part.price?.toLocaleString()}</span>
          {part.original_price && (
            <span className="text-sm text-slate-400 line-through">${part.original_price?.toLocaleString()}</span>
          )}
        </div>
        
        {/* Warranty */}
        {part.warranty_days > 0 && (
          <p className="text-xs text-green-600 mb-3 flex items-center gap-1">
            <Check className="w-3 h-3" />
            {part.warranty_days} day warranty
          </p>
        )}
        
        {/* Add to cart */}
        <Button 
          onClick={() => onAddToCart(part)}
          disabled={part.status === 'sold' || isInCart}
          className={`w-full ${
            isInCart 
              ? 'bg-green-600 hover:bg-green-600' 
              : 'bg-slate-900 hover:bg-slate-800'
          } text-white`}
        >
          {isInCart ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              In Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}