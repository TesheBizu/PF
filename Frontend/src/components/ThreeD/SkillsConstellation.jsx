import { useRef, useMemo, useState, useCallback, createElement } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { CATEGORY_COLORS } from '../../utils/skillCategories';
import { getSkillIcon } from '../../utils/skillIcons';

/* ── Category → geometry mapping for visual variety ── */
const CATEGORY_GEOM = {
  Programming: <octahedronGeometry args={[0.3, 0]} />,
  Frontend: <boxGeometry args={[0.45, 0.45, 0.45]} />,
  Backend: <cylinderGeometry args={[0.2, 0.3, 0.5, 8]} />,
  Database: <torusGeometry args={[0.25, 0.1, 8, 16]} />,
  Tools: <dodecahedronGeometry args={[0.3, 0]} />,
  Other: <icosahedronGeometry args={[0.3, 0]} />,
};

function SkillNode({ skill, position, color, isHovered, onHover, onLeave, category }) {
  const meshRef = useRef(null);
  const glowRef = useRef(null);
  const targetScale = isHovered ? 1.6 : 1;
  const Icon = getSkillIcon(skill.name);
  const geom = CATEGORY_GEOM[category] || <sphereGeometry args={[0.25, 16, 16]} />;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.06
      );
    }
    if (glowRef.current) {
      glowRef.current.rotation.y = clock.getElapsedTime() * 1.2;
      const s = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      {/* Glow ring */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={isHovered ? 0.3 : 0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Orbital ring (inner) */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[0.35, 0.38, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>

      {/* Core shape */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh
          ref={meshRef}
          onPointerEnter={(e) => { e.stopPropagation(); onHover(skill._id); }}
          onPointerLeave={onLeave}
        >
          {geom}
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={isHovered ? 1 : 0.75}
            roughness={0.15}
            metalness={0.8}
            envMapIntensity={1.2}
            clearcoat={0.3}
          />
        </mesh>
      </Float>

      {/* Skill icon as sprite */}
      <Html distanceFactor={8} center>
        <div style={{
          transform: 'translateY(-18px)',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.3s ease',
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            fontSize: 14,
            lineHeight: 1,
          }}>
            {createElement(Icon, { size: 16 })}
          </div>
        </div>
      </Html>

      {/* Label below */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.12}
        color={color}
        opacity={isHovered ? 0.9 : 0.4}
        anchorX="center"
        anchorY="top"
      >
        {skill.name}
      </Text>

      {/* Hover tooltip */}
      {isHovered && (
        <Html distanceFactor={6} center>
          <div style={{
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            transform: 'translateY(-40px)',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            border: `1px solid ${color}30`,
          }}>
            <div style={{ color, fontSize: 10, fontWeight: 700, marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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

function ConnectingLine({ from, to, color, opacity = 0.15 }) {
  const points = useMemo(() => [
    new THREE.Vector3(from[0], from[1], from[2]),
    new THREE.Vector3(to[0], to[1], to[2]),
  ], [from, to]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

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
    const categories = [...new Set(skills.map((s) => s.category))];
    const sectorAngle = (2 * Math.PI) / Math.max(categories.length, 1);

    categories.forEach((cat, catIdx) => {
      const catSkills = skills.filter((s) => s.category === cat);
      const baseAngle = -Math.PI / 2 + catIdx * sectorAngle;
      const color = CATEGORY_COLORS[cat] || '#3B82F6';

      catSkills.forEach((skill, skIdx) => {
        const angle = baseAngle + ((skIdx - (catSkills.length - 1) / 2) * sectorAngle * 0.35);
        const r = 1.8 + catIdx * 0.4 + skIdx * 0.25;
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
        camera={{ position: [0, 3.5, 5.5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={0.2} color="#3B82F6" />
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
