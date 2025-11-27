import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PDFViewer } from '@/components/services/campus-map/PDFviewer';
import { FloorSelector } from '@/components/services/campus-map/FloorSelector';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Campus25Map = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const floorParam = searchParams.get('floor') || 'Ground';
  const [selectedFloor, setSelectedFloor] = useState(floorParam);

  const { data: floors, isLoading } = useQuery({
    queryKey: ['campus-25-maps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campus_maps')
        .select('*')
        .eq('building', 'Campus 25')
        .eq('is_visible', true)
        .order('floor_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const currentFloorData = floors?.find(f => f.floor === selectedFloor);

  useEffect(() => {
    // Increment view count when floor is viewed
    if (currentFloorData?.id) {
      supabase.rpc('increment_map_view_count', { map_id: currentFloorData.id });
    }
  }, [currentFloorData?.id]);

  const handleFloorChange = (floor: string) => {
    setSelectedFloor(floor);
    setSearchParams({ floor });
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/campus-map')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campus Maps
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Campus 25 - Interactive Map
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">Near KP 25</span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {selectedFloor} Floor Layout - Use zoom controls to explore the detailed floor plan
          </p>
        </div>

        {/* Floor Selector */}
        {isLoading ? (
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>
        ) : (
          <div className="mb-8">
            <FloorSelector
              floors={floors?.map(f => f.floor) || []}
              selectedFloor={selectedFloor}
              onFloorChange={handleFloorChange}
            />
          </div>
        )}

        {/* PDF Viewer */}
        {isLoading ? (
          <div className="bg-card rounded-lg p-8 shadow-lg border">
            <Skeleton className="h-[600px] w-full" />
          </div>
        ) : currentFloorData ? (
          <div className="bg-card rounded-lg p-6 shadow-lg border">
            <PDFViewer
              fileUrl={currentFloorData.file_url}
              title={`Campus 25 - ${selectedFloor} Floor`}
            />
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg shadow-lg border">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Map Not Available
            </h3>
            <p className="text-muted-foreground">
              The floor plan for {selectedFloor} floor is currently unavailable.
            </p>
          </div>
        )}

        {/* View Count */}
        {currentFloorData && (
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>{currentFloorData.view_count || 0} views</span>
          </div>
        )}

        {/* Back to Top Button */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={handleBackToTop}>
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Campus25Map;
