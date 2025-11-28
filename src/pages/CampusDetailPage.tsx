import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Navigation, ExternalLink, FileText, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { campusLocations } from '@/data/campusLocations';

interface CampusLocation {
  id: number;
  name: string;
  fullName: string;
  description: string;
  hasMap: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  mapsUrl: string;
}

interface LocationState {
  state?: {
    campusData?: CampusLocation;
  };
}

const CampusDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation() as unknown as LocationState;
  const [selectedFloor, setSelectedFloor] = useState<'ground' | 'first' | 'second' | 'third'>('ground');

  let campusData = location.state?.campusData;
  if (!campusData && id) {
    campusData = campusLocations.find((c) => String(c.id) === String(id));
  }

  if (!campusData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Campus not found</h1>
          <Button
            onClick={() => navigate('/campus-maps')}
            className="bg-green-600 hover:bg-green-700"
          >
            Back to Campus Maps
          </Button>
        </div>
      </div>
    );
  }

  // Map (zoomed in)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${campusData.coordinates.lng - 0.005},${campusData.coordinates.lat - 0.005},${campusData.coordinates.lng + 0.005},${campusData.coordinates.lat + 0.005}&layer=mapnik&marker=${campusData.coordinates.lat},${campusData.coordinates.lng}`;

  // Supabase PDF URLs
  const floorPdfMap = {
    ground:
      'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/ground-floor-campus-25.pdf#toolbar=0',
    first:
      'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/first-floor-campus-25.pdf#toolbar=0',
    second:
      'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/second-floor-campus-25.pdf#toolbar=0',
    third:
      'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/third-floor-campus-25.pdf#toolbar=0',
  };

  const floorNames = {
    ground: 'Ground Floor',
    first: 'First Floor',
    second: 'Second Floor',
    third: 'Third Floor',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Button
            onClick={() => navigate('/campus-maps')}
            variant="ghost"
            className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back</span>
          </Button>

          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-white">{campusData.fullName}</h1>
            <p className="text-sm text-gray-300">{campusData.address}</p>
          </div>

          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {campusData.id === 25 ? (
          <div className="space-y-8">
            {/* Map + Info Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Card */}
              <div className="lg:col-span-2">
                <div className="bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl overflow-hidden shadow-lg h-80">
                  <iframe
                    title={`${campusData.fullName} Map`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={mapUrl}
                    style={{ border: 0 }}
                  />
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-6 h-80 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{campusData.fullName}</h3>
                </div>

                <p className="text-gray-300 mb-4 text-sm">{campusData.description}</p>

                <div className="text-sm text-gray-400 space-y-3 mb-4">
                  <p>
                    <span className="font-semibold text-gray-200">📍 Coordinates:</span>
                    <br />
                    {campusData.coordinates.lat.toFixed(6)}, {campusData.coordinates.lng.toFixed(6)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-200">📮 Address:</span>
                    <br />
                    {campusData.address}
                  </p>
                </div>

                <Button
                  onClick={() => window.open(campusData.mapsUrl, '_blank')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center justify-center gap-2 font-semibold"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Floor Plans Card */}
            <div className="bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl overflow-hidden shadow-lg">
              <div className="p-6 border-b border-purple-600/50 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-green-400" />
                  <h3 className="text-2xl font-bold text-white">📐 Floor Plans & Layouts</h3>
                </div>
                <p className="text-gray-300 text-sm">Click a floor to view the detailed layout</p>
              </div>

              {/* Floor Selector */}
              <div className="p-6 bg-slate-800/20 border-b border-purple-600/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(['ground', 'first', 'second', 'third'] as const).map((floor) => (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all text-center ${
                        selectedFloor === floor
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50 scale-105'
                          : 'bg-slate-800/50 text-gray-300 border border-purple-600/30 hover:border-green-400 hover:bg-slate-800/70'
                      }`}
                    >
                      {floorNames[floor]}
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  📄 {floorNames[selectedFloor]} Layout
                </h4>
                <div
                  className="w-full bg-slate-900/50 rounded-lg overflow-hidden border border-purple-600/30 shadow-md"
                  style={{ minHeight: '600px' }}
                >
                  <iframe
                    key={selectedFloor}
                    title={`${campusData.fullName} - ${floorNames[selectedFloor]}`}
                    src={floorPdfMap[selectedFloor]}
                    width="100%"
                    height="600"
                    style={{ border: 'none', display: 'block', background: '#1e293b' }}
                  />
                </div>
              </div>
            </div>

            {/* Points of Interest Card */}
            <div className="bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-8 shadow-lg">
              <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                Points of Interest
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-600/20 rounded-lg hover:border-green-400/50 transition-colors">
                  <span className="text-3xl">🍽️</span>
                  <span className="text-gray-200 font-medium">Food Court & Cafeteria</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-600/20 rounded-lg hover:border-green-400/50 transition-colors">
                  <span className="text-3xl">🏠</span>
                  <span className="text-gray-200 font-medium">Girls Hostel</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-600/20 rounded-lg hover:border-green-400/50 transition-colors">
                  <span className="text-3xl">🏘️</span>
                  <span className="text-gray-200 font-medium">Boys Hostel</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-600/20 rounded-lg hover:border-green-400/50 transition-colors">
                  <span className="text-3xl">🏢</span>
                  <span className="text-gray-200 font-medium">Main Administrative Building</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-600/20 rounded-lg hover:border-green-400/50 transition-colors">
                  <span className="text-3xl">🎭</span>
                  <span className="text-gray-200 font-medium">Main Auditorium</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-600/20 rounded-lg hover:border-green-400/50 transition-colors">
                  <span className="text-3xl">🎪</span>
                  <span className="text-gray-200 font-medium">Open Air Theatre</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-600/20 rounded-lg hover:border-green-400/50 transition-colors">
                  <span className="text-3xl">📚</span>
                  <span className="text-gray-200 font-medium">Central Library</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-600/20 rounded-lg hover:border-green-400/50 transition-colors">
                  <span className="text-3xl">⚽</span>
                  <span className="text-gray-200 font-medium">Sports Complex</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-800/30 border border-purple-600/20 rounded-lg hover:border-green-400/50 transition-colors">
                  <span className="text-3xl">🏥</span>
                  <span className="text-gray-200 font-medium">Health Center</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Other Campuses - Same Dark Theme
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl overflow-hidden h-96 shadow-lg">
                <iframe
                  title={`${campusData.fullName} Map`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={mapUrl}
                  style={{ border: 0 }}
                />
              </div>

              <Button
                onClick={() => window.open(campusData.mapsUrl, '_blank')}
                className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
                <ExternalLink className="w-4 h-4" />
              </Button>

              <div className="bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-bold text-white">{campusData.fullName}</h3>
                </div>
                <p className="text-gray-300 mb-4">{campusData.description}</p>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>📍 Coordinates: {campusData.coordinates.lat.toFixed(6)}, {campusData.coordinates.lng.toFixed(6)}</p>
                  <p>📮 Address: {campusData.address}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-6 shadow-lg h-fit">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-400" />
                Points of Interest
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl">🍽️</span>
                  <span className="text-gray-200 font-medium">Food Court</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl">🏠</span>
                  <span className="text-gray-200 font-medium">Girls Hostel</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl">🏘️</span>
                  <span className="text-gray-200 font-medium">Boys Hostel</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl">🏢</span>
                  <span className="text-gray-200 font-medium">Main Building</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl">🎭</span>
                  <span className="text-gray-200 font-medium">Auditorium</span>
                </li>
                <li className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-2xl">🎪</span>
                  <span className="text-gray-200 font-medium">Open Air Theatre</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CampusDetailPage;
