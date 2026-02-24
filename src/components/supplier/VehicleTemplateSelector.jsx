import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VehicleTemplateSelector({ 
  vehicles = [], 
  defaultMake = '', 
  defaultModel = '', 
  defaultVariant = '', 
  defaultYearFrom = '', 
  defaultYearTo = '' 
}) {
  const [selectedMake, setSelectedMake] = useState(defaultMake);
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [variant, setVariant] = useState(defaultVariant);
  const [yearFrom, setYearFrom] = useState(defaultYearFrom);
  const [yearTo, setYearTo] = useState(defaultYearTo);

  useEffect(() => {
    setSelectedMake(defaultMake);
    setSelectedModel(defaultModel);
    setVariant(defaultVariant);
    setYearFrom(defaultYearFrom);
    setYearTo(defaultYearTo);
  }, [defaultMake, defaultModel, defaultVariant, defaultYearFrom, defaultYearTo]);

  const uniqueMakes = [...new Set(vehicles.map(v => v.make))].sort();
  const uniqueModels = selectedMake 
    ? [...new Set(vehicles.filter(v => v.make === selectedMake).map(v => v.model))].sort()
    : [];

  const handleMakeChange = (value) => {
    setSelectedMake(value);
    setSelectedModel('');
    setVariant('');
    setYearFrom('');
    setYearTo('');
  };

  const handleModelChange = (value) => {
    setSelectedModel(value);
    
    const vehicle = vehicles.find(
      v => v.make === selectedMake && v.model === value
    );
    
    if (vehicle) {
      setVariant(vehicle.variant || '');
      setYearFrom(vehicle.year_start || '');
      setYearTo(vehicle.year_end || '');
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="vehicle_make">Vehicle Make</Label>
          <Select 
            value={selectedMake} 
            onValueChange={handleMakeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              {uniqueMakes.map(make => (
                <SelectItem key={make} value={make}>{make}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="vehicle_make" value={selectedMake} />
        </div>

        <div>
          <Label htmlFor="vehicle_model">Vehicle Model</Label>
          <Select 
            value={selectedModel} 
            onValueChange={handleModelChange}
            disabled={!selectedMake}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {uniqueModels.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="vehicle_model" value={selectedModel} />
        </div>

        <div>
          <Label htmlFor="vehicle_variant">Variant</Label>
          <Input
            id="vehicle_variant"
            name="vehicle_variant"
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            placeholder="e.g., SE"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year_from">Year From</Label>
          <Input
            id="year_from"
            name="year_from"
            type="number"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            placeholder="2015"
          />
        </div>
        <div>
          <Label htmlFor="year_to">Year To</Label>
          <Input
            id="year_to"
            name="year_to"
            type="number"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            placeholder="2020"
          />
        </div>
      </div>
    </>
  );
}