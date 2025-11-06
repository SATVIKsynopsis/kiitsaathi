import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CampusLocationButtonProps {
  campusName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
}

export const CampusLocationButton: React.FC<CampusLocationButtonProps> = ({
  campusName,
  coordinates,
  address,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const olaMapsDirectUrl = `https://maps.olakrutrim.com/?lat=${coordinates.lat}&lng=${coordinates.lng}&name=${encodeURIComponent(campusName)}`;
  
  // Use OpenStreetMap/Leaflet URL as fallback
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.01},${coordinates.lat - 0.01},${coordinates.lng + 0.01},${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="absolute top-4 right-4 bg-white/80 hover:bg-white z-10"
        title="View campus location"
      >
        <MapPin className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-gray-900">{campusName}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{address}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Map Container - Using OpenStreetMap */}
          <div className="relative w-full h-[500px] bg-gray-100">
            <iframe
              title={`${campusName} Location Map`}
              width="100%"
              height="100%"
              frameBorder="0"
              src={mapUrl}
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Action Buttons */}
          <div className="p-6 flex gap-3 border-t">
            <Button
              onClick={() => window.open(olaMapsDirectUrl, '_blank')}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <MapPin className="w-4 h-4" />
              Open in Ola Maps
              <ExternalLink className="w-3 h-3" />
            </Button>

            <Button
              onClick={() => window.open(`https://maps.olakrutrim.com/directions?destination=${coordinates.lat},${coordinates.lng}`, '_blank')}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </Button>
          </div>

          {/* Coordinates */}
          <div className="px-6 pb-6 text-xs text-gray-500 flex items-center justify-between border-t">
            <span>Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
            <span className="text-purple-600 font-semibold">Powered by OpenStreetMap</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};