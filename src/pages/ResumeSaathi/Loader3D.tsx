import { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls } from "@react-three/drei";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import * as THREE from "three";

const RotatingCube = ({ color }: { color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const FloatingText = ({ text, position }: { text: string; position: [number, number, number] }) => {
  const textRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={0.5}
      color="#6366f1"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
};

const motivationalQuotes = [
  "Your future job is one resume away.",
  "We're shaping your story — almost there.",
  "Great resumes open doors. Yours will too.",
  "Polishing your profile — hold tight!",
  "Success starts with a perfect resume.",
  "Crafting your professional identity...",
  "Building your career foundation...",
  "Your dream job awaits this resume.",
];

export const Loader3D = () => {
  const [progress, setProgress] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl mx-4">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-gradient">
              Creating Your Perfect Resume
            </h2>
            
            <div className="h-64 w-full">
              <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                
                <RotatingCube color="#8b5cf6" />
                <FloatingText text="ATS" position={[-3, 1, 0]} />
                <FloatingText text="Optimized" position={[3, -1, 0]} />
                <FloatingText text="Professional" position={[0, 2.5, 0]} />
                
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
              </Canvas>
            </div>

            <div className="space-y-4">
              <div className="text-lg font-medium text-muted-foreground animate-pulse">
                {motivationalQuotes[currentQuote]}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="text-sm text-muted-foreground">
                Analyzing content • Optimizing format • Generating PDF
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};