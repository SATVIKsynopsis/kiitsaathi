import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { campusLocations } from '@/data/campusLocations';
import { Button } from '@/components/ui/button';

const CampusMapsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampuses = campusLocations.filter(
    (campus) =>
      campus.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-green-600">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-slate-900">Campus Interactive Maps</h1>
          <p className="text-slate-600 mt-2">Explore detailed floor plans and navigate your way through KIIT campuses</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-6 py-8">
        <input
          type="text"
          placeholder="🔍 Search campuses by name, description, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-4 rounded-xl border-2 border-slate-300 focus:border-green-500 focus:outline-none text-lg transition-all"
        />
      </div>

      {/* Campus Grid */}
      <main className="container mx-auto px-6 py-12 pb-24">
        {filteredCampuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampuses.map((campus) => (
              <div
                key={campus.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-green-500 hover:scale-105"
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <MapPin className="w-6 h-6 text-green-600" />
                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                      Campus {campus.id}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{campus.fullName}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{campus.description}</p>

                  {/* Address */}
                  <p className="text-xs text-slate-500 mb-6 line-clamp-2">📍 {campus.address}</p>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate(`/campus-maps/${campus.id}`, { state: { campusData: campus } })}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      View Map
                    </Button>
                    <Button
                      onClick={() => window.open(campus.mapsUrl, '_blank')}
                      variant="outline"
                      className="flex-1 border-2 hover:bg-slate-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No campuses found</h2>
            <p className="text-slate-600">Try adjusting your search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CampusMapsPage;
