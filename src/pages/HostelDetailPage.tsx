import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HostelDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { hostelId } = useParams();
  const [selectedFloor, setSelectedFloor] = useState<number>(0);

  // Hostel floor PDFs (Ground Floor = 0, 1st Floor = 1, etc.)
  const floorPdfMap: Record<number, string> = {
    0: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/KP%2025%20Gnd%20Floor.pdf',
    1: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/KP%2025%201st%20Floor.pdf',
    2: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/KP%2025%202nd%20Floor.pdf',
    3: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/KP%2025%203rd%20Floor.pdf',
    4: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/KP%2025%204th%20Floor.pdf',
    5: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/KP%2025%205th%20Floor.pdf',
    6: 'https://jzkzqpeorsehwvwcyjkf.supabase.co/storage/v1/object/public/campus-map/Cam25/KP%2025%206th%20Floor.pdf',
  };

  const floorNames: Record<number, string> = {
    0: 'Ground Floor',
    1: '1st Floor',
    2: '2nd Floor',
    3: '3rd Floor',
    4: '4th Floor',
    5: '5th Floor',
    6: '6th Floor',
  };

  if (!hostelId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Hostel not found</h1>
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
            <h1 className="text-2xl font-bold text-white">Hostel {hostelId}</h1>
            <p className="text-sm text-gray-300">Floor Plans & Layouts</p>
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

            {/* Floor Selector - 7 Floors */}
            <div className="p-6 bg-slate-800/20 border-b border-purple-600/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[0, 1, 2, 3, 4, 5, 6].map((floor) => (
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
                  title={`${hostelId} - ${floorNames[selectedFloor]}`}
                  src={floorPdfMap[selectedFloor]}
                  width="100%"
                  height="600"
                  style={{ border: 'none', display: 'block', background: '#1e293b' }}
                />
              </div>
            </div>
          </div>

          {/* Hostel Info */}
          <div className="bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-4">About {hostelId}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <h4 className="text-white font-semibold">Total Floors</h4>
                    <p className="text-gray-300">7 Floors (Ground to 6th)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🛏️</span>
                  <div>
                    <h4 className="text-white font-semibold">Capacity</h4>
                    <p className="text-gray-300">Multiple rooms per floor</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚗</span>
                  <div>
                    <h4 className="text-white font-semibold">Parking</h4>
                    <p className="text-gray-300">Available only for Bicycles</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔑</span>
                  <div>
                    <h4 className="text-white font-semibold">Access</h4>
                    <p className="text-gray-300">Restricted to residents</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HostelDetailPage;
