import React, { useState } from 'react';
import { ArrowLeft, Search, MapPin, Users, Monitor, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


interface Room {
  id: string;
  label: string;
  type: 'classroom' | 'lab' | 'office' | 'washroom' | 'common' | 'lift' | 'stairs';
  x: number;
  y: number;
  width: number;
  height: number;
  side: 'left' | 'right' | 'top' | 'innerLeft' | 'innerRight' | 'innerTop' | 'center';
}


// Ground Floor Layout - LINE STYLE with connected boxes
const groundFloorRooms: Room[] = [
  // LEFT SIDE (A Block - Outer)
  { id: 'A011', label: 'A011', type: 'classroom', x: 40, y: 140, width: 50, height: 25, side: 'left' },
  { id: 'A009', label: 'A009', type: 'classroom', x: 40, y: 175, width: 50, height: 25, side: 'left' },
  { id: 'A007', label: 'A007', type: 'classroom', x: 40, y: 210, width: 50, height: 25, side: 'left' },
  { id: 'A005', label: 'A005', type: 'classroom', x: 40, y: 245, width: 50, height: 25, side: 'left' },
  { id: 'A003', label: 'A003', type: 'classroom', x: 40, y: 280, width: 50, height: 25, side: 'left' },
  { id: 'A001', label: 'A001', type: 'classroom', x: 40, y: 315, width: 50, height: 25, side: 'left' },
  
  // LEFT SIDE - Facilities
  { id: 'STAIRS_L1', label: 'Stairs', type: 'stairs', x: 40, y: 350, width: 50, height: 20, side: 'left' },
  { id: 'LIFT_L1', label: 'Lift 1', type: 'lift', x: 40, y: 380, width: 50, height: 20, side: 'left' },
  { id: 'WASHROOM_L1', label: 'WR Ladies', type: 'washroom', x: 40, y: 410, width: 50, height: 20, side: 'left' },
  { id: 'WASHROOM_L2', label: 'WR Gents', type: 'washroom', x: 40, y: 440, width: 50, height: 20, side: 'left' },


  // INNER LEFT (A Block - Inner)
  { id: 'A012', label: 'A012', type: 'classroom', x: 130, y: 140, width: 50, height: 25, side: 'innerLeft' },
  { id: 'A010', label: 'A010', type: 'classroom', x: 130, y: 175, width: 50, height: 25, side: 'innerLeft' },
  { id: 'A008', label: 'A008', type: 'classroom', x: 130, y: 210, width: 50, height: 25, side: 'innerLeft' },
  { id: 'A006', label: 'A006', type: 'classroom', x: 130, y: 245, width: 50, height: 25, side: 'innerLeft' },
  { id: 'A004', label: 'A004', type: 'classroom', x: 130, y: 280, width: 50, height: 25, side: 'innerLeft' },
  { id: 'A002', label: 'A002', type: 'classroom', x: 130, y: 315, width: 50, height: 25, side: 'innerLeft' },


  // TOP ROW (A Block - Top Outer)
  { id: 'A013', label: 'A013', type: 'classroom', x: 200, y: 50, width: 50, height: 25, side: 'top' },
  { id: 'A015', label: 'A015', type: 'classroom', x: 260, y: 50, width: 50, height: 25, side: 'top' },
  { id: 'A017', label: 'A017', type: 'classroom', x: 320, y: 50, width: 50, height: 25, side: 'top' },
  { id: 'A019', label: 'A019', type: 'classroom', x: 380, y: 50, width: 50, height: 25, side: 'top' },
  { id: 'A021', label: 'A021', type: 'classroom', x: 440, y: 50, width: 50, height: 25, side: 'top' },
  { id: 'A023', label: 'A023', type: 'classroom', x: 500, y: 50, width: 50, height: 25, side: 'top' },
  { id: 'A025', label: 'A025', type: 'classroom', x: 560, y: 50, width: 50, height: 25, side: 'top' },
  
  // TOP ROW - Facilities
  { id: 'WASHROOM_T1', label: 'WR Ladies', type: 'washroom', x: 630, y: 50, width: 50, height: 25, side: 'top' },
  { id: 'WASHROOM_T2', label: 'WR Gents', type: 'washroom', x: 690, y: 50, width: 50, height: 25, side: 'top' },
  { id: 'WATER_COOLER_T', label: 'Water', type: 'common', x: 750, y: 50, width: 35, height: 25, side: 'top' },
  { id: 'STAIRS_T1', label: 'Stairs', type: 'stairs', x: 795, y: 50, width: 35, height: 25, side: 'top' },
  { id: 'LIFT_T1', label: 'Lift 8', type: 'lift', x: 840, y: 50, width: 35, height: 25, side: 'top' },


  // INNER TOP ROW (A Block - Top Inner)
  { id: 'A014', label: 'A014', type: 'classroom', x: 200, y: 115, width: 50, height: 25, side: 'innerTop' },
  { id: 'A016', label: 'A016', type: 'classroom', x: 260, y: 115, width: 50, height: 25, side: 'innerTop' },
  { id: 'A018', label: 'A018', type: 'classroom', x: 320, y: 115, width: 50, height: 25, side: 'innerTop' },
  { id: 'A020', label: 'A020', type: 'classroom', x: 380, y: 115, width: 50, height: 25, side: 'innerTop' },
  { id: 'A022', label: 'A022', type: 'classroom', x: 440, y: 115, width: 50, height: 25, side: 'innerTop' },
  { id: 'A024', label: 'A024', type: 'classroom', x: 500, y: 115, width: 50, height: 25, side: 'innerTop' },
  { id: 'A026', label: 'A026', type: 'classroom', x: 560, y: 115, width: 50, height: 25, side: 'innerTop' },


  // INNER RIGHT (B Block - Inner)
  { id: 'B011', label: 'B011', type: 'classroom', x: 680, y: 140, width: 50, height: 25, side: 'innerRight' },
  { id: 'B009', label: 'B009', type: 'classroom', x: 680, y: 175, width: 50, height: 25, side: 'innerRight' },
  { id: 'B007', label: 'B007', type: 'classroom', x: 680, y: 210, width: 50, height: 25, side: 'innerRight' },
  { id: 'B005', label: 'B005', type: 'classroom', x: 680, y: 245, width: 50, height: 25, side: 'innerRight' },
  { id: 'B003', label: 'B003', type: 'classroom', x: 680, y: 280, width: 50, height: 25, side: 'innerRight' },
  { id: 'B001', label: 'B001', type: 'classroom', x: 680, y: 315, width: 50, height: 25, side: 'innerRight' },


  // RIGHT SIDE (B Block - Outer)
  { id: 'B012', label: 'B012', type: 'classroom', x: 770, y: 140, width: 50, height: 25, side: 'right' },
  { id: 'B010', label: 'B010', type: 'classroom', x: 770, y: 175, width: 50, height: 25, side: 'right' },
  { id: 'B008', label: 'B008', type: 'classroom', x: 770, y: 210, width: 50, height: 25, side: 'right' },
  { id: 'B006', label: 'B006', type: 'classroom', x: 770, y: 245, width: 50, height: 25, side: 'right' },
  { id: 'B004', label: 'B004', type: 'classroom', x: 770, y: 280, width: 50, height: 25, side: 'right' },
  { id: 'B002', label: 'B002', type: 'classroom', x: 770, y: 315, width: 50, height: 25, side: 'right' },
  
  // RIGHT SIDE - Facilities
  { id: 'STAIRS_R1', label: 'Stairs', type: 'stairs', x: 770, y: 350, width: 50, height: 20, side: 'right' },
  { id: 'LIFT_R1', label: 'Lift 16', type: 'lift', x: 770, y: 380, width: 50, height: 20, side: 'right' },


  // C BLOCK (Right special areas)
  { id: 'CAFETERIA', label: 'Cafeteria', type: 'common', x: 860, y: 200, width: 80, height: 40, side: 'center' },
  { id: 'C012', label: 'C012', type: 'common', x: 860, y: 250, width: 80, height: 30, side: 'center' },
  { id: 'C013', label: 'C013', type: 'common', x: 860, y: 290, width: 80, height: 30, side: 'center' },
  { id: 'DIRECTOR_OFFICE', label: 'Director Office', type: 'office', x: 860, y: 330, width: 80, height: 35, side: 'center' },
  { id: 'OPEN_SEATING', label: 'Open Seating', type: 'common', x: 860, y: 375, width: 80, height: 30, side: 'center' },
  { id: 'STUDENTS_SEATING', label: 'Students Seating', type: 'common', x: 860, y: 415, width: 80, height: 30, side: 'center' },
];


// Function to create floors by changing room numbers
const createFloorRooms = (baseRooms: Room[], floorNumber: number): Room[] => {
  return baseRooms.map(room => {
    if (room.type === 'classroom' || room.type === 'lab' || room.type === 'office') {
      const match = room.label.match(/([AB])(\d{3})/);
      if (match) {
        const newLabel = `${match[1]}${floorNumber}${match[2].substring(1)}`;
        return { ...room, id: newLabel, label: newLabel };
      }
    }
    return { ...room, id: `${room.id}_${floorNumber}F` };
  }).filter(room => {
    if (floorNumber > 0) {
      const excludeItems = ['CAFETERIA', 'DIRECTOR_OFFICE'];
      return !excludeItems.some(ex => room.id.includes(ex));
    }
    return true;
  });
};


const getFloorSpecificRooms = (floorNumber: number): Room[] => {
  switch (floorNumber) {
    case 1:
      return [
        { id: 'C104', label: 'aC104', type: 'classroom', x: 860, y: 200, width: 80, height: 40, side: 'center' },
        { id: 'C105', label: 'C105', type: 'classroom', x: 860, y: 245, width: 80, height: 40, side: 'center' },
        { id: 'CONFERENCE_1F', label: 'Conference Hall', type: 'common', x: 860, y: 290, width: 80, height: 50, side: 'center' },
        { id: 'FACULTY_1F', label: 'Faculty Chambers', type: 'office', x: 860, y: 345, width: 80, height: 70, side: 'center' },
      ];
    case 2:
      return [
        { id: 'C203', label: 'C203', type: 'office', x: 860, y: 200, width: 80, height: 50, side: 'center' },
        { id: 'LT4', label: 'LT4', type: 'common', x: 860, y: 255, width: 80, height: 40, side: 'center' },
        { id: 'LT5', label: 'LT5', type: 'common', x: 860, y: 300, width: 80, height: 40, side: 'center' },
        { id: 'LT6', label: 'LT6', type: 'common', x: 860, y: 345, width: 80, height: 30, side: 'center' },
      ];
    case 3:
      return [
        { id: 'LIBRARY', label: 'Library', type: 'common', x: 860, y: 190, width: 80, height: 50, side: 'center' },
        { id: 'CONFERENCE_3F', label: 'Conference Hall', type: 'common', x: 860, y: 270, width: 80, height: 30, side: 'center' },
        { id: 'FACULTY_3F', label: 'Faculty Chambers', type: 'office', x: 860, y: 325, width: 80, height: 50, side: 'center' },
      ];
    default:
      return [];
  }
};






type FloorType = 'ground' | 'first' | 'second' | 'third';


const floorData = {
  ground: { rooms: [...groundFloorRooms], title: 'Ground Floor' },
  first: { rooms: [...createFloorRooms(groundFloorRooms, 1), ...getFloorSpecificRooms(1)], title: 'First Floor' },
  second: { rooms: [...createFloorRooms(groundFloorRooms, 2), ...getFloorSpecificRooms(2)], title: 'Second Floor' },
  third: { rooms: [...createFloorRooms(groundFloorRooms, 3), ...getFloorSpecificRooms(3)], title: 'Third Floor' },
};


interface Campus25LineStyleProps {
  onBack: () => void;
}


const Campus25LineStyle: React.FC<Campus25LineStyleProps> = ({ onBack }) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFloor, setCurrentFloor] = useState<FloorType>('ground');


  const currentRooms = floorData[currentFloor].rooms;


  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };


  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      let foundRoom: Room | undefined;
      let foundFloor: FloorType | undefined;


      Object.entries(floorData).forEach(([floor, data]) => {
        const room = data.rooms.find(room => 
          room.id.toLowerCase().includes(query.toLowerCase()) ||
          room.label.toLowerCase().includes(query.toLowerCase())
        );
        if (room && !foundRoom) {
          foundRoom = room;
          foundFloor = floor as FloorType;
        }
      });


      if (foundRoom && foundFloor) {
        setCurrentFloor(foundFloor);
        setSelectedRoom(foundRoom);
      }
    }
  };


  const getRoomColor = (room: Room) => {
    if (selectedRoom?.id === room.id) return '#22c55e';
    switch (room.type) {
      case 'classroom': return '#dbeafe';
      case 'lab': return '#e0e7ff';
      case 'office': return '#fde68a';
      case 'common': return '#dcfce7';
      case 'lift': return '#d1d5db';
      case 'washroom': return '#fecaca';
      case 'stairs': return '#f3f4f6';
      default: return '#f9fafb';
    }
  };


  const getRoomStroke = (room: Room) => {
    if (selectedRoom?.id === room.id) return '#16a34a';
    return '#9ca3af';
  };


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campus 25</h1>
              <p className="text-gray-600">School of Agricultural Sciences - {floorData[currentFloor].title}</p>
            </div>
          </div>
          
          {selectedRoom && (
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">{selectedRoom.label}</div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRoom(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>


      <div className="max-w-7xl mx-auto p-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search rooms (e.g., A213, B105)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>


        {/* Floor Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white rounded-lg border shadow-sm">
            <Button 
              variant={currentFloor === 'ground' ? 'default' : 'ghost'} 
              className="rounded-r-none"
              onClick={() => setCurrentFloor('ground')}
            >
              Ground Floor
            </Button>
            <Button 
              variant={currentFloor === 'first' ? 'default' : 'ghost'} 
              className="rounded-none"
              onClick={() => setCurrentFloor('first')}
            >
              First Floor
            </Button>
            <Button 
              variant={currentFloor === 'second' ? 'default' : 'ghost'} 
              className="rounded-none"
              onClick={() => setCurrentFloor('second')}
            >
              Second Floor
            </Button>
            <Button 
              variant={currentFloor === 'third' ? 'default' : 'ghost'} 
              className="rounded-l-none"
              onClick={() => setCurrentFloor('third')}
            >
              Third Floor
            </Button>
          </div>
        </div>


        {/* Main Content */}
        <div className="flex gap-6">
          {/* Floor Plan SVG */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border shadow-sm p-4">
              <svg viewBox="0 0 980 520" className="w-full h-auto">
                {/* Main building outline */}
                <rect x="120" y="90" width="730" height="370" fill="#ffffff" stroke="#1f2937" strokeWidth="3" rx="0" />
                
                {/* Connecting lines from labels to boxes */}
                {currentRooms.map((room) => {
                  if (room.side === 'left') {
                    return <line key={`line-${room.id}`} x1={room.x + room.width} y1={room.y + room.height/2} x2="120" y2={room.y + room.height/2} stroke="#6b7280" strokeWidth="1.5" />;
                  } else if (room.side === 'right') {
                    return <line key={`line-${room.id}`} x1={room.x} y1={room.y + room.height/2} x2="850" y2={room.y + room.height/2} stroke="#6b7280" strokeWidth="1.5" />;
                  } else if (room.side === 'top') {
                    return <line key={`line-${room.id}`} x1={room.x + room.width/2} y1={room.y + room.height} x2={room.x + room.width/2} y2="90" stroke="#6b7280" strokeWidth="1.5" />;
                  }
                  return null;
                })}


                {/* Room boxes */}
                {currentRooms.map((room) => (
                  <g key={room.id}>
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      fill={getRoomColor(room)}
                      stroke={getRoomStroke(room)}
                      strokeWidth={selectedRoom?.id === room.id ? "2" : "1"}
                      rx="3"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleRoomClick(room)}
                    />
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.height / 2 + 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8"
                      fill="#1f2937"
                      fontWeight="600"
                      className="pointer-events-none select-none"
                    >
                      {room.label}
                    </text>
                  </g>
                ))}


                {/* Block labels - MOVED OUTSIDE building area */}
                {/* Block labels - REPOSITIONED to avoid overlapping */}
<text x="160" y="400" textAnchor="middle" fontSize="16" fill="#1f2937" fontWeight="bold">A Block</text>
<text x="700" y="400" textAnchor="middle" fontSize="16" fill="#1f2937" fontWeight="bold">B Block</text>
<text x="900" y="165" textAnchor="middle" fontSize="16" fill="#1f2937" fontWeight="bold">C Block</text>



                {/* You are here marker */}
                {currentFloor === 'ground' && (
                  <g>
                    <circle cx="120" cy="480" r="8" fill="#000000" />
                    <text x="30" y="505" fontSize="12" fill="#000000" fontWeight="bold">You are here</text>
                    <text x="20" y="518" fontSize="9" fill="#6b7280">(Campus 25 Main Gate)</text>
                  </g>
                )}


                {/* Floor title */}
                <text x="485" y="30" textAnchor="middle" fontSize="16" fill="#1f2937" fontWeight="bold">
                  {floorData[currentFloor].title}
                </text>
              </svg>
            </div>


            {/* Legend */}
            <div className="mt-4 bg-white rounded-lg border shadow-sm p-4">
              <h3 className="font-semibold mb-3">Legend</h3>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-gray-400 rounded"></div>
                  <span>Classroom</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-100 border border-gray-400 rounded"></div>
                  <span>Lab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-gray-400 rounded"></div>
                  <span>Office</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-gray-400 rounded"></div>
                  <span>Common</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded"></div>
                  <span>Lift</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-gray-400 rounded"></div>
                  <span>Washroom</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-400 rounded"></div>
                  <span>Stairs</span>
                </div>
              </div>
            </div>
          </div>


          {/* Room Details Panel */}
          {selectedRoom && (
            <div className="w-80 bg-white rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedRoom.label}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRoom(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{floorData[currentFloor].title}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Capacity</span>
                  <span className="ml-auto font-medium">
                    {selectedRoom.type === 'classroom' ? '32 students' :
                     selectedRoom.type === 'lab' ? '25 students' : 'Varies'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Equipment</span>
                  <span className="ml-auto font-medium">Projector, Smart Board</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Campus25LineStyle;
