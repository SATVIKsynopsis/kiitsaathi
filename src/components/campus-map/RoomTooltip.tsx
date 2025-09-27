import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Users, Wifi, Monitor, Lightbulb, X } from 'lucide-react';

interface Room {
  id: string;
  label: string;
  description: string;
  side: string;
}

interface RoomTooltipProps {
  room: Room | null;
  floor: string;
  onClose: () => void;
}

const RoomTooltip: React.FC<RoomTooltipProps> = ({ room, floor, onClose }) => {
  if (!room) return null;

  // Mock facilities data based on room type
  const getFacilities = (roomId: string) => {
    const facilities = [
      { icon: Monitor, label: 'Projector', available: true },
      { icon: Wifi, label: 'Wi-Fi', available: true },
      { icon: Lightbulb, label: 'LED Lighting', available: true },
      { icon: Users, label: 'Capacity: 40', available: true }
    ];
    
    return facilities;
  };

  const getAvailability = () => {
    // Mock availability - in real app this would come from a booking system
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour < 17) {
      return { status: 'occupied', next: '3:00 PM', current: 'Data Structures Lab' };
    } else {
      return { status: 'available', next: '9:00 AM', current: null };
    }
  };

  const facilities = getFacilities(room.id);
  const availability = getAvailability();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-background border border-border rounded-xl shadow-lg p-6 w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{room.label}</h3>
            <p className="text-sm text-muted-foreground capitalize">{floor} Floor</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-accent transition-colors"
            aria-label="Close room details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {room.side === 'left' ? 'A-Block' : room.side === 'right' ? 'B-Block' : 'Main Block'}
          </span>
        </div>

        {/* Availability Status */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Current Status</span>
          </div>
          
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                          ${availability.status === 'available' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${
              availability.status === 'available' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {availability.status === 'available' ? 'Available' : 'Occupied'}
          </div>
          
          {availability.current && (
            <p className="text-xs text-muted-foreground mt-1">
              Current: {availability.current}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Next change: {availability.next}
          </p>
        </div>

        {/* Facilities */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Facilities</h4>
          <div className="grid grid-cols-2 gap-3">
            {facilities.map((facility, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs
                          ${facility.available 
                            ? 'bg-accent/50 text-foreground' 
                            : 'bg-muted text-muted-foreground'}`}
              >
                <facility.icon className="w-3 h-3" />
                <span>{facility.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg 
                           hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                  disabled={availability.status === 'occupied'}>
            {availability.status === 'available' ? 'Book Room' : 'Add to Waitlist'}
          </button>
          
          <button className="w-full py-2 px-4 border border-border rounded-lg 
                           hover:bg-accent transition-colors text-sm">
            View Schedule
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Room {room.label} • Campus 25 • KIIT University
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Report issues or request maintenance via KIIT Saathi
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoomTooltip;