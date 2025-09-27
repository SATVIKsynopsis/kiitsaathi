import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Layers, RotateCcw } from 'lucide-react';

interface Room {
  id: string;
  label: string;
  path: string;
  centroid: { xPct: number; yPct: number };
  side: string;
  description: string;
}

interface FloorData {
  label: string;
  svgViewBox: string;
  rooms: Room[];
}

interface Map3DProps {
  groundFloor: FloorData;
  firstFloor: FloorData;
  selectedRoom: string | null;
  onRoomSelect: (roomId: string) => void;
  highlightRoom: string | null;
}

// CSS-based 3D building visualization component
const Building3D: React.FC<Map3DProps> = ({ 
  groundFloor, 
  firstFloor, 
  selectedRoom, 
  onRoomSelect, 
  highlightRoom 
}) => {
  const [perspective, setPerspective] = useState<'isometric' | 'side' | 'front'>('isometric');
  
  const renderFloor = (floorData: FloorData, floorLevel: number) => {
    const floorId = floorLevel === 0 ? 'ground' : 'first';
    
    return (
      <div 
        key={floorId}
        className={`absolute w-80 h-48 border-2 border-gray-400 bg-gray-100/90 
                   transform transition-all duration-700 ${
          perspective === 'isometric' 
            ? `translate-y-${floorLevel * 12} -translate-x-${floorLevel * 8} rotate-12 skew-x-12`
            : perspective === 'side'
            ? `translate-y-${floorLevel * 24}`
            : 'translate-y-0'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          zIndex: 10 - floorLevel,
        }}
      >
        {/* Floor label */}
        <div className="absolute -top-6 left-2 text-xs font-medium text-gray-600">
          {floorData.label}
        </div>
        
        {/* Rooms grid */}
        <div className="grid grid-cols-8 grid-rows-6 gap-px p-2 h-full">
          {floorData.rooms.map((room, index) => {
            const isSelected = selectedRoom === room.id;
            const isHighlighted = highlightRoom === room.id;
            
            return (
              <div
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                className={`
                  border border-gray-300 cursor-pointer transition-all duration-200
                  flex items-center justify-center text-xs font-medium
                  ${isSelected || isHighlighted 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-white hover:bg-accent hover:text-accent-foreground'
                  }
                  ${isHighlighted ? 'animate-pulse' : ''}
                `}
                title={room.description}
              >
                {room.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      {/* Perspective controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setPerspective('isometric')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                   ${perspective === 'isometric' 
                     ? 'bg-primary text-primary-foreground' 
                     : 'bg-background/90 backdrop-blur-sm border border-border hover:bg-accent'}`}
        >
          <Layers className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPerspective('side')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                   ${perspective === 'side' 
                     ? 'bg-primary text-primary-foreground' 
                     : 'bg-background/90 backdrop-blur-sm border border-border hover:bg-accent'}`}
        >
          <Building className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPerspective('front')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                   ${perspective === 'front' 
                     ? 'bg-primary text-primary-foreground' 
                     : 'bg-background/90 backdrop-blur-sm border border-border hover:bg-accent'}`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Building visualization */}
      <div 
        className="relative"
        style={{ 
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {renderFloor(firstFloor, 1)}
        {renderFloor(groundFloor, 0)}
      </div>

      {/* Info panel */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm 
                    border border-border rounded-lg p-4 text-sm">
        <div className="font-medium mb-2">Campus 25 - 3D View</div>
        <div className="text-muted-foreground space-y-1">
          <div>• Click perspective buttons to change view</div>
          <div>• Click rooms to select and focus</div>
          <div>• Hover for room details</div>
        </div>
      </div>
    </div>
  );
};

const Map3D: React.FC<Map3DProps> = (props) => {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl overflow-hidden">
      <Building3D {...props} />
    </div>
  );
};

export default Map3D;