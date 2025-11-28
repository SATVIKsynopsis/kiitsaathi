import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Navigation, ExternalLink, FileText } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Campus not found</h1>
          <Button onClick={() => navigate('/campus-maps')} className="bg-green-600 hover:bg-green-700">
            Back to Campus Maps
          </Button>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${campusData.coordinates.lng - 0.005},${campusData.coordinates.lat - 0.005},${campusData.coordinates.lng + 0.005},${campusData.coordinates.lat + 0.005}&layer=mapnik&marker=${campusData.coordinates.lat},${campusData.coordinates.lng}`;

 const floorPdfMap = {
  ground: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/ground-floor-campus-25.pdf#toolbar=0',
  first: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/first-floor-campus-25.pdf#toolbar=0',
  second: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/second-floor-campus-25.pdf#toolbar=0',
  third: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/third-floor-campus-25.pdf#toolbar=0',
};


  const floorNames = {
    ground: 'Ground Floor',
    first: 'First Floor',
    second: 'Second Floor',
    third: 'Third Floor',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-lg border-b-4 border-green-600">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            onClick={() => navigate('/campus-maps')}
            variant="ghost"
            className="flex items-center gap-2 text-slate-700 hover:text-green-600 text-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">{campusData.fullName}</h1>
            <p className="text-sm text-slate-600">{campusData.address}</p>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {campusData.id === 25 ? (
          // Campus 25: Full Width Layout
          <div className="space-y-8">
            {/* Top Row: Map & Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-80">
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
              <div className="bg-white rounded-xl shadow-lg p-6 h-80 overflow-y-auto">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{campusData.fullName}</h3>
                <p className="text-slate-700 mb-4 text-sm">{campusData.description}</p>
                <div className="text-sm text-slate-600 space-y-3">
                  <p>
                    <span className="font-semibold">📍 Coordinates:</span>
                    <br />
                    {campusData.coordinates.lat.toFixed(6)}, {campusData.coordinates.lng.toFixed(6)}
                  </p>
                  <p>
                    <span className="font-semibold">📮 Address:</span>
                    <br />
                    {campusData.address}
                  </p>
                </div>

                <Button
                  onClick={() => window.open(campusData.mapsUrl, '_blank')}
                  className="w-full mt-4 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center justify-center gap-2 font-semibold"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Floor Plans Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b-2 border-green-500 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  <h3 className="text-2xl font-bold text-slate-900">📐 Floor Plans & Layouts</h3>
                </div>
                <p className="text-slate-600">Click a floor to view the layout</p>
              </div>

              {/* Floor Selector Buttons */}
              <div className="p-6 bg-slate-50 border-b">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(['ground', 'first', 'second', 'third'] as const).map((floor) => (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all text-center ${
                        selectedFloor === floor
                          ? 'bg-green-600 text-white shadow-lg scale-105'
                          : 'bg-white text-slate-900 border-2 border-slate-300 hover:border-green-500 hover:bg-green-50'
                      }`}
                    >
                      {floorNames[floor]}
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Display Section */}
              <div className="p-6 bg-gradient-to-b from-slate-50 to-white">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">
                  📄 {floorNames[selectedFloor]} Layout
                </h4>
                
                {/* PDF Viewer */}
                <div className="w-full bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200 shadow-md" style={{ minHeight: '500px' }}>
                  <iframe
                    key={selectedFloor}
                    title={`${campusData.fullName} - ${floorNames[selectedFloor]}`}
                    src={floorPdfMap[selectedFloor]}
                    width="100%"
                    height="500"
                    style={{ border: 'none', display: 'block', background: '#f1f5f9' }}
                    onError={() => console.error('PDF failed to load')}
                  />
                </div>
              </div>
            </div>

            {/* Points of Interest */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">📍</span>
                Points of Interest
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-4xl">🍽️</span>
                  <span className="text-slate-700 font-medium">Food Court & Cafeteria</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-4xl">🏠</span>
                  <span className="text-slate-700 font-medium">Girls Hostel</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-4xl">🏘️</span>
                  <span className="text-slate-700 font-medium">Boys Hostel</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-4xl">🏢</span>
                  <span className="text-slate-700 font-medium">Main Administrative Building</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-4xl">🎭</span>
                  <span className="text-slate-700 font-medium">Main Auditorium</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-4xl">🎪</span>
                  <span className="text-slate-700 font-medium">Open Air Theatre</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-4xl">📚</span>
                  <span className="text-slate-700 font-medium">Central Library</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-4xl">⚽</span>
                  <span className="text-slate-700 font-medium">Sports Complex & Grounds</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-green-50 transition-colors">
                  <span className="text-4xl">🏥</span>
                  <span className="text-slate-700 font-medium">Health Center</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Other Campuses: Full-width layout
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-96">
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
                className="w-full h-14 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white flex items-center justify-center gap-2 text-lg font-semibold"
              >
                <Navigation className="w-5 h-5" />
                Get Directions
                <ExternalLink className="w-4 h-4" />
              </Button>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-3">{campusData.fullName}</h3>
                <p className="text-slate-700 mb-4">{campusData.description}</p>
                <div className="text-sm text-slate-600 space-y-2">
                  <p>📍 Coordinates: {campusData.coordinates.lat.toFixed(6)}, {campusData.coordinates.lng.toFixed(6)}</p>
                  <p>📮 Address: {campusData.address}</p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                Points of Interest
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🍽️</span>
                  <span className="text-slate-700 font-medium">Food Court</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🏠</span>
                  <span className="text-slate-700 font-medium">Girls Hostel</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🏘️</span>
                  <span className="text-slate-700 font-medium">Boys Hostel</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🏢</span>
                  <span className="text-slate-700 font-medium">Main Building</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🎭</span>
                  <span className="text-slate-700 font-medium">Auditorium</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🎪</span>
                  <span className="text-slate-700 font-medium">Open Air Theatre</span>
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
