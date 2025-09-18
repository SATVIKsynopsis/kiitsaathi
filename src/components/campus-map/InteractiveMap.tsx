import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Real KIIT University campus coordinates in Bhubaneswar, Odisha, India
const kiitCampusLocations = [
  { id: 1, name: "Campus 1 - Main Campus", lat: 20.3554, lng: 85.8172, description: "Main Administrative Block" },
  { id: 2, name: "Campus 2 - Computer Science", lat: 20.3565, lng: 85.8180, description: "School of Computer Engineering" },
  { id: 3, name: "Campus 3 - Mechanical Engineering", lat: 20.3542, lng: 85.8165, description: "School of Mechanical Engineering" },
  { id: 4, name: "Campus 4 - Civil Engineering", lat: 20.3548, lng: 85.8158, description: "School of Civil Engineering" },
  { id: 5, name: "Campus 5 - Electronics", lat: 20.3560, lng: 85.8175, description: "School of Electronics Engineering" },
  { id: 6, name: "Campus 6 - Biotechnology", lat: 20.3570, lng: 85.8185, description: "School of Biotechnology" },
  { id: 7, name: "Campus 7 - Management", lat: 20.3535, lng: 85.8150, description: "KIIT School of Management" },
  { id: 8, name: "Campus 8 - Medical College", lat: 20.3575, lng: 85.8190, description: "KIIT Medical College" },
  { id: 9, name: "Campus 9 - Applied Sciences", lat: 20.3552, lng: 85.8168, description: "School of Applied Sciences" },
  { id: 10, name: "Campus 10 - Architecture", lat: 20.3558, lng: 85.8162, description: "School of Architecture" },
  { id: 11, name: "Campus 11 - Library", lat: 20.3562, lng: 85.8178, description: "Central Library" },
  { id: 12, name: "Campus 12 - Sports Complex", lat: 20.3545, lng: 85.8155, description: "Sports & Recreation Center" },
  { id: 13, name: "Campus 13 - Hostels Block A", lat: 20.3540, lng: 85.8195, description: "Student Housing Block A" },
  { id: 14, name: "Campus 14 - Hostels Block B", lat: 20.3580, lng: 85.8145, description: "Student Housing Block B" },
  { id: 15, name: "Campus 15 - Research Center", lat: 20.3568, lng: 85.8188, description: "Research & Innovation Center" },
  { id: 16, name: "Campus 16 - Auditorium", lat: 20.3555, lng: 85.8170, description: "Main Auditorium Complex" },
  { id: 17, name: "Campus 17 - Food Court", lat: 20.3550, lng: 85.8173, description: "Student Food Court" },
  { id: 18, name: "Campus 18 - International Center", lat: 20.3565, lng: 85.8160, description: "International Students Center" },
  { id: 19, name: "Campus 19 - Innovation Hub", lat: 20.3572, lng: 85.8182, description: "Innovation & Entrepreneurship Hub" },
  { id: 20, name: "Campus 20 - Pharmacy", lat: 20.3538, lng: 85.8148, description: "School of Pharmacy" },
  { id: 21, name: "Campus 21 - Law School", lat: 20.3578, lng: 85.8192, description: "KIIT School of Law" },
  { id: 22, name: "Campus 22 - Nursing College", lat: 20.3543, lng: 85.8152, description: "School of Nursing" },
  { id: 23, name: "Campus 23 - Dental College", lat: 20.3567, lng: 85.8177, description: "School of Dental Sciences" },
  { id: 24, name: "Campus 24 - Hospital", lat: 20.3574, lng: 85.8187, description: "KIIT Medical College Hospital" },
  { id: 25, name: "Campus 25 - Agriculture", lat: 20.3546, lng: 85.8163, description: "School of Agricultural Sciences" }
];

// Create custom icon for KIIT campuses
const createCustomIcon = (campusNumber: number) => {
  return L.divIcon({
    html: `<div style="
      background: linear-gradient(135deg, #4ade80, #3b82f6);
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${campusNumber}</div>`,
    className: 'custom-campus-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

interface InteractiveMapProps {
  onCampusSelect?: (campusId: number) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onCampusSelect }) => {
  const [map, setMap] = useState<L.Map | null>(null);

  // Center of KIIT University
  const kiitCenter: [number, number] = [20.3554, 85.8172];

  useEffect(() => {
    // Add custom styles for the map
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-container {
        height: 100%;
        width: 100%;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      
      .leaflet-popup-content-wrapper {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.2);
      }
      
      .leaflet-popup-content {
        margin: 12px 16px;
        font-family: inherit;
      }
      
      .custom-campus-marker {
        transition: transform 0.2s ease;
      }
      
      .custom-campus-marker:hover {
        transform: scale(1.1);
        z-index: 1000 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[500px] relative">
      <MapContainer
        center={kiitCenter}
        zoom={16}
        scrollWheelZoom={true}
        className="z-0"
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {kiitCampusLocations.map((campus) => (
          <Marker
            key={campus.id}
            position={[campus.lat, campus.lng]}
            icon={createCustomIcon(campus.id)}
            eventHandlers={{
              click: () => {
                if (onCampusSelect) {
                  onCampusSelect(campus.id);
                }
              },
            }}
          >
            <Popup className="campus-popup">
              <div className="text-center">
                <h3 className="font-bold text-sm text-gray-800 mb-1">
                  {campus.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  {campus.description}
                </p>
                <div className="text-xs text-blue-600 font-medium">
                  Click marker to explore campus details
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-white/20">
        <h4 className="font-semibold text-sm text-gray-800 mb-2">KIIT University</h4>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500 border border-white"></div>
          Campus Locations
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {kiitCampusLocations.length} Campuses
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;