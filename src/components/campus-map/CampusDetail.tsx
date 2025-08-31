import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Calendar, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  ExternalLink,
  Star,
  Users,
  Building,
  Sparkles
} from 'lucide-react';
import { Campus } from '@/data/campuses';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CampusDetailProps {
  campus: Campus | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CampusDetail: React.FC<CampusDetailProps> = ({
  campus,
  isOpen,
  onClose
}) => {
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!campus) return null;

  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - mapPosition.x,
      y: e.clientY - mapPosition.y
    });
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setMapPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMapMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setMapZoom(1);
    setMapPosition({ x: 0, y: 0 });
  };

  const generateMapPlaceholder = () => {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          <linearGradient id={`gradient-${campus.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={campus.id <= 5 ? '#4ade80' : campus.id <= 10 ? '#3b82f6' : campus.id <= 15 ? '#8b5cf6' : campus.id <= 20 ? '#f97316' : '#10b981'} stopOpacity="0.2" />
            <stop offset="100%" stopColor={campus.id <= 5 ? '#06b6d4' : campus.id <= 10 ? '#8b5cf6' : campus.id <= 15 ? '#f97316' : campus.id <= 20 ? '#10b981' : '#3b82f6'} stopOpacity="0.1" />
          </linearGradient>
          <pattern id={`grid-${campus.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        
        {/* Background */}
        <rect width="100%" height="100%" fill={`url(#gradient-${campus.id})`} />
        <rect width="100%" height="100%" fill={`url(#grid-${campus.id})`} />
        
        {/* Main Buildings */}
        <rect x="50" y="80" width="80" height="60" rx="8" fill="currentColor" opacity="0.6" />
        <rect x="150" y="60" width="100" height="80" rx="8" fill="currentColor" opacity="0.5" />
        <rect x="270" y="100" width="70" height="50" rx="8" fill="currentColor" opacity="0.4" />
        
        {/* Pathways */}
        <path d="M 0 150 Q 100 140 200 150 T 400 150" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.4" />
        <path d="M 200 0 L 200 300" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
        
        {/* Green Spaces */}
        <circle cx="100" cy="200" r="30" fill="currentColor" opacity="0.3" />
        <circle cx="320" cy="50" r="25" fill="currentColor" opacity="0.3" />
        
        {/* Campus Code */}
        <text x="200" y="150" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor" opacity="0.8">
          {campus.code}
        </text>
        <text x="200" y="170" textAnchor="middle" fontSize="12" fill="currentColor" opacity="0.6">
          Campus Layout
        </text>
      </svg>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Desktop Side Panel / Mobile Full Screen */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-background/95 backdrop-blur-md border-l border-border shadow-2xl z-50 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <motion.div
                className="flex items-center justify-between p-6 border-b border-border"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3">
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
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{campus.name}</h2>
                    <p className="text-sm text-muted-foreground">{campus.code}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Campus Image/Map */}
                <motion.div
                  className="relative h-64 bg-gradient-to-br from-muted/50 to-background border-b border-border"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    className="absolute inset-4 rounded-lg overflow-hidden cursor-move select-none bg-muted/30 text-muted-foreground"
                    onMouseDown={handleMapMouseDown}
                    onMouseMove={handleMapMouseMove}
                    onMouseUp={handleMapMouseUp}
                    onMouseLeave={() => setIsDragging(false)}
                    style={{
                      transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${mapZoom})`,
                      transition: isDragging ? 'none' : 'transform 0.2s ease'
                    }}
                  >
                    {generateMapPlaceholder()}
                  </div>

                  {/* Map Controls */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={handleZoomIn}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleZoomOut}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleResetView}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Map Instructions */}
                  <div className="absolute top-4 left-4 glass-card px-3 py-2 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      Drag to pan • Use controls to zoom
                    </p>
                  </div>
                </motion.div>

                {/* Campus Details */}
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      {campus.description}
                    </p>
                  </motion.div>

                  {/* Quick Facts */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Quick Facts
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Area</span>
                        <Badge variant="secondary">{campus.quickFacts.area}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Established</span>
                        <Badge variant="secondary">{campus.quickFacts.established}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm text-muted-foreground">Specialization</span>
                        <Badge variant="secondary" className="text-xs">
                          {campus.quickFacts.specialization}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>

                  {/* Key Features */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-500" />
                      Key Features
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {campus.keyFeatures.map((feature, index) => (
                        <motion.div
                          key={feature}
                          className="p-3 rounded-lg bg-muted/30 text-center"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <span className="text-sm font-medium text-foreground">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    className="flex gap-3 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button className="flex-1" disabled>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Campus
                    </Button>
                    <Button variant="outline" disabled>
                      <Users className="w-4 h-4 mr-2" />
                      Virtual Tour
                    </Button>
                  </motion.div>

                  {/* Coming Soon Note */}
                  <motion.div
                    className="p-4 rounded-lg bg-muted/20 border border-dashed border-muted-foreground/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">
                        More interactive features coming soon!
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};