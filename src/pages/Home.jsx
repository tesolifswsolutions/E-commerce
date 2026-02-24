import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Zap, Shield, Truck, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import VehicleDiagram from '../components/shop/VehicleDiagram';
import VehicleSelector from '../components/shop/VehicleSelector';
import PartCard from '../components/shop/PartCard';

const features = [
  { icon: Shield, title: 'Quality Assured', desc: 'All parts verified by experts', color: 'from-blue-500 to-blue-600' },
  { icon: Truck, title: 'Fast Shipping', desc: 'Delivery within 3-5 days', color: 'from-green-500 to-green-600' },
  { icon: Zap, title: 'Easy Returns', desc: '30-day hassle-free returns', color: 'from-purple-500 to-purple-600' },
  { icon: Star, title: 'Best Prices', desc: 'Competitive market rates', color: 'from-amber-500 to-amber-600' },
];

const popularMakes = [
  { name: 'Toyota', img: 'https://images.unsplash.com/photo-1621993202119-e3f3c1fe23da?w=200&h=120&fit=crop' },
  { name: 'BMW', img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&h=120&fit=crop' },
  { name: 'Mercedes', img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200&h=120&fit=crop' },
  { name: 'Ford', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200&h=120&fit=crop' },
  { name: 'Honda', img: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=200&h=120&fit=crop' },
  { name: 'Audi', img: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=200&h=120&fit=crop' },
];

export default function Home() {

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- login/user logic removed ---

  const { data: featuredParts = [] } = useQuery({
    queryKey: ['featured-parts'],
    queryFn: () => base44.entities.SparePart.filter({ status: 'active' }, '-created_date', 8),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => base44.entities.PartCategory.list(),
  });

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleCategorySelect = (categoryId, categoryName) => {
    const url = createPageUrl('Shop') + '?category=' + categoryId;
    window.location.href = url;
  };

  const goToShop = () => {
    let url = createPageUrl('Shop');
    const params = new URLSearchParams();
    
    if (selectedVehicle?.make) params.set('make', selectedVehicle.make);
    if (selectedVehicle?.model) params.set('model', selectedVehicle.model);
    if (selectedCategory?.id) params.set('category', selectedCategory.id);
    if (searchTerm) params.set('search', searchTerm);

    if (params.toString()) url += '?' + params.toString();
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden min-h-[85vh] flex items-center">
        
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Background Hero Car */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=900&fit=crop&q=80"
            alt="Car"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-950/60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Text */}
            <div>
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>

                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Trusted by 10,000+ car enthusiasts
                </span>

                <h1 className="text-5xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                  Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Perfect Part</span><br />for Your Car
                </h1>

                <p className="text-lg text-slate-300 max-w-lg mb-8 leading-relaxed">
                  Browse thousands of quality spare parts from verified suppliers. Search by vehicle, part number, or explore our interactive diagram.
                </p>

                <div className="flex flex-wrap gap-4 mb-8 text-sm text-slate-400">
                  {['OEM Parts', 'Used Parts', 'Refurbished', 'Fast Shipping'].map(tag => (
                    <span key={tag} className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-amber-400" /> {tag}
                    </span>
                  ))}
                </div>

                {/* --- LOGIN BUTTONS REMOVED (Sign in / Sign up) --- */}

              </motion.div>

              {/* Search Bar */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
                <div className="flex gap-2">
                  
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Search parts or part numbers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-14 pl-12 pr-4 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl text-base focus:bg-white/15"
                      onKeyPress={(e) => e.key === 'Enter' && goToShop()}
                    />
                  </div>

                  <Button 
                    onClick={goToShop} 
                    className="h-14 px-7 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl shadow-lg shadow-amber-500/25"
                  >
                    Search
                  </Button>

                </div>
              </motion.div>
            </div>

            {/* Right Vehicle Diagram */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 to-blue-500/10 rounded-3xl blur-xl" />
                <div className="relative bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-sm">

                  <VehicleDiagram
                    onSelectCategory={handleCategorySelect}
                    selectedCategory={selectedCategory?.id}
                  />

                  {selectedCategory && (
                    <motion.div className="mt-3 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Button 
                        onClick={goToShop} 
                        className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
                      >
                        Browse {selectedCategory.name} <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}

                </div>
              </div>
            </motion.div>

          </div>

          {/* Mobile Vehicle Diagram */}
          <motion.div className="lg:hidden mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <VehicleDiagram onSelectCategory={handleCategorySelect} selectedCategory={selectedCategory?.id} />

            {selectedCategory && (
              <div className="mt-3 flex justify-center">
                <Button 
                  onClick={goToShop} 
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
                >
                  Browse {selectedCategory.name} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

          </motion.div>

        </div>

      </section>

      {/* Features */}
      <section className="py-10 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} 
                viewport={{ once: true }}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{feature.title}</h3>
                  <p className="text-xs text-slate-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Makes */}
      <section className="py-14 bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-black text-white mb-2">Shop by Brand</h2>
            <p className="text-slate-400">Parts for all major vehicle manufacturers</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {popularMakes.map((make, i) => (
              <motion.div 
                key={make.name}
                initial={{ opacity: 0, scale: 0.9 }} 
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07 }} 
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                onClick={() => { setSearchTerm(make.name); window.location.href = createPageUrl('Shop') + '?make=' + make.name; }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group h-28"
              >
                <img 
                  src={make.img} 
                  alt={make.name} 
                  className="w-full h-full object-cover brightness-50 group-hover:brightness-75 group-hover:scale-110 transition-all duration-300" 
                />
                <div className="absolute inset-0 flex items:end justify-center pb-3">
                  <span className="text-white font-bold text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                    {make.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Vehicle Selector */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-amber-50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-3">Find Your Fit</span>
              <h2 className="text-3xl font-black text-slate-900 mb-3">Select Your Vehicle</h2>
              <p className="text-slate-500">Choose your make, model, and year to find perfectly compatible parts</p>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto">
            <VehicleSelector onSelect={handleVehicleSelect} selectedVehicle={selectedVehicle} />
          </div>

        </div>
      </section>

      {/* Featured Parts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide mb-2">Fresh Listings</span>
              <h2 className="text-3xl font-black text-slate-900">Featured Parts</h2>
              <p className="text-slate-500 mt-1">Latest additions from our verified suppliers</p>
            </motion.div>

            <Link to={createPageUrl('Shop')}>
              <Button variant="outline" className="font-semibold rounded-xl border-2 gap-1 hover:bg-amber-50 hover:border-amber-400">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredParts.map((part, i) => (
              <motion.div 
                key={part.id}
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }} 
                viewport={{ once: true }}
              >
                <PartCard part={part} onAddToCart={() => {}} />
              </motion.div>
            ))}
          </div>

          {featuredParts.length === 0 && (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No parts available yet. Check back soon!</p>
            </div>
          )}

        </div>
      </section>

      {/* CTA for Suppliers */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1600&h=600&fit=crop&q=80"
            alt="" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-950/80" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">

            <motion.div className="text-white" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full text-sm font-semibold mb-4">For Suppliers</span>
              <h2 className="text-4xl font-black mb-4">Are you a supplier?</h2>
              <p className="text-slate-300 text-lg max-w-xl">
                Join our marketplace and reach thousands of customers actively looking for quality spare parts.
              </p>
              <div className="flex flex-wrap gap-6 mt-5 text-sm text-slate-400">
                {['Free to join', 'Instant listings', 'Secure payments'].map(p => (
                  <span key={p} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    {p}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <Link to={createPageUrl('SupplierRegister')}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400hover:to-amber-500 text-black font-bold px-10 h-14 rounded-xl shadow-2xl shadow-amber-500/30 gap-2 text-base"
                >
                  Become a Supplier <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </motion.div>

          </div>

        </div>
      </section>

    </div>
  );
}