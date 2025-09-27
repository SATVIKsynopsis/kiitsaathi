import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Map as MapIcon, Building, Layers, Search, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from '@/components/campus-map/SearchBar';
import Map2D from '@/components/campus-map/Map2D';
import Map3D from '@/components/campus-map/Map3D';
import RoomTooltip from '@/components/campus-map/RoomTooltip';
import campusData from '@/data/campus25.json';

type ViewMode = '2d' | '3d';
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

const Campus25: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [currentFloor, setCurrentFloor] = useState<Floor>('ground');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [highlightRoom, setHighlightRoom] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Prepare room data for search
  const allRooms: Room[] = [
    ...campusData.floors.ground.rooms.map(r => ({ ...r, floor: 'ground' })),
    ...campusData.floors.first.rooms.map(r => ({ ...r, floor: 'first' }))
  ];

  // Handle URL parameters
  useEffect(() => {
    const roomParam = searchParams.get('room');
    const floorParam = searchParams.get('floor') as Floor;
    const viewParam = searchParams.get('view') as ViewMode;
    
    if (roomParam) {
      setSelectedRoom(roomParam);
      setHighlightRoom(roomParam);
      setShowTooltip(true);
    }
    if (floorParam && ['ground', 'first'].includes(floorParam)) {
      setCurrentFloor(floorParam);
    }
    if (viewParam && ['2d', '3d'].includes(viewParam)) {
      setViewMode(viewParam);
    }
  }, [searchParams]);

  // Handle room selection from search
  const handleRoomSelect = (roomId: string, floor: string) => {
    const floorKey = floor as Floor;
    setCurrentFloor(floorKey);
    setSelectedRoom(roomId);
    setHighlightRoom(roomId);
    setShowTooltip(true);
    
    // Update URL
    setSearchParams({ room: roomId, floor: floorKey, view: viewMode });
    
    // Clear highlight after animation
    setTimeout(() => setHighlightRoom(null), 3000);
  };

  // Handle room click from map
  const handleMapRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    setShowTooltip(true);
    setSearchParams({ room: roomId, floor: currentFloor, view: viewMode });
  };

  // Handle floor change
  const handleFloorChange = (floor: Floor) => {
    setCurrentFloor(floor);
    setSelectedRoom(null);
    setShowTooltip(false);
    setHighlightRoom(null);
    setSearchParams({ floor, view: viewMode });
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSearchParams(prev => ({ ...Object.fromEntries(prev), view: mode }));
  };

  // Close tooltip
  const handleCloseTooltip = () => {
    setShowTooltip(false);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                onClick={() => navigate('/campus-map')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Campus Map
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">Campus 25</span>
            </div>
            
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-secondary">
                <Building className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold">Campus 25</h1>
                <p className="text-sm text-muted-foreground">Interactive Floor Plan</p>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border p-1">
                <button
                  onClick={() => handleViewModeChange('2d')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors
                           ${viewMode === '2d' 
                             ? 'bg-primary text-primary-foreground' 
                             : 'hover:bg-accent'}`}
                >
                  <MapIcon className="w-4 h-4" />
                  <span className="sr-only">2D View</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('3d')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors
                           ${viewMode === '3d' 
                             ? 'bg-primary text-primary-foreground' 
                             : 'hover:bg-accent'}`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="sr-only">3D View</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
          
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search */}
            <div className="bg-background border border-border rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Room
              </h2>
              <SearchBar
                rooms={allRooms}
                onRoomSelect={handleRoomSelect}
                placeholder="Search rooms (A013, B105...)"
              />
            </div>

            {/* Floor Selector */}
            <div className="bg-background border border-border rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">Floor Selection</h2>
              <div className="space-y-2">
                <button
                  onClick={() => handleFloorChange('ground')}
                  className={`w-full p-3 rounded-lg text-left transition-colors
                           ${currentFloor === 'ground' 
                             ? 'bg-primary text-primary-foreground' 
                             : 'bg-accent hover:bg-accent/80'}`}
                >
                  <div className="font-medium">Ground Floor</div>
                  <div className="text-xs opacity-80">Rooms A001-A026, B001-B012</div>
                </button>
                <button
                  onClick={() => handleFloorChange('first')}
                  className={`w-full p-3 rounded-lg text-left transition-colors
                           ${currentFloor === 'first' 
                             ? 'bg-primary text-primary-foreground' 
                             : 'bg-accent hover:bg-accent/80'}`}
                >
                  <div className="font-medium">First Floor</div>
                  <div className="text-xs opacity-80">Rooms A101-A126, B101-B112</div>
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-background border border-border rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">Campus Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>You are here (Main Gate)</span>
                </div>
                <div className="text-muted-foreground">
                  Campus 25 • KIIT University
                </div>
                <div className="text-muted-foreground">
                  Total Rooms: {allRooms.length}
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Press "/" to quickly search • ESC to close
                </div>
                <div className="text-xs text-muted-foreground">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/campus-map')}
                    className="w-full mt-2"
                  >
                    <ArrowLeft className="w-3 h-3 mr-2" />
                    Back to Campus List
                  </Button>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <AnimatePresence>
              {showTooltip && getSelectedRoomData() && (
                <RoomTooltip
                  room={getSelectedRoomData()}
                  floor={currentFloor}
                  onClose={handleCloseTooltip}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {viewMode === '2d' ? (
                <Map2D
                  floorData={getCurrentFloorData()}
                  selectedRoom={selectedRoom}
                  onRoomSelect={handleMapRoomSelect}
                  highlightRoom={highlightRoom}
                />
              ) : (
                <Map3D
                  groundFloor={campusData.floors.ground}
                  firstFloor={campusData.floors.first}
                  selectedRoom={selectedRoom}
                  onRoomSelect={handleMapRoomSelect}
                  highlightRoom={highlightRoom}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="fixed bottom-4 left-4 bg-background/95 backdrop-blur-sm border border-border 
                    rounded-lg p-3 text-xs text-muted-foreground max-w-xs">
        <div className="flex items-center gap-2 mb-1">
          <EyeOff className="w-3 h-3" />
          <span className="font-medium">Privacy Notice</span>
        </div>
        <p>This is a static floor plan. We do not collect location or personal data.</p>
      </div>
    </div>
  );
};

export default Campus25;