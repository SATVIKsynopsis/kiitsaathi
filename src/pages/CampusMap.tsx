import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Map as MapIcon, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Campus, campuses } from '@/data/campuses';
import { CampusSearch } from '@/components/campus-map/CampusSearch';
import { MapCanvas } from '@/components/campus-map/MapCanvas';
import { CampusDetail } from '@/components/campus-map/CampusDetail';
import InteractiveMap from '@/components/campus-map/InteractiveMap';

const CampusMap: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Handle deep linking
  useEffect(() => {
    const campusParam = searchParams.get('campus');
    if (campusParam) {
      const campusId = parseInt(campusParam);
      const campus = campuses.find(c => c.id === campusId);
      if (campus) {
        setSelectedCampus(campus);
        setIsDetailOpen(true);
        setSearchQuery(campus.name);
      }
    }
  }, [searchParams]);

  const handleCampusSelect = (campus: Campus) => {
    setSelectedCampus(campus);
    setIsDetailOpen(true);
    setSearchParams({ campus: campus.id.toString() });
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCampus(null);
    setSearchParams({});
  };

  const parallaxStars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 10 + 5,
  }));

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Parallax Background Layers */}
      <motion.div 
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900"
        style={{ zIndex: -3 }}
      />
      
      {/* Animated Stars */}
      <div className="fixed inset-0" style={{ zIndex: -2 }}>
        {parallaxStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white/30"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Floating Clouds */}
      <motion.div
        className="fixed inset-0 opacity-20"
        style={{ zIndex: -1 }}
        animate={{
          x: ['-10%', '10%', '-10%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 right-1/4 w-96 h-48 bg-white/5 rounded-full blur-3xl" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          className="p-6 glass-card border-b border-white/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white hover:text-kiit-green hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-kiit-green to-campus-blue">
                <MapIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Campus Explorer</h1>
                <p className="text-sm text-white/70">Discover KIIT University</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section
          className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                Explore
                <span className="block bg-gradient-to-r from-kiit-green via-campus-blue to-campus-purple bg-clip-text text-transparent">
                  25 Campuses
                </span>
              </h2>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                From the stratosphere to your fingertips. Navigate through KIIT's sprawling campus ecosystem with our interactive map.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <CampusSearch
                onCampusSelect={handleCampusSelect}
                query={searchQuery}
                onQueryChange={setSearchQuery}
              />
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap gap-8 justify-center text-white/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  25
                </div>
                <div className="text-sm">Unique Campuses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                  <Star className="w-6 h-6 text-blue-400" />
                  1997
                </div>
                <div className="text-sm">Established</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                  <MapIcon className="w-6 h-6 text-green-400" />
                  2000+
                </div>
                <div className="text-sm">Acres Total</div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Interactive Map Section */}
        <motion.section
          className="flex-1 p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="container mx-auto h-full min-h-[600px]">
            <MapCanvas
              campuses={campuses}
              onCampusSelect={handleCampusSelect}
              selectedCampusId={selectedCampus?.id}
            />
          </div>
        </motion.section>

        {/* Real Interactive Map Section */}
        <motion.section
          className="p-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                Live KIIT University Map
              </h3>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Explore the real-world locations of all KIIT campuses with this interactive map. 
                Click on any campus marker to see detailed information.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="h-[600px] w-full">
              <InteractiveMap onCampusSelect={(campusId) => {
                const campus = campuses.find(c => c.id === campusId);
                if (campus) handleCampusSelect(campus);
              }} />
            </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Campus Detail Panel */}
      <CampusDetail
        campus={selectedCampus}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

export default CampusMap;