import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Car, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

const popularMakes = [
  { name: 'Toyota', logo: '🚗' },
  { name: 'Honda', logo: '🚙' },
  { name: 'Ford', logo: '🛻' },
  { name: 'BMW', logo: '🏎️' },
  { name: 'Mercedes', logo: '🚘' },
  { name: 'Audi', logo: '🚐' },
  { name: 'Volkswagen', logo: '🚕' },
  { name: 'Nissan', logo: '🚗' },
  { name: 'Hyundai', logo: '🚙' },
  { name: 'Kia', logo: '🚗' },
];

export default function VehicleSelector({ onSelect, selectedVehicle, compact = false }) {
  const [vehicles, setVehicles] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [years, setYears] = useState([]);
  
  const [selectedMake, setSelectedMake] = useState(selectedVehicle?.make || '');
  const [selectedModel, setSelectedModel] = useState(selectedVehicle?.model || '');
  const [selectedVariant, setSelectedVariant] = useState(selectedVehicle?.variant || '');
  const [selectedYear, setSelectedYear] = useState(selectedVehicle?.year || '');

  // Update local state when selectedVehicle prop changes
  useEffect(() => {
    if (selectedVehicle) {
      setSelectedMake(selectedVehicle.make || '');
      setSelectedModel(selectedVehicle.model || '');
      setSelectedVariant(selectedVehicle.variant || '');
      setSelectedYear(selectedVehicle.year || '');
    }
  }, [selectedVehicle]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const data = await base44.entities.Vehicle.list();
    setVehicles(data);
    const uniqueMakes = [...new Set(data.map(v => v.make))].sort();
    setMakes(uniqueMakes);
  };

  useEffect(() => {
    if (selectedMake) {
      const filteredModels = [...new Set(
        vehicles.filter(v => v.make === selectedMake).map(v => v.model)
      )].sort();
      setModels(filteredModels);
      
      // Only clear if the selected values don't match the incoming selectedVehicle
      if (!selectedVehicle?.model || selectedVehicle?.make !== selectedMake) {
        setSelectedModel('');
        setSelectedVariant('');
        setVariants([]);
      }
    }
  }, [selectedMake, vehicles]);

  useEffect(() => {
    if (selectedMake && selectedModel) {
      const filteredVariants = [...new Set(
        vehicles.filter(v => v.make === selectedMake && v.model === selectedModel && v.variant)
          .map(v => v.variant)
      )].sort();
      setVariants(filteredVariants);
      
      // Generate years
      const vehicle = vehicles.find(v => v.make === selectedMake && v.model === selectedModel);
      if (vehicle?.year_start && vehicle?.year_end) {
        const yearList = [];
        for (let y = vehicle.year_end; y >= vehicle.year_start; y--) {
          yearList.push(y.toString());
        }
        setYears(yearList);
      } else {
        const currentYear = new Date().getFullYear();
        const yearList = [];
        for (let y = currentYear; y >= 2000; y--) {
          yearList.push(y.toString());
        }
        setYears(yearList);
      }
    }
  }, [selectedMake, selectedModel, vehicles]);

  const handleSearch = () => {
    if (selectedMake) {
      onSelect({
        make: selectedMake,
        model: selectedModel,
        variant: selectedVariant,
        year: selectedYear
      });
    }
  };

  const handleClear = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedVariant('');
    setSelectedYear('');
    onSelect(null);
  };

  const handleQuickSelect = (make) => {
    setSelectedMake(make);
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={selectedMake} onValueChange={setSelectedMake}>
          <SelectTrigger className="w-36 h-10" id="vehicle-make">
            <SelectValue placeholder="Make">{selectedMake || "Make"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {makes.map(make => (
              <SelectItem key={make} value={make}>{make}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedMake}>
          <SelectTrigger className="w-36 h-10" id="vehicle-model">
            <SelectValue placeholder="Model">{selectedModel || "Model"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {models.map(model => (
              <SelectItem key={model} value={model}>{model}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button onClick={handleSearch} size="sm" className="bg-amber-500 hover:bg-amber-600 text-black h-10">
          <Search className="w-4 h-4" />
        </Button>
        
        {selectedMake && (
          <Button onClick={handleClear} size="sm" variant="ghost" className="h-10">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick select popular makes */}
      <div>
        <p className="text-sm text-slate-500 mb-3 font-medium">Popular Makes</p>
        <div className="flex flex-wrap gap-2">
          {popularMakes.map(make => (
            <motion.button
              key={make.name}
              onClick={() => handleQuickSelect(make.name)}
              className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${
                selectedMake === make.name 
                  ? 'border-amber-500 bg-amber-50 text-amber-700' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{make.logo}</span>
              <span className="text-sm font-medium">{make.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Detailed selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm text-slate-600 mb-2 block font-medium">Make</label>
          <Select value={selectedMake} onValueChange={setSelectedMake}>
            <SelectTrigger className="h-12 bg-white border-slate-200">
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              {makes.map(make => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-slate-600 mb-2 block font-medium">Model</label>
          <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedMake}>
            <SelectTrigger className="h-12 bg-white border-slate-200">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-slate-600 mb-2 block font-medium">Variant</label>
          <Select value={selectedVariant} onValueChange={setSelectedVariant} disabled={!selectedModel || variants.length === 0}>
            <SelectTrigger className="h-12 bg-white border-slate-200">
              <SelectValue placeholder="All variants" />
            </SelectTrigger>
            <SelectContent>
              {variants.map(variant => (
                <SelectItem key={variant} value={variant}>{variant}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-slate-600 mb-2 block font-medium">Year</label>
          <Select value={selectedYear} onValueChange={setSelectedYear} disabled={!selectedModel}>
            <SelectTrigger className="h-12 bg-white border-slate-200">
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button 
          onClick={handleSearch} 
          className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
          disabled={!selectedMake}
        >
          <Search className="w-4 h-4 mr-2" />
          Search Parts
        </Button>
        {selectedMake && (
          <Button onClick={handleClear} variant="outline" className="h-12 px-6">
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}