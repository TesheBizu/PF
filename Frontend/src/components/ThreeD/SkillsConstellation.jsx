import { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CATEGORY_COLORS } from '../../utils/skillCategories';
import { getSkillIcon } from '../../utils/skillIcons';

function SkillNode({ skill, position, color, isHovered, onHover, onLeave, category }) {
  const ref = useRef(null);
  const meshRef = useRef(null);
  const targetScale = isHovered ? 1.8 : 1;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.08
      );
    }
  });

  const Icon = getSkillIcon(skill.name);

  return (
    <group position={position}>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onPointerEnter={(e) => { e.stopPropagation(); onHover(skill._id); }}
          onPointerLeave={onLeave}
        >
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={isHovered ? 0.95 : 0.7}
            roughness={0.2}
            metalness={0.6}
            envMapIntensity={0.8}
          />
        </mesh>
      </Float>
      {isHovered && (
        <Html distanceFactor={6} center>
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            border: `1px solid ${color}40`,
            pointerEvents: 'none',
            transform: 'translateY(-30px)',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
          }}>
            <div style={{ color, fontSize: 11, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {skill.name}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>
              {skill.proficiency}% &middot; {category}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function ConnectingLine({ from, to, color, opacity = 0.2 }) {
  const points = useMemo(() => [
    new THREE.Vector3(from[0], from[1], from[2]),
    new THREE.Vector3(to[0], to[1], to[2]),
  ], [from, to]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

function SceneContent({ skills, hoveredId, onHover, onLeave }) {
  const { nodes, lines } = useMemo(() => {
    const n = [];
    const l = [];
    const radius = 3.5;
    const categories = [...new Set(skills.map((s) => s.category))];
    const sectorAngle = (2 * Math.PI) / Math.max(categories.length, 1);

    categories.forEach((cat, catIdx) => {
      const catSkills = skills.filter((s) => s.category === cat);
      const baseAngle = -Math.PI / 2 + catIdx * sectorAngle;
      const color = CATEGORY_COLORS[cat] || '#3B82F6';

      catSkills.forEach((skill, skIdx) => {
        const angle = baseAngle + ((skIdx - (catSkills.length - 1) / 2) * sectorAngle * 0.4);
        const r = 1.5 + catIdx * 0.5 + skIdx * 0.3;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        n.push({ skill, position: [x, 0, z], color, category: cat });

        if (skIdx > 0) {
          const prev = catSkills[skIdx - 1];
          const prevPos = n.find((p) => p.skill._id === prev._id)?.position;
          if (prevPos) {
            l.push({ from: prevPos, to: [x, 0, z], color });
          }
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
    <div style={{ width: '100%', height: 500, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 4, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={0.3} color="#3B82F6" />
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
