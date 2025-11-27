import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/Navbar';

const CampusMap = () => {
  const navigate = useNavigate();

  const { data: buildings, isLoading } = useQuery({
  queryKey: ['campus-buildings'],
  queryFn: async () => {
    const response = await fetch(`${import.meta.env.VITE_HOSTED_URL}/api/campus-buildings`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch campus buildings');
    }

    return response.json();
  },
});

  const handleBuildingClick = (building: string) => {
    const slug = building.toLowerCase().replace(/\s+/g, '-');
    navigate(`/campus-map/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center my-20">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Campus Interactive Maps
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore detailed floor plans and navigate your way through KIIT campuses
          </p>
        </div>

        {/* Buildings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-48">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buildings?.map((building) => (
              <Card
                key={building.building}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary"
                onClick={() => handleBuildingClick(building.building)}
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{building.building}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <MapPin className="w-4 h-4" />
                    {building.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to view detailed floor plans and navigate through all floors
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!buildings || buildings.length === 0) && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Maps Available</h3>
            <p className="text-muted-foreground">
              Campus maps will be available soon. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusMap;
