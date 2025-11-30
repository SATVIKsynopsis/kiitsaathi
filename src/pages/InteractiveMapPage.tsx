import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { campusLocations } from '@/data/campusLocations';

const InteractiveMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFloor, setSelectedFloor] = useState<'ground' | 'first' | 'second' | 'third'>('ground');

  const campus25 = campusLocations.find((c) => c.id === 25);

  const floorPdfMap = {
    ground: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/Ground%20Floor%20KIIT%20Campus%2025%20.pdf',
    first: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/First%20Floor%20Campus%2025%20KIIT%20Saathi.pdf',
    second: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/Second%20Floor%20Campus%2025%20KIIT%20Saathi.pdf',
    third: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/Third%20Floor%20Campus%2025%20KIIT%20Saathi.pdf',
  };

  const floorNames = {
    ground: 'Ground Floor',
    first: 'First Floor',
    second: 'Second Floor',
    third: 'Third Floor',
  };

  if (!campus25) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Campus 25 not found</h1>
          <Button onClick={() => navigate('/campus-maps')} className="bg-green-600 hover:bg-green-700">
            Back to Campus Maps
          </Button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-white">{campus25.fullName}</h1>
            <p className="text-sm text-gray-300">Interactive Floor Layouts</p>
          </div>

          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Floor Plans Section */}
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
                  title={`Campus 25 - ${floorNames[selectedFloor]}`}
                  src={floorPdfMap[selectedFloor]}
                  width="100%"
                  height="600"
                  style={{ border: 'none', display: 'block', background: '#1e293b' }}
                />
              </div>
            </div>
          </div>

          {/* Points of Interest Section */}
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
                <span className="text-gray-200 font-medium">Main Admin Building</span>
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
      </main>
    </div>
  );
};

export default InteractiveMapPage;
