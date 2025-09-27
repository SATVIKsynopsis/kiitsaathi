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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.02] to-secondary/[0.03] relative overflow-hidden">
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
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
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
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search Classroom (e.g., A012)"
                  className="w-full pl-10 pr-4 py-2.5 bg-background/60 backdrop-blur-sm border border-border/60 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                           text-foreground placeholder:text-muted-foreground transition-all duration-200
                           hover:bg-background/80"
                />
              </div>
            </div>

            {/* Campus Info */}
            <div className="flex items-center gap-3">
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

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-10rem)]">
          
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Floor Selector */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg"
            >
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Floor Selection
              </h2>
              
              {/* Segmented Control */}
              <div className="bg-accent/50 backdrop-blur-sm rounded-xl p-1">
                <button
                  onClick={() => handleFloorChange('ground')}
                  className={`w-full p-3 rounded-lg text-sm font-medium transition-all duration-300
                           ${currentFloor === 'ground' 
                             ? 'bg-background shadow-sm text-foreground border border-border/50' 
                             : 'text-muted-foreground hover:text-foreground hover:bg-background/30'}`}
                >
                  Ground Floor
                  <div className={`text-xs mt-0.5 ${currentFloor === 'ground' ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                    A001-A026, B001-B012
                  </div>
                </button>
                <button
                  onClick={() => handleFloorChange('first')}
                  className={`w-full p-3 rounded-lg text-sm font-medium transition-all duration-300
                           ${currentFloor === 'first' 
                             ? 'bg-background shadow-sm text-foreground border border-border/50' 
                             : 'text-muted-foreground hover:text-foreground hover:bg-background/30'}`}
                >
                  First Floor
                  <div className={`text-xs mt-0.5 ${currentFloor === 'first' ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                    A101-A126, B101-B112
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Quick Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-lg"
            >
              <h2 className="text-base font-semibold mb-4">Campus Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Campus 25</p>
                    <p className="text-xs text-muted-foreground">KIIT University</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="text-center p-2 bg-accent/30 rounded-lg">
                    <p className="text-lg font-bold text-primary">{allRooms.length}</p>
                    <p className="text-xs text-muted-foreground">Total Rooms</p>
                  </div>
                  <div className="text-center p-2 bg-accent/30 rounded-lg">
                    <p className="text-lg font-bold text-primary">2</p>
                    <p className="text-xs text-muted-foreground">Floors</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground pt-3 border-t border-border/30 space-y-1">
                  <p>• Click classrooms for details</p>
                  <p>• Use search to find specific rooms</p>
                  <p>• Switch floors with tabs above</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-4 relative">
            <motion.div
              key={currentFloor}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full bg-background/40 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-xl relative"
            >
              {/* Modern Floor Plan */}
              <svg
                viewBox="0 0 1200 800"
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
                  x="60" y="130" width="1080" height="640"
                  fill="hsl(var(--background)/0.8)"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  rx="16"
                  className="drop-shadow-sm"
                />

                {/* Center Campus Logo */}
                <circle
                  cx="600" cy="400" r="100"
                  fill="url(#roomGradient)"
                  stroke="hsl(var(--primary)/0.3)"
                  strokeWidth="2"
                />
                <text x="600" y="385" textAnchor="middle" className="fill-primary text-3xl font-bold">KS</text>
                <text x="600" y="415" textAnchor="middle" className="fill-primary/80 text-sm font-medium">Campus 25</text>

                {/* Rooms */}
                {getCurrentFloorData().rooms.map((room) => {
                  const isSelected = selectedRoom === room.id;
                  const isHighlighted = highlightRoom === room.id;
                  
                  return (
                    <g key={room.id} className="cursor-pointer">
                      {/* Room Shape */}
                      <path
                        d={room.path}
                        fill={isSelected || isHighlighted ? 'hsl(var(--primary)/0.15)' : 'url(#roomGradient)'}
                        stroke={isSelected || isHighlighted ? 'hsl(var(--primary))' : 'hsl(var(--border)/0.6)'}
                        strokeWidth={isSelected || isHighlighted ? '3' : '1'}
                        className="transition-all duration-300 hover:stroke-primary/60 hover:stroke-2"
                        onClick={() => handleMapRoomSelect(room.id)}
                        style={{
                          filter: isSelected || isHighlighted ? 'filter: url(#softGlow)' : 'none'
                        }}
                      />

                      {/* Room Label */}
                      <text
                        x={room.centroid.xPct * 1200}
                        y={room.centroid.yPct * 800}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={`text-sm font-semibold pointer-events-none select-none transition-colors duration-300
                                   ${isSelected || isHighlighted ? 'fill-primary' : 'fill-foreground/80'}`}
                        style={{ fontSize: '14px' }}
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
                      cx={getCurrentFloorData().rooms.find(r => r.id === highlightRoom)?.centroid.xPct! * 1200}
                      cy={getCurrentFloorData().rooms.find(r => r.id === highlightRoom)?.centroid.yPct! * 800}
                      r="0"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeOpacity="0.8"
                      initial={{ r: 0, strokeOpacity: 0.8 }}
                      animate={{ 
                        r: [0, 80, 0], 
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
            </motion.div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="fixed bottom-6 left-6 bg-background/90 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-background to-accent/30 border border-border/60" />
            <span className="text-muted-foreground">Classroom</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/15 border-2 border-primary" />
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <span className="text-muted-foreground">You are here</span>
          </div>
        </div>
      </div>

      {/* Back to Campus List Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/campus-map')}
          className="bg-background/90 backdrop-blur-md border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campus List
        </Button>
      </div>
    </div>
  );
};
export default Campus25;