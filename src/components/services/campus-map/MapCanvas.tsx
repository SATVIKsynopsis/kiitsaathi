import React from 'react';
import { motion } from 'framer-motion';
import { Campus } from '@/data/campuses';
import { CampusPin } from './CampusPin';

interface MapCanvasProps {
  campuses: Campus[];
  onCampusSelect: (campus: Campus) => void;
  selectedCampusId?: number;
}

// Predefined positions for each campus pin in a aesthetic grid layout
const campusPositions: Record<number, { x: number; y: number }> = {
  1: { x: 20, y: 15 },   // Top-left area
  2: { x: 35, y: 12 },   // Top area
  3: { x: 50, y: 18 },   // Top-center
  4: { x: 65, y: 15 },   // Top-right area
  5: { x: 80, y: 20 },   // Top-right
  6: { x: 12, y: 35 },   // Left area
  7: { x: 28, y: 32 },   // Left-center
  8: { x: 45, y: 38 },   // Center
  9: { x: 62, y: 35 },   // Right-center
  10: { x: 78, y: 40 },  // Right area
  11: { x: 88, y: 32 },  // Far right
  12: { x: 18, y: 55 },  // Mid-left
  13: { x: 32, y: 52 },  // Mid-left-center
  14: { x: 48, y: 58 },  // Mid-center
  15: { x: 64, y: 55 },  // Mid-right-center
  16: { x: 80, y: 60 },  // Mid-right
  17: { x: 15, y: 75 },  // Bottom-left
  18: { x: 30, y: 72 },  // Bottom-left-center
  19: { x: 45, y: 78 },  // Bottom-center
  20: { x: 60, y: 75 },  // Bottom-right-center
  21: { x: 75, y: 80 },  // Bottom-right
  22: { x: 25, y: 88 },  // Bottom area
  23: { x: 40, y: 92 },  // Bottom area
  24: { x: 55, y: 88 },  // Bottom area
  25: { x: 70, y: 92 },  // Bottom area
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  campuses,
  onCampusSelect,
  selectedCampusId
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Canvas */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-kiit-green/5 via-campus-blue/5 to-campus-purple/5 rounded-3xl border-2 border-white/20 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative Grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating Background Elements */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 rounded-full bg-gradient-to-r from-kiit-green/10 to-transparent"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-gradient-to-r from-campus-blue/10 to-transparent"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-gradient-to-r from-campus-purple/10 to-transparent"
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        {/* Central Glow Effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-radial from-kiit-green/5 to-transparent"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Campus Title Overlay */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="glass-card px-6 py-3 rounded-2xl border border-white/30 backdrop-blur-md">
          <h3 className="font-bold text-lg text-center text-gradient">
            KIIT University Campus Map
          </h3>
          <p className="text-xs text-center text-muted-foreground mt-1">
            Click on any campus pin to explore
          </p>
        </div>
      </motion.div>

      {/* Campus Pins */}
      <div className="absolute inset-0">
        {campuses.map((campus) => {
          const position = campusPositions[campus.id] || { x: 50, y: 50 };
          return (
            <CampusPin
              key={campus.id}
              campus={campus}
              position={position}
              onClick={() => onCampusSelect(campus)}
              isSelected={selectedCampusId === campus.id}
            />
          );
        })}
      </div>

      {/* Legend */}
      <motion.div
        className="absolute bottom-6 left-6 glass-card p-4 rounded-xl border border-white/20 backdrop-blur-md"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <h4 className="font-semibold text-sm text-foreground mb-2">Campus Types</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-kiit-green to-campus-blue" />
            <span className="text-muted-foreground">Main & Engineering (1-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-campus-blue to-campus-purple" />
            <span className="text-muted-foreground">Professional (6-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-campus-purple to-campus-orange" />
            <span className="text-muted-foreground">Specialized (11-15)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gradient-to-r from-campus-orange to-kiit-green" />
            <span className="text-muted-foreground">Research (16-25)</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="absolute bottom-6 right-6 glass-card p-4 rounded-xl border border-white/20 backdrop-blur-md"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-kiit-green">{campuses.length}</div>
          <div className="text-xs text-muted-foreground">Total Campuses</div>
        </div>
      </motion.div>
    </div>
  );
};