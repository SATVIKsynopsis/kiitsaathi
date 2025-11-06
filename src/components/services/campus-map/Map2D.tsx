import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Room {
  id: string;
  label: string;
  path: string;
  centroid: { xPct: number; yPct: number };
  side: string;
  description: string;
}

interface POI {
  id: string;
  label: string;
  xPct: number;
  yPct: number;
  description: string;
}

interface FloorData {
  label: string;
  svgViewBox: string;
  rooms: Room[];
  pois?: POI[];
}

interface Map2DProps {
  floorData: FloorData;
  selectedRoom: string | null;
  onRoomSelect: (roomId: string) => void;
  highlightRoom: string | null;
}

const Map2D: React.FC<Map2DProps> = ({ 
  floorData, 
  selectedRoom, 
  onRoomSelect, 
  highlightRoom 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState(floorData.svgViewBox);

  // Focus on room with smooth animation
  const focusRoom = (roomId: string) => {
    const room = floorData.rooms.find(r => r.id === roomId);
    if (!room || !svgRef.current) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const [vbX, vbY, vbWidth, vbHeight] = floorData.svgViewBox.split(' ').map(Number);
    
    // Calculate target position
    const targetX = (room.centroid.xPct * vbWidth) - (vbWidth * 0.3);
    const targetY = (room.centroid.yPct * vbHeight) - (vbHeight * 0.3);
    const targetWidth = vbWidth * 0.6;
    const targetHeight = vbHeight * 0.6;
    
    // Animate viewBox
    const newViewBox = `${Math.max(0, targetX)} ${Math.max(0, targetY)} ${targetWidth} ${targetHeight}`;
    setViewBox(newViewBox);
  };

  // Reset view to show entire floor
  const resetView = () => {
    setViewBox(floorData.svgViewBox);
  };

  // Focus on highlighted room
  useEffect(() => {
    if (highlightRoom) {
      setTimeout(() => focusRoom(highlightRoom), 100);
    }
  }, [highlightRoom]);

  // Handle room click
  const handleRoomClick = (roomId: string) => {
    onRoomSelect(roomId);
    focusRoom(roomId);
  };

  // Handle keyboard navigation
  const handleRoomKeyDown = (e: React.KeyboardEvent, roomId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRoomClick(roomId);
    }
  };

  return (
    <div className="relative w-full h-full bg-background rounded-xl border border-border overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={resetView}
          className="px-3 py-2 bg-background/90 backdrop-blur-sm border border-border 
                   rounded-lg text-sm hover:bg-accent transition-colors"
        >
          Reset View
        </button>
      </div>

      {/* SVG Map */}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full transition-all duration-1000 ease-out"
        style={{ backgroundColor: '#fafafa' }}
      >
        {/* Building Outline */}
        <rect
          x="60"
          y="130"
          width="1080"
          height="640"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="4"
          rx="8"
        />

        {/* Center Logo Area */}
        <circle
          cx="600"
          cy="400"
          r="80"
          fill="hsl(var(--primary))"
          fillOpacity="0.1"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        <text
          x="600"
          y="385"
          textAnchor="middle"
          className="fill-primary text-2xl font-bold"
        >
          KS
        </text>
        <text
          x="600"
          y="415"
          textAnchor="middle"
          className="fill-primary text-sm"
        >
          KIIT Saathi
        </text>

        {/* Rooms */}
        {floorData.rooms.map((room) => {
          const isSelected = selectedRoom === room.id;
          const isHighlighted = highlightRoom === room.id;
          const isHovered = hoveredRoom === room.id;
          
          return (
            <g
              key={room.id}
              role="button"
              tabIndex={0}
              aria-label={`Room ${room.label}`}
              className="cursor-pointer focus:outline-none"
              onClick={() => handleRoomClick(room.id)}
              onKeyDown={(e) => handleRoomKeyDown(e, room.id)}
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
            >
              {/* Room Shape */}
              <path
                d={room.path}
                fill={isSelected || isHighlighted ? 'hsl(var(--primary))' : 'white'}
                fillOpacity={isSelected || isHighlighted ? '0.2' : '1'}
                stroke={
                  isSelected || isHighlighted 
                    ? 'hsl(var(--primary))' 
                    : isHovered 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--border))'
                }
                strokeWidth={isSelected || isHighlighted ? '3' : isHovered ? '2' : '1'}
                className="transition-all duration-200"
                style={{
                  filter: isHovered || isSelected || isHighlighted 
                    ? 'drop-shadow(0 4px 8px hsl(var(--primary) / 0.25))' 
                    : 'none'
                }}
              />

              {/* Room Label */}
              <text
                x={room.centroid.xPct * 1200}
                y={room.centroid.yPct * 800}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs font-medium pointer-events-none select-none
                          ${isSelected || isHighlighted ? 'fill-primary' : 'fill-foreground'}`}
              >
                {room.label}
              </text>
            </g>
          );
        })}

        {/* POI Markers */}
        {floorData.pois?.map((poi) => (
          <g key={poi.id}>
            <circle
              cx={poi.xPct * 1200}
              cy={poi.yPct * 800}
              r="8"
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={poi.xPct * 1200}
              y={poi.yPct * 800 + 25}
              textAnchor="middle"
              className="text-xs font-medium fill-foreground"
            >
              {poi.label}
            </text>
          </g>
        ))}

        {/* Highlight Ring Animation */}
        <AnimatePresence>
          {highlightRoom && (
            <motion.circle
              cx={floorData.rooms.find(r => r.id === highlightRoom)?.centroid.xPct! * 1200}
              cy={floorData.rooms.find(r => r.id === highlightRoom)?.centroid.yPct! * 800}
              r="0"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeOpacity="0.8"
              initial={{ r: 0, strokeOpacity: 0.8 }}
              animate={{ 
                r: [0, 60, 0], 
                strokeOpacity: [0.8, 0.4, 0] 
              }}
              exit={{ r: 0, strokeOpacity: 0 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeOut" 
              }}
            />
          )}
        </AnimatePresence>
      </svg>

      {/* Room Info Overlay */}
      <AnimatePresence>
        {hoveredRoom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm 
                     border border-border rounded-lg p-3 shadow-lg max-w-xs"
          >
            <div className="font-medium">
              {floorData.rooms.find(r => r.id === hoveredRoom)?.label}
            </div>
            <div className="text-sm text-muted-foreground">
              {floorData.rooms.find(r => r.id === hoveredRoom)?.description}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Click to focus • {floorData.label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Map2D;