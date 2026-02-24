import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, Grid, List, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CategoryTree from '../components/shop/CategoryTree';
import VehicleSelector from '../components/shop/VehicleSelector';
import PartCard from '../components/shop/PartCard';
import CartDrawer from '../components/shop/CartDrawer';

const conditionOptions = [
  { value: 'all', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'used_excellent', label: 'Used - Excellent' },
  { value: 'used_good', label: 'Used - Good' },
  { value: 'used_fair', label: 'Used - Fair' },
  { value: 'refurbished', label: 'Refurbished' },
];

const sortOptions = [
  { value: '-created_date', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-views', label: 'Most Popular' },
];

export default function Shop() {
  const urlParams = new URLSearchParams(window.location.search);
  
  const [searchTerm, setSearchTerm] = useState(urlParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(urlParams.get('category') || '');
  const [selectedVehicle, setSelectedVehicle] = useState({
    make: urlParams.get('make') || '',
    model: urlParams.get('model') || '',
    variant: '',
    year: ''
  });
  const [condition, setCondition] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('-created_date');
  const [viewMode, setViewMode] = useState('grid');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.PartCategory.list(),
  });

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['parts', searchTerm, selectedCategory, selectedVehicle, condition, sortBy, categories.length],
    enabled: !selectedCategory || categories.length > 0, // wait for categories if filtering by category
    queryFn: async () => {
      const filter = { status: 'active' };
      
      if (selectedVehicle?.make) filter.vehicle_make = selectedVehicle.make;
      if (selectedVehicle?.model) filter.vehicle_model = selectedVehicle.model;
      if (condition !== 'all') filter.condition = condition;
      
      let results = await base44.entities.SparePart.filter(filter, sortBy);
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(p => 
          p.name?.toLowerCase().includes(term) ||
          p.part_number?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term)
        );
      }
      
      if (selectedCategory) {
        // Find parent category: could be a DB id (from sidebar) or a slug like "interior" (from diagram)
        const selectedCat = categories.find(c => c.id === selectedCategory);
        
        // Also try to find it by matching name slug (for diagram slugs)
        // e.g. "engine" matches "Engine & Drivetrain", "exterior" matches "Body & Exterior"
        const slugMatch = !selectedCat
          ? categories.find(c => {
              if (c.parent_category_id) return false;
              const slug = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '');
              const name = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
              return name === slug || name.includes(slug) || slug.includes(name);
            })
          : null;
        
        const resolvedParent = selectedCat || slugMatch;

        if (resolvedParent?.parent_category_id) {
          // It's a subcategory
          results = results.filter(p =>
            p.category_id === resolvedParent.id ||
            (!p.category_id && p.category_name?.toLowerCase() === resolvedParent.name.toLowerCase())
          );
        } else {
          // It's a parent category — collect all valid IDs and names
          const parentId = resolvedParent?.id || selectedCategory;
          const parentNameFull = resolvedParent?.name?.toLowerCase().trim() || selectedCategory.toLowerCase().trim();
          // slug stored in subcategories' parent_category_id field
          const parentSlug = selectedCategory.toLowerCase().trim();

          const subcategoryIds = categories
            .filter(c => {
              if (!c.parent_category_id) return false;
              const pid = c.parent_category_id.toLowerCase().trim();
              return pid === parentSlug || pid === parentId || pid === parentNameFull;
            })
            .map(c => c.id);

          const subcategoryNames = categories
            .filter(c => subcategoryIds.includes(c.id))
            .map(c => c.name.toLowerCase());

          results = results.filter(p => {
            if (p.category_id) {
              return p.category_id === parentId || subcategoryIds.includes(p.category_id);
            } else {
              const cn = p.category_name?.toLowerCase().trim() || '';
              return cn === parentNameFull || subcategoryNames.includes(cn);
            }
          });
        }
      }
      
      results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
      
      return results;
    },
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (part) => {
    const existing = cartItems.find(item => item.part_id === part.id);
    if (existing) {
      setCartItems(cartItems.map(item => 
        item.part_id === part.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        part_id: part.id,
        part_name: part.name,
        part_number: part.part_number,
        supplier_id: part.supplier_id,
        supplier_name: part.supplier_name,
        price: part.price,
        quantity: 1,
        image_url: part.images?.[0],
        vehicle_info: `${part.vehicle_make} ${part.vehicle_model}`
      }]);
    }
    setIsCartOpen(true);
  };

  const updateCartQuantity = (partId, quantity) => {
    setCartItems(cartItems.map(item => 
      item.part_id === partId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (partId) => {
    setCartItems(cartItems.filter(item => item.part_id !== partId));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedVehicle({ make: '', model: '', variant: '', year: '' });
    setCondition('all');
    setPriceRange([0, 10000]);
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory,
    selectedVehicle?.make,
    condition !== 'all',
  ].filter(Boolean).length;

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Vehicle</h3>
        <VehicleSelector 
          onSelect={setSelectedVehicle}
          selectedVehicle={selectedVehicle}
          compact
        />
      </div>
      
      <div>
        <CategoryTree 
          onSelectCategory={(id) => setSelectedCategory(id)}
          selectedCategory={selectedCategory}
        />
      </div>
      
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Condition</h3>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {conditionOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={10000}
          step={100}
          className="mt-4"
        />
      </div>
      
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #fdf3e3, #e2e8f0)' }}>
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search parts, part numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-44 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="hidden md:flex border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden h-12 relative">
                    <Filter className="w-5 h-5" />
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs w-5 h-5 p-0 flex items-center justify-center">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <Badge variant="secondary" className="px-3 py-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedVehicle?.make && (
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedVehicle.make} {selectedVehicle.model}
                  <button onClick={() => setSelectedVehicle({ make: '', model: '', variant: '', year: '' })} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="px-3 py-1">
                  Category: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('')} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {condition !== 'all' && (
                <Badge variant="secondary" className="px-3 py-1">
                  Condition: {condition.replace('_', ' ')}
                  <button onClick={() => setCondition('all')} className="ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-72 flex-shrink-0">
            <FilterSidebar />
          </div>
          
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-slate-600">
                Showing <span className="font-semibold">{parts.length}</span> parts
              </p>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-96 animate-pulse" />
                ))}
              </div>
            ) : parts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No parts found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your filters or search term</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <motion.div 
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
                }
                layout
              >
                <AnimatePresence>
                  {parts.map((part) => (
                    <PartCard
                      key={part.id}
                      part={part}
                      onAddToCart={addToCart}
                      isInCart={cartItems.some(item => item.part_id === part.id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        total={cartTotal}
      />
    </div>
  );
}