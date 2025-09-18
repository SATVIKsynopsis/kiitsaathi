import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy-load InteractiveMap to prevent any initialization issues
const InteractiveMapLazy = lazy(() => import('@/components/campus-map/InteractiveMap'));

// Client-only wrapper to avoid SSR/window issues
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="h-[600px] w-full rounded-lg bg-white/10 animate-pulse" aria-busy="true" aria-label="Loading map" />;
  }
  return <>{children}</>;
};

const CampusMap: React.FC = () => {
  console.log('CampusMap: Component rendering...');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <header className="p-6 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-green-400 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Campus Explorer</h1>
              <p className="text-sm text-white/70">Discover KIIT University</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Explore KIIT Campus
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Navigate through KIIT's 25 campus locations with our interactive map system.
          </p>
        </div>

        {/* Temporary Campus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((campusNum) => (
            <div
              key={campusNum}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-500">
                  <MapIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Campus {campusNum}</h3>
                  <p className="text-xs text-white/70">KIIT Campus {campusNum}</p>
                </div>
              </div>
              <p className="text-sm text-white/80">
                Explore Campus {campusNum} facilities and departments.
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Campus Map */}
        <div className="mt-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">Interactive Campus Map</h3>
              <p className="text-white/80">
                Explore all KIIT University campuses with our interactive map. Click on any marker to view campus details.
              </p>
            </div>
            <div className="h-[600px] w-full rounded-lg overflow-hidden">
              <ClientOnly>
                <Suspense fallback={<div className="h-full w-full rounded-lg bg-white/10 animate-pulse" aria-busy="true" aria-label="Loading map" />}> 
                  <InteractiveMapLazy onCampusSelect={(campusId) => console.log(`Selected campus: ${campusId}`)} />
                </Suspense>
              </ClientOnly>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampusMap;