import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Users, Monitor, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import campusData from '@/data/campus25.json';

type Floor = 'ground' | 'first';

interface Room {
  id: string;
  label: string;
  path: string;
  centroid: { xPct: number; yPct: number };
  side: string;
  description: string;
  floor: string;
}

interface RoomPopoverProps {
  room: Room | null;
  onClose: () => void;
  isOpen: boolean;
}

const RoomPopover: React.FC<RoomPopoverProps> = ({ room, onClose, isOpen }) => {
  if (!room || !isOpen) return null;

  const getCapacity = () => Math.floor(Math.random() * 20) + 30;
  const getStatus = () => Math.random() > 0.3 ? 'Available' : 'In Use';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="absolute top-4 right-4 z-50 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-xl min-w-[280px]"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{room.label}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {room.floor} Floor • {room.side === 'left' ? 'A-Block' : room.side === 'right' ? 'B-Block' : 'Main Block'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-xl transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Capacity</p>
              <p className="text-xs text-muted-foreground">{getCapacity()} students</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getStatus() === 'Available' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className={`w-4 h-4 rounded-full ${getStatus() === 'Available' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground">{getStatus()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Monitor className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Equipment</p>
              <p className="text-xs text-muted-foreground">Projector, Smart Board</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground">Click to navigate • ESC to close</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const Campus25: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [currentFloor, setCurrentFloor] = useState<Floor>('ground');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [highlightRoom, setHighlightRoom] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoomPopover, setShowRoomPopover] = useState(false);

  // Prepare room data for search
  const allRooms: Room[] = [
    ...campusData.floors.ground.rooms.map(r => ({ ...r, floor: 'ground' })),
    ...campusData.floors.first.rooms.map(r => ({ ...r, floor: 'first' }))
  ];

  // Handle URL parameters
  useEffect(() => {
    const roomParam = searchParams.get('room');
    const floorParam = searchParams.get('floor') as Floor;
    
    if (roomParam) {
      setSelectedRoom(roomParam);
      setHighlightRoom(roomParam);
      setShowRoomPopover(true);
    }
    if (floorParam && ['ground', 'first'].includes(floorParam)) {
      setCurrentFloor(floorParam);
    }
  }, [searchParams]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const foundRoom = allRooms.find(room => 
        room.id.toLowerCase().includes(query.toLowerCase()) || 
        room.label.toLowerCase().includes(query.toLowerCase())
      );
      if (foundRoom) {
        setCurrentFloor(foundRoom.floor as Floor);
        setSelectedRoom(foundRoom.id);
        setHighlightRoom(foundRoom.id);
        setShowRoomPopover(true);
        setSearchParams({ room: foundRoom.id, floor: foundRoom.floor });
        
        // Clear highlight after animation
        setTimeout(() => setHighlightRoom(null), 3000);
      }
    }
  };

  // Handle room click from map
  const handleMapRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    setShowRoomPopover(true);
    setSearchParams({ room: roomId, floor: currentFloor });
  };

  // Handle floor change
  const handleFloorChange = (floor: Floor) => {
    setCurrentFloor(floor);
    setSelectedRoom(null);
    setShowRoomPopover(false);
    setHighlightRoom(null);
    setSearchParams({ floor });
  };

  // Close popover
  const handleClosePopover = () => {
    setShowRoomPopover(false);
    setSelectedRoom(null);
    setHighlightRoom(null);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('room');
      return newParams;
    });
  };

  const getCurrentFloorData = () => campusData.floors[currentFloor];
  const getSelectedRoomData = () => selectedRoom ? allRooms.find(r => r.id === selectedRoom) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.02] to-secondary/[0.03] relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{
             backgroundImage: `
               linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px),
               linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px'
           }} 
      />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/campus-map')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Campus Map
              </Button>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">Campus 25</span>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search Classroom (e.g., A012)"
                  className="w-full pl-10 pr-4 py-2.5 bg-background/80 backdrop-blur-sm border border-border/60 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                           text-foreground placeholder:text-muted-foreground transition-all duration-200
                           hover:bg-background/90 shadow-sm"
                />
              </div>
            </div>

            {/* Campus Info */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="hidden sm:block text-right">
                <h1 className="text-lg font-bold">Campus 25</h1>
                <p className="text-xs text-muted-foreground">Interactive Floor Plan</p>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floor Tabs - Mobile First */}
      <div className="container mx-auto px-4 sm:px-6 pt-6">
        <div className="flex justify-center mb-6">
          <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-1 shadow-lg">
            <button
              onClick={() => handleFloorChange('ground')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300
                       ${currentFloor === 'ground' 
                         ? 'bg-primary text-primary-foreground shadow-md' 
                         : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'}`}
            >
              Ground Floor
            </button>
            <button
              onClick={() => handleFloorChange('first')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300
                       ${currentFloor === 'first' 
                         ? 'bg-primary text-primary-foreground shadow-md' 
                         : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'}`}
            >
              First Floor
            </button>
          </div>
        </div>

        {/* Map Container with Scroll */}
        <div className="relative">
          <motion.div
            key={currentFloor}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-auto"
            style={{ height: '70vh' }}
          >
            {/* Scrollable Floor Plan */}
            <div className="min-w-[1400px] min-h-[900px] p-8">
              <svg
                viewBox="0 0 1400 900"
                className="w-full h-full"
                style={{ background: 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--accent)/0.1) 100%)' }}
              >
                {/* Building Structure */}
                <defs>
                  <filter id="softGlow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <linearGradient id="roomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--background))" />
                    <stop offset="100%" stopColor="hsl(var(--accent)/0.3)" />
                  </linearGradient>
                </defs>

                {/* Main Building Outline */}
                <rect
                  x="80" y="50" width="1240" height="800"
                  fill="hsl(var(--background)/0.8)"
                  stroke="hsl(var(--border))"
                  strokeWidth="3"
                  rx="20"
                  className="drop-shadow-lg"
                />

                {/* You Are Here Indicator */}
                <g transform="translate(70, 60)">
                  <circle
                    cx="0" cy="0" r="12"
                    fill="hsl(var(--primary))"
                    className="animate-pulse"
                  />
                  <circle
                    cx="0" cy="0" r="20"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    className="animate-ping"
                  />
                  <text
                    x="25" y="5"
                    className="fill-primary text-sm font-semibold"
                  >
                    You are here
                  </text>
                </g>

                {/* Rooms */}
                {getCurrentFloorData().rooms.map((room) => {
                  const isSelected = selectedRoom === room.id;
                  const isHighlighted = highlightRoom === room.id;
                  
                  return (
                    <g key={room.id} className="cursor-pointer">
                      {/* Room Shape */}
                      <path
                        d={room.path}
                        fill={isSelected || isHighlighted ? 'hsl(var(--primary)/0.2)' : 'url(#roomGradient)'}
                        stroke={isSelected || isHighlighted ? 'hsl(var(--primary))' : 'hsl(var(--border)/0.6)'}
                        strokeWidth={isSelected || isHighlighted ? '3' : '1.5'}
                        className="transition-all duration-300 hover:stroke-primary/70 hover:stroke-2 hover:fill-primary/10"
                        onClick={() => handleMapRoomSelect(room.id)}
                        style={{
                          filter: isSelected || isHighlighted ? 'url(#softGlow)' : 'none'
                        }}
                      />

                      {/* Room Label */}
                      <text
                        x={room.centroid.xPct * 1400}
                        y={room.centroid.yPct * 900}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={`text-sm font-bold pointer-events-none select-none transition-colors duration-300
                                   ${isSelected || isHighlighted ? 'fill-primary' : 'fill-foreground/90'}`}
                        style={{ fontSize: '16px' }}
                      >
                        {room.label}
                      </text>
                    </g>
                  );
                })}

                {/* Search Highlight Ring */}
                <AnimatePresence>
                  {highlightRoom && (
                    <motion.circle
                      cx={getCurrentFloorData().rooms.find(r => r.id === highlightRoom)?.centroid.xPct! * 1400}
                      cy={getCurrentFloorData().rooms.find(r => r.id === highlightRoom)?.centroid.yPct! * 900}
                      r="0"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeOpacity="0.8"
                      initial={{ r: 0, strokeOpacity: 0.8 }}
                      animate={{ 
                        r: [0, 100, 0], 
                        strokeOpacity: [0.8, 0.2, 0] 
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: 2, 
                        ease: "easeOut" 
                      }}
                    />
                  )}
                </AnimatePresence>
              </svg>

              {/* Room Popover */}
              <RoomPopover
                room={getSelectedRoomData()}
                onClose={handleClosePopover}
                isOpen={showRoomPopover}
              />
            </div>
          </motion.div>

          {/* Enhanced Legend */}
          <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-xl">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Legend</h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-background to-accent/30 border border-border/60" />
                <span className="text-muted-foreground">Classroom</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-primary/20 border-2 border-primary" />
                <span className="text-muted-foreground">Selected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground">You are here</span>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="absolute bottom-4 right-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/campus-map')}
              className="bg-background/95 backdrop-blur-md border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campus List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Campus25;