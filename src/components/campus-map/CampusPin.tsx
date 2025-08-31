import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import { Campus } from '@/data/campuses';

interface CampusPinProps {
  campus: Campus;
  position: { x: number; y: number };
  onClick: () => void;
  isSelected?: boolean;
}

export const CampusPin: React.FC<CampusPinProps> = ({
  campus,
  position,
  onClick,
  isSelected = false
}) => {
  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      whileHover={{ 
        scale: 1.1, 
        y: -4,
        rotateY: 5
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isSelected ? 1.15 : 1,
        y: isSelected ? -6 : 0
      }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        opacity: { delay: campus.id * 0.05 }
      }}
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-kiit-green/20 to-campus-blue/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Pin Container */}
      <div className={`relative glass-card p-3 rounded-2xl border-2 transition-all duration-300 ${
        isSelected 
          ? 'border-kiit-green shadow-lg shadow-kiit-green/25' 
          : 'border-white/30 hover:border-kiit-green/50'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-gradient-to-r ${
            campus.id <= 5 
              ? 'from-kiit-green to-campus-blue'
              : campus.id <= 10
              ? 'from-campus-blue to-campus-purple'
              : campus.id <= 15
              ? 'from-campus-purple to-campus-orange'
              : campus.id <= 20
              ? 'from-campus-orange to-kiit-green'
              : 'from-kiit-green to-campus-blue'
          }`}>
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div className="text-xs font-semibold text-foreground">
            {campus.code}
          </div>
        </div>
        
        {/* Sparkle Effect on Hover */}
        <motion.div
          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100"
          animate={{
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Sparkles className="w-3 h-3 text-yellow-400" />
        </motion.div>
      </div>
      
      {/* Tooltip */}
      <motion.div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none z-10"
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        whileHover={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="glass-card p-3 rounded-lg text-center min-w-48 border border-white/20 backdrop-blur-md">
          <div className="font-semibold text-foreground text-sm mb-1">
            {campus.name}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {campus.quickFacts.specialization}
          </div>
          <div className="text-xs text-kiit-green font-medium">
            Click to explore →
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};