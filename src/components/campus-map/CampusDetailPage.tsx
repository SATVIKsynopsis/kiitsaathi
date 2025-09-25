import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Coffee, Users, BookOpen, Car, Utensils, Wifi, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CampusLocation {
  id: string;
  name: string;
  type: 'cafeteria' | 'common' | 'academic' | 'facility' | 'transportation';
  description: string;
  floor?: string;
  timing?: string;
  icon: any;
}

const campus1Locations: CampusLocation[] = [
  {
    id: '1',
    name: 'Main Cafeteria',
    type: 'cafeteria',
    description: 'Primary dining facility with variety of food options',
    floor: 'Ground Floor',
    timing: '7:00 AM - 10:00 PM',
    icon: Utensils
  },
  {
    id: '2',
    name: 'CCD Coffee Shop',
    type: 'cafeteria',
    description: 'Coffee, snacks and light refreshments',
    floor: '1st Floor',
    timing: '8:00 AM - 9:00 PM',
    icon: Coffee
  },
  {
    id: '3',
    name: 'Central Library',
    type: 'academic',
    description: 'Main library with extensive collection and study areas',
    floor: '2nd Floor',
    timing: '6:00 AM - 11:00 PM',
    icon: BookOpen
  },
  {
    id: '4',
    name: 'Computer Lab - Block A',
    type: 'academic',
    description: 'High-spec computers for programming and software development',
    floor: '3rd Floor',
    timing: '8:00 AM - 8:00 PM',
    icon: Building
  },
  {
    id: '5',
    name: 'Student Common Area',
    type: 'common',
    description: 'Relaxation space with seating and entertainment facilities',
    floor: 'Ground Floor',
    timing: '24/7',
    icon: Users
  },
  {
    id: '6',
    name: 'Wi-Fi Lounge',
    type: 'facility',
    description: 'High-speed internet access and charging stations',
    floor: '1st Floor',
    timing: '24/7',
    icon: Wifi
  },
  {
    id: '7',
    name: 'Auto Stand',
    type: 'transportation',
    description: 'Auto-rickshaw pickup and drop point',
    floor: 'Outside Campus',
    timing: '6:00 AM - 10:00 PM',
    icon: Car
  }
];

const campus2Locations: CampusLocation[] = [
  {
    id: '1',
    name: 'Food Court',
    type: 'cafeteria',
    description: 'Multiple food vendors and dining options',
    floor: 'Ground Floor',
    timing: '7:30 AM - 9:30 PM',
    icon: Utensils
  },
  {
    id: '2',
    name: 'Juice Bar',
    type: 'cafeteria',
    description: 'Fresh juices, smoothies and healthy snacks',
    floor: 'Ground Floor',
    timing: '9:00 AM - 7:00 PM',
    icon: Coffee
  },
  {
    id: '3',
    name: 'Department Library',
    type: 'academic',
    description: 'Specialized books and research materials',
    floor: '2nd Floor',
    timing: '8:00 AM - 6:00 PM',
    icon: BookOpen
  },
  {
    id: '4',
    name: 'Electronics Lab',
    type: 'academic',
    description: 'Advanced electronics and circuit testing equipment',
    floor: '1st Floor',
    timing: '9:00 AM - 5:00 PM',
    icon: Building
  },
  {
    id: '5',
    name: 'Recreation Center',
    type: 'common',
    description: 'Games, sports equipment and recreational activities',
    floor: 'Ground Floor',
    timing: '6:00 AM - 10:00 PM',
    icon: Users
  },
  {
    id: '6',
    name: 'Study Pods',
    type: 'facility',
    description: 'Individual and group study spaces with power outlets',
    floor: '3rd Floor',
    timing: '24/7',
    icon: Wifi
  },
  {
    id: '7',
    name: 'Bus Stop',
    type: 'transportation',
    description: 'University shuttle and city bus services',
    floor: 'Outside Campus',
    timing: '6:30 AM - 9:00 PM',
    icon: Car
  }
];

const staticMapRooms = {
  1: ['101', '102', '103', '104', '105', '106', '107', '108', '109', '110'],
  2: ['201', '202', '203', '204', '205', '206', '207', '208', '209', '210']
};

const CampusDetailPage: React.FC = () => {
  const { campusId } = useParams<{ campusId: string }>();
  const navigate = useNavigate();

  const campusNumber = parseInt(campusId || '1');
  const locations = campusNumber === 1 ? campus1Locations : campus2Locations;
  const rooms = staticMapRooms[campusNumber as keyof typeof staticMapRooms] || [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cafeteria': return 'bg-orange-100 text-orange-700';
      case 'common': return 'bg-blue-100 text-blue-700';
      case 'academic': return 'bg-green-100 text-green-700';
      case 'facility': return 'bg-purple-100 text-purple-700';
      case 'transportation': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cafeteria': return '🍽️';
      case 'common': return '👥';
      case 'academic': return '📚';
      case 'facility': return '🔧';
      case 'transportation': return '🚗';
      default: return '📍';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <header className="p-6 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/campus-map')}
            className="flex items-center gap-2 text-white hover:text-green-400 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campus Map
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Campus {campusNumber}</h1>
              <p className="text-sm text-white/70">KIIT University</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Static Map View */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Campus {campusNumber} Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white/5 rounded-xl p-6 min-h-[400px]">
                  {/* Static Room Layout */}
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    <div className="col-span-5 text-center text-white font-semibold text-lg mb-4">
                      Ground Floor
                    </div>
                    {rooms.slice(0, 5).map((room) => (
                      <div
                        key={room}
                        className="bg-blue-500/30 border border-blue-400/50 rounded-lg p-3 text-center text-white font-medium"
                      >
                        Room {room}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-5 text-center text-white font-semibold text-lg mb-4">
                      First Floor
                    </div>
                    {rooms.slice(5, 10).map((room) => (
                      <div
                        key={room}
                        className="bg-green-500/30 border border-green-400/50 rounded-lg p-3 text-center text-white font-medium"
                      >
                        Room {room}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500/30 border border-blue-400/50 rounded"></div>
                      <span className="text-white/80 text-sm">Ground Floor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500/30 border border-green-400/50 rounded"></div>
                      <span className="text-white/80 text-sm">First Floor</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Locations Panel */}
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Important Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {locations.map((location) => {
                    const IconComponent = location.icon;
                    return (
                      <div
                        key={location.id}
                        className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20">
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white text-sm">{location.name}</h4>
                              <Badge className={`text-xs ${getTypeColor(location.type)}`}>
                                {getTypeIcon(location.type)} {location.type}
                              </Badge>
                            </div>
                            <p className="text-white/70 text-xs mb-2">{location.description}</p>
                            {location.floor && (
                              <p className="text-white/60 text-xs">📍 {location.floor}</p>
                            )}
                            {location.timing && (
                              <p className="text-white/60 text-xs">🕒 {location.timing}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Campus Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Total Rooms</span>
                    <span className="text-white font-medium">{rooms.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Key Locations</span>
                    <span className="text-white font-medium">{locations.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Cafeterias</span>
                    <span className="text-white font-medium">{locations.filter(l => l.type === 'cafeteria').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Study Areas</span>
                    <span className="text-white font-medium">{locations.filter(l => l.type === 'academic').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusDetailPage;