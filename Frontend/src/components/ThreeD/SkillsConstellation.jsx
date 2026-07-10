import { useRef, useMemo, useState, useCallback, createElement } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { CATEGORY_COLORS } from '../../utils/skillCategories';
import { getSkillIcon } from '../../utils/skillIcons';

const CATEGORY_GEOM = {
  Programming: <octahedronGeometry args={[0.28, 0]} />,
  Frontend: <boxGeometry args={[0.4, 0.4, 0.4]} />,
  Backend: <cylinderGeometry args={[0.18, 0.28, 0.45, 8]} />,
  Database: <torusGeometry args={[0.22, 0.08, 8, 16]} />,
  Tools: <dodecahedronGeometry args={[0.28, 0]} />,
  Other: <icosahedronGeometry args={[0.28, 0]} />,
};

function HolographicRing({ color, radius = 0.55, speed = 0.8, offset = 0 }) {
  const ref = useRef(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * speed + offset;
    }
  });
  return (
    <mesh ref={ref}>
      <ringGeometry args={[radius - 0.03, radius, 48]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
  );
}

function SkillNode({ skill, position, color, isHovered, onHover, onLeave, category }) {
  const meshRef = useRef(null);
  const glowRef = useRef(null);
  const ringRef = useRef(null);
  const hologramRef = useRef(null);
  const targetScale = isHovered ? 1.7 : 1;
  const Icon = getSkillIcon(skill.name);
  const geom = CATEGORY_GEOM[category] || <sphereGeometry args={[0.22, 16, 16]} />;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.05
      );
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = t * 1.5;
      const s = 1 + Math.sin(t * 2.5) * 0.06;
      glowRef.current.scale.set(s, s, s);
      glowRef.current.material.opacity = 0.08 + Math.sin(t * 2) * 0.04;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.6) * 0.1;
      ringRef.current.rotation.z = t * 0.5;
    }
    if (hologramRef.current) {
      hologramRef.current.material.opacity = 0.15 + Math.sin(t * 3) * 0.06;
    }
  });

  return (
    <group position={position}>
      {/* Holographic glow ring */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.6, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Orbital scanning ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.5, 0.52, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer holographic ring */}
      <HolographicRing color={color} radius={0.6} speed={0.6} offset={0} />
      <HolographicRing color={color} radius={0.52} speed={-0.4} offset={1.2} />

      {/* Core shape — holographic material */}
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.35}>
        <mesh
          ref={meshRef}
          onPointerEnter={(e) => { e.stopPropagation(); onHover(skill._id); }}
          onPointerLeave={onLeave}
        >
          {geom}
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={isHovered ? 0.95 : 0.55}
            roughness={0.05}
            metalness={0.3}
            envMapIntensity={0.8}
            clearcoat={0.6}
            clearcoatRoughness={0.2}
            emissive={color}
            emissiveIntensity={isHovered ? 0.3 : 0.08}
          />
        </mesh>
      </Float>

      {/* Holographic wireframe shell */}
      <mesh ref={hologramRef} scale={[1.25, 1.25, 1.25]}>
        {geom}
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.12}
          wireframe
        />
      </mesh>

      {/* Icon sprite — holographic badge */}
      <Html distanceFactor={7} center>
        <div style={{
          transform: `translateY(-20px) scale(${isHovered ? 1.2 : 1})`,
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0.6,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: isHovered ? `drop-shadow(0 0 12px ${color}80)` : 'none',
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(145deg, ${color}30, ${color}08)`,
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            fontSize: 17,
            lineHeight: 1,
            backdropFilter: 'blur(6px)',
            boxShadow: `0 2px 16px ${color}20, inset 0 1px 0 ${color}20`,
          }}>
            {createElement(Icon, { size: 17 })}
          </div>
        </div>
      </Html>

      {/* Label */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.12}
        color={color}
        opacity={isHovered ? 0.95 : 0.35}
        anchorX="center"
        anchorY="top"
        fontWeight={600}
      >
        {skill.name}
      </Text>

      {/* Hover detail panel */}
      {isHovered && (
        <Html distanceFactor={5} center>
          <div style={{
            background: 'rgba(8, 11, 20, 0.88)',
            backdropFilter: 'blur(12px)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            transform: 'translateY(-44px)',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            border: `1px solid ${color}40`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 ${color}20`,
            minWidth: 120,
          }}>
            <div style={{ color, fontSize: 10, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {skill.name}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', fontSize: 11, color: '#94a3b8' }}>
              <span>{skill.proficiency}% proficiency</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ color }}>{category}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function ConnectingLine({ from, to, color }) {
  const ref = useRef(null);
  const points = useMemo(() => [
    new THREE.Vector3(from[0], from[1], from[2]),
    new THREE.Vector3(to[0], to[1], to[2]),
  ], [from, to]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.06 + Math.sin(clock.getElapsedTime() * 0.8) * 0.04;
    }
  });

  return (
    <line ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.1} />
    </line>
  );
}

function SceneContent({ skills, hoveredId, onHover, onLeave }) {
  const { nodes, lines } = useMemo(() => {
    const n = [];
    const l = [];
    const categories = [...new Set(skills.map((s) => s.category))];
    const sectorAngle = (2 * Math.PI) / Math.max(categories.length, 1);

    categories.forEach((cat, catIdx) => {
      const catSkills = skills.filter((s) => s.category === cat);
      const baseAngle = -Math.PI / 2 + catIdx * sectorAngle;
      const color = CATEGORY_COLORS[cat] || '#3B82F6';

      catSkills.forEach((skill, skIdx) => {
        const angle = baseAngle + ((skIdx - (catSkills.length - 1) / 2) * sectorAngle * 0.35);
        const r = 1.6 + catIdx * 0.35 + skIdx * 0.2;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        n.push({ skill, position: [x, 0, z], color, category: cat });

        if (skIdx > 0) {
          const prev = catSkills[skIdx - 1];
          const prevPos = n.find((p) => p.skill._id === prev._id)?.position;
          if (prevPos) l.push({ from: prevPos, to: [x, 0, z], color });
        }
      });
    });

    return { nodes: n, lines: l };
  }, [skills]);

  return (
    <group>
      {nodes.map((node) => (
        <SkillNode
          key={node.skill._id}
          skill={node.skill}
          position={node.position}
          color={node.color}
          category={node.category}
          isHovered={hoveredId === node.skill._id}
          onHover={onHover}
          onLeave={onLeave}
        />
      ))}
      {lines.map((line, i) => (
        <ConnectingLine key={i} from={line.from} to={line.to} color={line.color} />
      ))}
    </group>
  );
}

export default function SkillsConstellation({ skills }) {
  const [hoveredId, setHoveredId] = useState(null);
  const onHover = useCallback((id) => setHoveredId(id), []);
  const onLeave = useCallback(() => setHoveredId(null), []);

  if (!skills.length) return null;

  return (
    <div style={{ width: '100%', height: 480, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 3.8, 5.8], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        <directionalLight position={[-5, -5, -5]} intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={0.15} color="#3B82F6" />
        <SceneContent
          skills={skills}
          hoveredId={hoveredId}
          onHover={onHover}
          onLeave={onLeave}
        />
      </Canvas>
    </div>
  );
}
