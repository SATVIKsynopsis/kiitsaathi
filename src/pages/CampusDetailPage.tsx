import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, ExternalLink, MapPin } from 'lucide-react';
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

const CampusDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Get campus from ID in URL
  const campusData = campusLocations.find((c) => c.id === parseInt(id || '0'));

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Map & Directions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Card */}
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

            {/* Get Directions Button */}
            <Button
              onClick={() => window.open(campusData.mapsUrl, '_blank')}
              className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
              <ExternalLink className="w-4 h-4" />
            </Button>

            {/* Info Card */}
            <div className="bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">{campusData.fullName}</h3>
              </div>
              <p className="text-gray-300 mb-4">{campusData.description}</p>
              <div className="text-sm text-gray-400 space-y-2">
                <p>📍 <strong>Coordinates:</strong> {campusData.coordinates.lat.toFixed(6)}, {campusData.coordinates.lng.toFixed(6)}</p>
                <p>📮 <strong>Address:</strong> {campusData.address}</p>
              </div>
            </div>
          </div>

          {/* Right sidebar - Points of Interest */}
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
      </main>
    </div>
  );
};

export default CampusDetailPage;
