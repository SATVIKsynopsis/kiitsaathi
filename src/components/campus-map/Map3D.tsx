import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface Room {
  id: string;
  label: string;
  path: string;
  centroid: { xPct: number; yPct: number };
  side: string;
  description: string;
}

interface FloorData {
  label: string;
  svgViewBox: string;
  rooms: Room[];
}

interface Map3DProps {
  groundFloor: FloorData;
  firstFloor: FloorData;
  selectedRoom: string | null;
  onRoomSelect: (roomId: string) => void;
  highlightRoom: string | null;
}

// Convert SVG path to THREE.Shape (simplified rectangular rooms)
const pathToShape = (path: string): THREE.Shape => {
  const shape = new THREE.Shape();
  
  // Parse simple rectangular path (M x y L x y L x y L x y Z)
  const coords = path.match(/\d+\.?\d*/g)?.map(Number) || [];
  if (coords.length >= 8) {
    const [x1, y1, , , x2, y2] = coords;
    const width = Math.abs(x2 - x1) / 100; // Scale down
    const height = Math.abs(y2 - y1) / 100;
    
    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);
  }
  
  return shape;
};

// Individual room component
const Room3D: React.FC<{
  room: Room;
  floor: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}> = ({ room, floor, isSelected, isHighlighted, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Position based on centroid
  const x = (room.centroid.xPct - 0.5) * 12; // Center and scale
  const z = (0.5 - room.centroid.yPct) * 8; // Flip Y and scale
  const y = floor * 0.5; // Stack floors
  
  // Create geometry from room shape
  const shape = pathToShape(room.path);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.4,
    bevelEnabled: false
  });
  
  // Material based on state
  const getMaterial = () => {
    if (isSelected || isHighlighted) {
      return new THREE.MeshLambertMaterial({ 
        color: '#10b981',
        emissive: '#10b981',
        emissiveIntensity: 0.2
      });
    }
    if (hovered) {
      return new THREE.MeshLambertMaterial({ 
        color: '#3b82f6',
        emissive: '#3b82f6',
        emissiveIntensity: 0.1
      });
    }
    return new THREE.MeshLambertMaterial({ 
      color: floor === 0 ? '#e5e7eb' : '#f3f4f6'
    });
  };

  useFrame(() => {
    if (meshRef.current && (isSelected || isHighlighted)) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={[x, y, z]}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={getMaterial()}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      />
      
      {/* Room label */}
      <Text
        position={[0.5, 0.6, 0.5]}
        fontSize={0.15}
        color={isSelected || isHighlighted ? '#10b981' : '#374151'}
        anchorX="center"
        anchorY="middle"
      >
        {room.label}
      </Text>
      
      {/* Floating info when selected */}
      {isSelected && (
        <Html position={[0.5, 1, 0.5]} center>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background/95 backdrop-blur-sm border border-border 
                     rounded-lg p-2 shadow-lg pointer-events-none"
          >
            <div className="text-sm font-medium">{room.label}</div>
            <div className="text-xs text-muted-foreground">{room.description}</div>
          </motion.div>
        </Html>
      )}
    </group>
  );
};

// Building structure component
const Building3D: React.FC<Map3DProps> = ({ 
  groundFloor, 
  firstFloor, 
  selectedRoom, 
  onRoomSelect, 
  highlightRoom 
}) => {
  const { camera } = useThree();
  
  // Camera presets
  const setCameraView = (preset: 'overview' | 'ground' | 'first') => {
    switch (preset) {
      case 'overview':
        camera.position.set(8, 6, 8);
        break;
      case 'ground':
        camera.position.set(0, 2, 6);
        break;
      case 'first':
        camera.position.set(0, 3, 6);
        break;
    }
  };

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5, 0]} intensity={0.4} />

      {/* Building base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[14, 0.2, 10]} />
        <meshLambertMaterial color="#d1d5db" />
      </mesh>

      {/* Ground floor rooms */}
      {groundFloor.rooms.map((room) => (
        <Room3D
          key={`ground-${room.id}`}
          room={room}
          floor={0}
          isSelected={selectedRoom === room.id}
          isHighlighted={highlightRoom === room.id}
          onClick={() => onRoomSelect(room.id)}
        />
      ))}

      {/* First floor rooms */}
      {firstFloor.rooms.map((room) => (
        <Room3D
          key={`first-${room.id}`}
          room={room}
          floor={1}
          isSelected={selectedRoom === room.id}
          isHighlighted={highlightRoom === room.id}
          onClick={() => onRoomSelect(room.id)}
        />
      ))}

      {/* Floor labels */}
      <Text
        position={[-6, 0.2, -4]}
        fontSize={0.3}
        color="#374151"
        anchorX="left"
      >
        Ground Floor
      </Text>
      
      <Text
        position={[-6, 0.7, -4]}
        fontSize={0.3}
        color="#374151"
        anchorX="left"
      >
        First Floor
      </Text>

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
};

const Map3D: React.FC<Map3DProps> = (props) => {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl overflow-hidden">
      {/* Camera Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button className="px-3 py-2 bg-background/90 backdrop-blur-sm border border-border 
                         rounded-lg text-sm hover:bg-accent transition-colors">
          Overview
        </button>
        <button className="px-3 py-2 bg-background/90 backdrop-blur-sm border border-border 
                         rounded-lg text-sm hover:bg-accent transition-colors">
          Ground Floor
        </button>
        <button className="px-3 py-2 bg-background/90 backdrop-blur-sm border border-border 
                         rounded-lg text-sm hover:bg-accent transition-colors">
          First Floor
        </button>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [8, 6, 8], fov: 60 }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <Building3D {...props} />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="bg-background/80 backdrop-blur-sm rounded-lg p-4"
        >
          <div className="text-sm text-muted-foreground">Loading 3D view...</div>
        </motion.div>
      </div>
    </div>
  );
};

export default Map3D;