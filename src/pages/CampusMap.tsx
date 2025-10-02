import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Map as MapIcon, Sparkles, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

        {/* Campus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 25 }, (_, i) => i + 1).map((campusNum) => {
            const isCampus25 = campusNum === 25;
            const isOtherDetailed = campusNum === 1 || campusNum === 2;
            const isInteractive = isCampus25 || isOtherDetailed;
            
            const CardContent = (
              <div
                className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all cursor-pointer ${
                  isInteractive ? 'hover:bg-white/20 hover:scale-105' : 'opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${
                    isInteractive 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                      : 'bg-gray-500'
                  }`}>
                    <MapIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">Campus {campusNum}</h3>
                    <p className="text-xs text-white/70">KIIT Campus {campusNum}</p>
                  </div>
                  {isCampus25 && (
                    <ExternalLink className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <p className="text-sm text-white/80">
                  {isCampus25 
                    ? 'Full interactive floor plan with 2D/3D views, room search, and detailed navigation.'
                    : isOtherDetailed 
                    ? `Explore Campus ${campusNum} facilities and detailed room layout.`
                    : `Campus ${campusNum} details coming soon.`
                  }
                </p>
                {isInteractive && (
                  <div className="mt-3 flex items-center gap-2">
                    <Star className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">
                      {isCampus25 ? 'Full Interactive Map Available' : 'Interactive Map Available'}
                    </span>
                  </div>
                )}
              </div>
            );

            // Campus 25 gets special routing to the full map page
            if (isCampus25) {
              return (
                <Link 
                  key={campusNum} 
                  to="/campus-map/campus-25"
                  className="block focus:outline-none focus:ring-2 focus:ring-green-400 rounded-2xl"
                >
                  {CardContent}
                </Link>
              );
            }
            
            // Other campuses with placeholder navigation
            return (
              <div
                key={campusNum}
                onClick={() => {
                  if (isOtherDetailed) {
                    navigate(`/campus-map/${campusNum}`);
                  }
                }}
              >
                {CardContent}
              </div>
            );
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">More Interactive Maps Coming Soon!</h3>
            <p className="text-white/80 max-w-2xl mx-auto">
              Campus 25 now features a complete interactive floor plan experience! We're working on bringing 
              similar detailed maps to all other campus locations with real-time navigation and room details.
            </p>
            <div className="mt-4">
              <Link 
                to="/campus-map/campus-25"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 
                         text-white rounded-lg transition-colors"
              >
                <MapIcon className="w-4 h-4" />
                Try Campus 25 Interactive Map
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CampusMap;