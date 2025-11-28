import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { campusLocations } from '@/data/campusLocations';

const CampusMaps: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter campuses based on search
  const filteredCampuses = campusLocations.filter((campus) =>
    campus.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campus.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewMap = (campus: typeof campusLocations[0]) => {
    navigate(`/campus-maps/${campus.id}`, { state: { campusData: campus } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Back to Home */}
      <header className="border-b border-purple-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Campus Explorer</h1>
              <p className="text-sm text-gray-300">Discover KIIT University</p>
            </div>
          </div>

          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Campus Interactive Maps</h2>
          <p className="text-xl text-gray-300">Click any campus to view its location on the map</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search campuses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 rounded-lg bg-slate-800/50 border border-purple-600 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-colors"
          />
        </div>

        {/* Campus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampuses.map((campus) => (
            <div
              key={campus.id}
              className="group bg-slate-800/40 backdrop-blur border border-purple-600/50 rounded-xl p-6 hover:border-green-400/50 hover:bg-slate-800/60 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
              onClick={() => handleViewMap(campus)}
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                    {campus.name}
                  </h3>
                  <p className="text-sm text-gray-400">{campus.fullName}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{campus.description}</p>

              {/* Click to view map link */}
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

        {/* No Results Message */}
        {filteredCampuses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No campuses found matching "{searchQuery}"</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CampusMaps;
