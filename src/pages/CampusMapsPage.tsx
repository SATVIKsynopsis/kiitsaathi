import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { campusLocations } from '@/data/campusLocations';

const CampusMapsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'campuses' | 'hostels'>('campuses');

  const campus25 = campusLocations.find((c) => c.id === 25);

  const filteredCampuses = campusLocations.filter((campus) =>
    campus.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campus.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewMap = (campus: (typeof campusLocations)[0]) => {
    navigate(`/campus-maps/${campus.id}`);
  };

  const handleInteractiveMap = () => {
    navigate('/campus-maps/interactive', { state: { campusData: campus25 } });
  };

  const handleHostelLayout = () => {
    navigate('/hostels/KP-25-C');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Campus Explorer</h1>
              <p className="text-xs text-gray-300">Maps, Locations & Hostels</p>
            </div>
          </div>

          <div className="w-24" />
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-4 flex items-center justify-center gap-2 pb-4 flex-wrap">
        <button
          onClick={() => setViewMode('campuses')}
          className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
            viewMode === 'campuses'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-slate-800/60 text-gray-300 border border-purple-600/50 hover:bg-slate-800'
          }`}
        >
          Campuses
        </button>
        <button
          onClick={() => setViewMode('hostels')}
          className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
            viewMode === 'hostels'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-slate-800/60 text-gray-300 border border-purple-600/50 hover:bg-slate-800'
          }`}
        >
          Hostels
        </button>
      </div>

      <main className="container mx-auto px-4 py-4">
        {viewMode === 'campuses' ? (
          <div className="space-y-6">
            {/* Interactive Maps - Campus 25 */}
            <section>
              <div className="text-center mb-3">
                <h2 className="text-3xl font-bold text-white mb-1">Interactive Maps</h2>
                <p className="text-base text-gray-300">Explore Campus 25 floor plans</p>
              </div>

              {campus25 && (
                <div className="max-w-md mx-auto mt-2 mb-2">
                  <div
                    onClick={handleInteractiveMap}
                    className="group bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-5 hover:border-green-400/50 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                          {campus25.name}
                        </h3>
                        <p className="text-xs text-gray-400">{campus25.fullName}</p>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{campus25.description}</p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInteractiveMap();
                      }}
                      className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-semibold transition-colors group-hover:translate-x-1 transition-transform"
                    >
                      <FileText className="w-4 h-4" />
                      View floor layouts
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Divider */}
            <div className="border-t border-purple-600/30 my-3" />

            {/* Campus Locations */}
            <section>
              <div className="text-center mb-3">
                <h2 className="text-3xl font-bold text-white mb-1">Campus Locations</h2>
                <p className="text-base text-gray-300">View all KIIT campuses</p>
              </div>

              <div className="mb-4 max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Search campuses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-2.5 rounded-lg bg-slate-800/50 border border-purple-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampuses.map((campus) => (
                  <div
                    key={campus.id}
                    onClick={() => handleViewMap(campus)}
                    className="group bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-5 hover:border-green-400/50 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                          {campus.name}
                        </h3>
                        <p className="text-xs text-gray-400">{campus.fullName}</p>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{campus.description}</p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewMap(campus);
                      }}
                      className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-semibold transition-colors group-hover:translate-x-1 transition-transform"
                    >
                      <MapPin className="w-4 h-4" />
                      Click to view map
                    </button>
                  </div>
                ))}
              </div>

              {filteredCampuses.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-gray-400 text-sm">No campuses found matching "{searchQuery}"</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          // Hostels tab (unchanged)
          <div className="space-y-4">
            <div className="text-center mb-3">
              <h2 className="text-3xl font-bold text-white mb-1">Hostel Floor Layouts</h2>
              <p className="text-base text-gray-300">Explore hostel floor plans and facilities</p>
            </div>

            <div className="max-w-md mx-auto">
              <div
                onClick={handleHostelLayout}
                className="group bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-5 hover:border-green-400/50 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                      KP-25-C
                    </h3>
                    <p className="text-xs text-gray-400">Boys Hostel - Campus 25</p>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-3">
                  7-floor hostel with detailed room layouts and facility information
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHostelLayout();
                  }}
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-semibold transition-colors group-hover:translate-x-1 transition-transform"
                >
                  <FileText className="w-4 h-4" />
                  View floor layouts
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CampusMapsPage;
////sdsdsdsd