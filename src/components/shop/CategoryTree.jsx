import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryTree = [
  {
    id: 'engine',
    name: 'Engine & Drivetrain',
    icon: '🔧',
    children: [
      { id: 'engine-block', name: 'Engine Block & Components' },
      { id: 'pistons', name: 'Pistons & Rings' },
      { id: 'timing', name: 'Timing Chain & Belt' },
      { id: 'oil-pump', name: 'Oil Pump & System' },
      { id: 'crankshaft', name: 'Crankshaft & Bearings' },
      { id: 'camshaft', name: 'Camshaft & Lifters' },
    ]
  },
  {
    id: 'transmission',
    name: 'Transmission',
    icon: '⚙️',
    children: [
      { id: 'gearbox', name: 'Gearbox & Assembly' },
      { id: 'clutch', name: 'Clutch & Flywheel' },
      { id: 'torque-converter', name: 'Torque Converter' },
      { id: 'shift-linkage', name: 'Shift Linkage & Cables' },
    ]
  },
  {
    id: 'suspension',
    name: 'Suspension',
    icon: '🔩',
    children: [
      { id: 'shocks', name: 'Shocks & Struts' },
      { id: 'springs', name: 'Coil Springs' },
      { id: 'control-arms', name: 'Control Arms' },
      { id: 'ball-joints', name: 'Ball Joints & Tie Rods' },
      { id: 'bushings', name: 'Bushings & Mounts' },
    ]
  },
  {
    id: 'brakes',
    name: 'Brakes',
    icon: '🛑',
    children: [
      { id: 'brake-pads', name: 'Brake Pads & Shoes' },
      { id: 'rotors', name: 'Rotors & Drums' },
      { id: 'calipers', name: 'Brake Calipers' },
      { id: 'brake-lines', name: 'Brake Lines & Hoses' },
      { id: 'master-cylinder', name: 'Master Cylinder' },
    ]
  },
  {
    id: 'exterior',
    name: 'Body & Exterior',
    icon: '🚗',
    children: [
      { id: 'bumpers', name: 'Bumpers' },
      { id: 'fenders', name: 'Fenders & Quarter Panels' },
      { id: 'doors', name: 'Doors & Handles' },
      { id: 'mirrors', name: 'Mirrors' },
      { id: 'hood', name: 'Hood & Trunk' },
      { id: 'lights', name: 'Headlights & Taillights' },
      { id: 'grille', name: 'Grille' },
    ]
  },
  {
    id: 'interior',
    name: 'Interior',
    icon: '💺',
    children: [
      { id: 'seats', name: 'Seats' },
      { id: 'dashboard', name: 'Dashboard & Trim' },
      { id: 'steering', name: 'Steering Wheel & Column' },
      { id: 'console', name: 'Center Console' },
      { id: 'carpet', name: 'Carpet & Floor Mats' },
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    children: [
      { id: 'alternator', name: 'Alternator' },
      { id: 'starter', name: 'Starter Motor' },
      { id: 'battery', name: 'Battery & Cables' },
      { id: 'sensors', name: 'Sensors' },
      { id: 'ecu', name: 'ECU & Modules' },
      { id: 'wiring', name: 'Wiring Harness' },
    ]
  },
  {
    id: 'cooling',
    name: 'Cooling System',
    icon: '❄️',
    children: [
      { id: 'radiator', name: 'Radiator' },
      { id: 'water-pump', name: 'Water Pump' },
      { id: 'thermostat', name: 'Thermostat' },
      { id: 'coolant-hoses', name: 'Coolant Hoses' },
      { id: 'fan', name: 'Cooling Fan' },
    ]
  },
  {
    id: 'exhaust',
    name: 'Exhaust',
    icon: '💨',
    children: [
      { id: 'manifold', name: 'Exhaust Manifold' },
      { id: 'catalytic', name: 'Catalytic Converter' },
      { id: 'muffler', name: 'Muffler' },
      { id: 'exhaust-pipes', name: 'Exhaust Pipes' },
    ]
  },
  {
    id: 'fuel',
    name: 'Fuel System',
    icon: '⛽',
    children: [
      { id: 'fuel-pump', name: 'Fuel Pump' },
      { id: 'fuel-injectors', name: 'Fuel Injectors' },
      { id: 'fuel-tank', name: 'Fuel Tank' },
      { id: 'fuel-filter', name: 'Fuel Filter' },
    ]
  },
];

function CategoryItem({ category, onSelect, selectedCategory, level = 0 }) {
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategory === category.id;
  
  // Auto-expand if a child is selected; otherwise keep manual toggle state
  const childIsSelected = hasChildren && category.children.some(c => c.id === selectedCategory);
  const [manualExpanded, setManualExpanded] = useState(false);
  const expanded = manualExpanded || childIsSelected;
  
  const handleClick = (e) => {
    e.stopPropagation();
    if (hasChildren) {
      setManualExpanded(prev => !prev);
    }
    onSelect(category.id, category.name);
  };

  return (
    <div>
      <motion.button
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
          isSelected 
            ? 'bg-amber-100 text-amber-800 font-medium' 
            : 'hover:bg-slate-100 text-slate-700'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400" />
          )
        ) : (
          <Package className="w-4 h-4 flex-shrink-0 text-slate-400" />
        )}
        {category.icon && <span className="text-lg">{category.icon}</span>}
        <span className="text-sm flex-1">{category.name}</span>
      </motion.button>
      
      {expanded && hasChildren && (
        <div className="overflow-hidden">
          {category.children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              onSelect={onSelect}
              selectedCategory={selectedCategory}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree({ onSelectCategory, selectedCategory }) {
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.PartCategory.list(),
  });

  const parentCategories = dbCategories.filter(cat => !cat.parent_category_id);
  
  const buildCategoryTree = (parent) => {
    const children = dbCategories.filter(cat => 
      cat.parent_category_id && 
      (cat.parent_category_id === parent.id || 
       cat.parent_category_id === parent.name?.toLowerCase().split(' ')[0])
    );
    
    return {
      id: parent.id,
      name: parent.name,
      icon: parent.icon,
      children: children.map(child => ({
        id: child.id,
        name: child.name,
        icon: child.icon
      }))
    };
  };

  const categories = parentCategories.map(buildCategoryTree);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800">Browse by Category</h3>
      </div>
      <div className="p-2 max-h-[500px] overflow-y-auto">
        {categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
            onSelect={onSelectCategory}
            selectedCategory={selectedCategory}
          />
        ))}
      </div>
    </div>
  );
}

export { categoryTree };