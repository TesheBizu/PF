import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

function FloatingShape({ position, color, shape, scale = 1, speed = 0.5 }) {
  const ref = useRef(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * speed * 0.3;
      ref.current.rotation.y = clock.getElapsedTime() * speed * 0.5;
    }
  });

  let geometry;
  if (shape === 'icosahedron') geometry = <icosahedronGeometry args={[1, 0]} />;
  else if (shape === 'torus') geometry = <torusGeometry args={[0.8, 0.3, 16, 32]} />;
  else if (shape === 'octahedron') geometry = <octahedronGeometry args={[1, 0]} />;
  else geometry = <dodecahedronGeometry args={[1, 0]} />;

  return (
    <Float speed={1.5 * speed} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref} position={position} scale={scale}>
        {geometry}
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.8}
          distort={0.2}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

const SHAPES = [
  { position: [-5, -2, -5], color: '#3B82F6', shape: 'icosahedron', scale: 1.2, speed: 0.4 },
  { position: [6, 3, -8], color: '#60A5FA', shape: 'torus', scale: 0.9, speed: 0.6 },
  { position: [-4, 4, -10], color: '#2563EB', shape: 'dodecahedron', scale: 0.8, speed: 0.5 },
  { position: [5, -3, -12], color: '#93C5FD', shape: 'octahedron', scale: 0.7, speed: 0.7 },
  { position: [-3, -4, -6], color: '#3B82F6', shape: 'torus', scale: 0.6, speed: 0.3 },
  { position: [0, 5, -15], color: '#60A5FA', shape: 'icosahedron', scale: 1.4, speed: 0.35 },
];

function SceneContent() {
  const shapes = useMemo(() => SHAPES, []);
  return shapes.map((s, i) => (
    <FloatingShape key={i} {...s} />
  ));
}

export default function HeroBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <SceneContent />
      </Canvas>
    </div>
  );
}
