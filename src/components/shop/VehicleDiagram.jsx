import React from 'react';
import { motion } from 'framer-motion';

const carParts = [
  { id: 'engine', name: 'Engine & Drivetrain', x: 15, y: 35, w: 25, h: 30, icon: '🔧' },
  { id: 'transmission', name: 'Transmission', x: 35, y: 45, w: 15, h: 20, icon: '⚙️' },
  { id: 'suspension', name: 'Suspension', x: 5, y: 65, w: 20, h: 15, icon: '🔩' },
  { id: 'brakes', name: 'Brakes', x: 75, y: 65, w: 20, h: 15, icon: '🛑' },
  { id: 'exterior', name: 'Body & Exterior', x: 45, y: 10, w: 30, h: 25, icon: '🚗' },
  { id: 'interior', name: 'Interior', x: 45, y: 35, w: 25, h: 25, icon: '💺' },
  { id: 'electrical', name: 'Electrical', x: 70, y: 25, w: 25, h: 20, icon: '⚡' },
  { id: 'cooling', name: 'Cooling System', x: 5, y: 25, w: 15, h: 15, icon: '❄️' },
  { id: 'exhaust', name: 'Exhaust', x: 55, y: 60, w: 20, h: 15, icon: '💨' },
  { id: 'fuel', name: 'Fuel System', x: 75, y: 45, w: 20, h: 15, icon: '⛽' },
];

export default function VehicleDiagram({ onSelectCategory, selectedCategory }) {
  return (
    <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Car silhouette */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <svg viewBox="0 0 100 50" className="w-3/4 h-auto fill-white">
          <path d="M10,35 Q5,35 5,30 L5,28 Q5,25 10,25 L20,25 L30,15 Q32,13 35,13 L65,13 Q68,13 70,15 L80,25 L90,25 Q95,25 95,28 L95,30 Q95,35 90,35 L85,35 Q85,40 80,40 Q75,40 75,35 L25,35 Q25,40 20,40 Q15,40 15,35 Z" />
        </svg>
      </div>
      
      {/* Clickable zones */}
      {carParts.map((part) => (
        <motion.button
          key={part.id}
          onClick={() => onSelectCategory(part.id, part.name)}
          className={`absolute rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1 ${
            selectedCategory === part.id 
              ? 'bg-amber-500/30 border-amber-400 shadow-lg shadow-amber-500/20' 
              : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40'
          }`}
          style={{
            left: `${part.x}%`,
            top: `${part.y}%`,
            width: `${part.w}%`,
            height: `${part.h}%`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-xl md:text-2xl">{part.icon}</span>
          <span className="text-[10px] md:text-xs text-white font-medium text-center px-1 leading-tight">
            {part.name}
          </span>
        </motion.button>
      ))}
      
      {/* Legend */}
      <div className="absolute bottom-3 left-3 text-xs text-slate-400">
        Click a section to browse parts
      </div>
    </div>
  );
}