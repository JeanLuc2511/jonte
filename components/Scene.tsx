'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Grid, OrbitControls, RoundedBox } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { PALETTE } from '@/lib/constants';
import { levelToY } from '@/lib/quadro';
import type { BuiltModel, Coord, ModelDef, Side, TubeLen } from '@/lib/types';

const ACCENT = PALETTE.accent;
const TUBE_R = 0.055;

/** Gitterkoordinate → Position in der Szene (x=i, y=Höhe, z=j). */
function coordToVec(c: Coord, levelHeights: TubeLen[]): THREE.Vector3 {
  return new THREE.Vector3(c[0], levelToY(levelHeights, c[2]), c[1]);
}

function darken(hex: number, f = 0.7): THREE.Color {
  return new THREE.Color(hex).multiplyScalar(f);
}

/** Pulsierendes Aufleuchten der Teile des aktuellen Schritts. */
function useGlow(
  matRef: React.RefObject<THREE.MeshStandardMaterial | null>,
  highlight: boolean,
  reducedMotion: boolean,
) {
  useFrame((state) => {
    if (!highlight) return;
    const m = matRef.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.emissiveIntensity = reducedMotion ? 0.5 : 0.36 + 0.32 * (0.5 + 0.5 * Math.sin(t * 3.4));
  });
}

interface PartProps {
  highlight: boolean;
  reducedMotion: boolean;
}

function Tube({
  a,
  b,
  color,
  highlight,
  reducedMotion,
  levelHeights,
}: PartProps & { a: Coord; b: Coord; color: number; levelHeights: TubeLen[] }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useGlow(matRef, highlight, reducedMotion);

  const { position, quaternion, length } = useMemo(() => {
    const va = coordToVec(a, levelHeights);
    const vb = coordToVec(b, levelHeights);
    const dir = new THREE.Vector3().subVectors(vb, va);
    const len = dir.length();
    const pos = new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return { position: pos, quaternion: quat, length: len };
  }, [a, b, levelHeights]);

  return (
    <mesh position={position} quaternion={quaternion} scale={[1, length, 1]}>
      <cylinderGeometry args={[TUBE_R, TUBE_R, 1, 14]} />
      <meshStandardMaterial
        ref={matRef}
        color={highlight ? color : darken(color)}
        emissive={ACCENT}
        emissiveIntensity={highlight ? 0.5 : 0}
        roughness={0.4}
        metalness={0.04}
      />
    </mesh>
  );
}

function Node({
  pos,
  highlight,
  reducedMotion,
}: PartProps & { pos: THREE.Vector3 }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useGlow(matRef, highlight, reducedMotion);
  return (
    <RoundedBox args={[0.2, 0.2, 0.2]} radius={0.045} smoothness={2} position={pos}>
      <meshStandardMaterial
        ref={matRef}
        color={highlight ? '#2b2f3a' : '#191b22'}
        emissive={ACCENT}
        emissiveIntensity={highlight ? 0.5 : 0}
        roughness={0.6}
        metalness={0.15}
      />
    </RoundedBox>
  );
}

function Plate({
  pos,
  color,
  highlight,
  reducedMotion,
}: PartProps & { pos: THREE.Vector3; color: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useGlow(matRef, highlight, reducedMotion);
  return (
    <mesh position={pos}>
      <boxGeometry args={[0.92, 0.07, 0.92]} />
      <meshStandardMaterial
        ref={matRef}
        color={highlight ? color : darken(color)}
        emissive={ACCENT}
        emissiveIntensity={highlight ? 0.5 : 0}
        roughness={0.5}
        metalness={0.05}
      />
    </mesh>
  );
}

function Slide({
  platformY,
  w,
  d,
  side,
  highlight,
  reducedMotion,
}: PartProps & { platformY: number; w: number; d: number; side: Side }) {
  const matRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  useFrame((state) => {
    if (!highlight) return;
    const t = state.clock.elapsedTime;
    const v = reducedMotion ? 0.5 : 0.36 + 0.32 * (0.5 + 0.5 * Math.sin(t * 3.4));
    for (const m of matRefs.current) if (m) m.emissiveIntensity = v;
  });

  const { mid, quat, length } = useMemo(() => {
    const py = platformY;
    let edge: THREE.Vector3;
    let outward: THREE.Vector3;
    if (side === 'front') {
      edge = new THREE.Vector3(w / 2, py, d);
      outward = new THREE.Vector3(0, 0, 1);
    } else if (side === 'back') {
      edge = new THREE.Vector3(w / 2, py, 0);
      outward = new THREE.Vector3(0, 0, -1);
    } else if (side === 'left') {
      edge = new THREE.Vector3(0, py, d / 2);
      outward = new THREE.Vector3(-1, 0, 0);
    } else {
      edge = new THREE.Vector3(w, py, d / 2);
      outward = new THREE.Vector3(1, 0, 0);
    }
    const run = py * 0.9 + 0.65;
    const top = edge.clone().add(outward.clone().multiplyScalar(0.15)).add(new THREE.Vector3(0, -0.03, 0));
    const bottom = new THREE.Vector3(
      edge.x + outward.x * run,
      0.07,
      edge.z + outward.z * run,
    );
    const dir = bottom.clone().sub(top);
    const len = dir.length();
    const center = top.clone().add(bottom).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      dir.clone().normalize(),
    );
    return { mid: center, quat: q, length: len };
  }, [platformY, w, d, side]);

  const setRef = (i: number) => (m: THREE.MeshStandardMaterial | null) => {
    matRefs.current[i] = m;
  };

  return (
    <group position={mid} quaternion={quat}>
      {/* Rutschbahn */}
      <mesh>
        <boxGeometry args={[0.82, 0.06, length]} />
        <meshStandardMaterial
          ref={setRef(0)}
          color="#cfd7e2"
          emissive={ACCENT}
          emissiveIntensity={highlight ? 0.5 : 0}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>
      {/* seitliche Leisten */}
      {[-0.42, 0.42].map((x, i) => (
        <mesh key={x} position={[x, 0.09, 0]}>
          <boxGeometry args={[0.07, 0.16, length]} />
          <meshStandardMaterial
            ref={setRef(1 + i)}
            color={0x0061b0}
            emissive={ACCENT}
            emissiveIntensity={highlight ? 0.5 : 0}
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

const C1 = 1.70158;
const C3 = C1 + 1;
function easeOutBack(t: number): number {
  return 1 + C3 * Math.pow(t - 1, 3) + C1 * Math.pow(t - 1, 2);
}

/** Hüpf-Einblendung der neuen Teile bei jedem Schrittwechsel. */
function Pop({ children, disabled }: { children: React.ReactNode; disabled: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const p = useRef(0);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (disabled) {
      g.scale.setScalar(1);
      g.position.y = 0;
      return;
    }
    p.current = Math.min(1, p.current + dt * 2.8);
    const e = easeOutBack(p.current);
    g.scale.setScalar(0.78 + 0.22 * e);
    g.position.y = (1 - p.current) * 0.22;
  });
  return <group ref={ref}>{children}</group>;
}

function ModelGroup({
  model,
  built,
  step,
  reducedMotion,
}: {
  model: ModelDef;
  built: BuiltModel;
  step: number;
  reducedMotion: boolean;
}) {
  const lh = model.levelHeights;
  const { w, d } = model.base;
  const platformY = levelToY(lh, model.platformAt);

  const renderPart = (
    p: BuiltModel['parts'][number],
    key: string,
    highlight: boolean,
  ) => {
    switch (p.type) {
      case 'tube':
        return (
          <Tube
            key={key}
            a={p.a!}
            b={p.b!}
            color={p.color!}
            levelHeights={lh}
            highlight={highlight}
            reducedMotion={reducedMotion}
          />
        );
      case 'node':
        return (
          <Node
            key={key}
            pos={coordToVec(p.a!, lh)}
            highlight={highlight}
            reducedMotion={reducedMotion}
          />
        );
      case 'plate': {
        const [i, j, k] = p.a!;
        const plateColor = (i + j) % 2 === 0 ? 0x0061b0 : 0xffc60b;
        const pos = new THREE.Vector3(i + 0.5, levelToY(lh, k) + 0.02, j + 0.5);
        return (
          <Plate
            key={key}
            pos={pos}
            color={plateColor}
            highlight={highlight}
            reducedMotion={reducedMotion}
          />
        );
      }
      case 'slide':
        return (
          <Slide
            key={key}
            platformY={platformY}
            w={w}
            d={d}
            side={p.side ?? 'front'}
            highlight={highlight}
            reducedMotion={reducedMotion}
          />
        );
      default:
        return null;
    }
  };

  const builtParts = built.parts.filter((p) => p.step < step);
  const currentParts = built.parts.filter((p) => p.step === step);

  return (
    <group position={[-w / 2, 0, -d / 2]}>
      {builtParts.map((p, idx) => renderPart(p, `b${idx}`, false))}
      <Pop key={step} disabled={reducedMotion}>
        {currentParts.map((p, idx) => renderPart(p, `c${idx}`, true))}
      </Pop>
    </group>
  );
}

interface OrbitLike {
  target: THREE.Vector3;
  update: () => void;
}

function CameraRig({ model, resetKey }: { model: ModelDef; resetKey: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as OrbitLike | null;

  const home = useMemo(() => {
    const { w, d } = model.base;
    const top = levelToY(model.levelHeights, model.levelHeights.length);
    const target = new THREE.Vector3(0, Math.max(0.5, top * 0.42), 0);
    const radius = Math.max(w, d, top) + 1.2;
    const pos = new THREE.Vector3(w * 0.5 + 1.3, top * 0.7 + 1.5, d * 0.55 + radius * 1.1 + 1.4);
    return { target, pos };
  }, [model]);

  useEffect(() => {
    camera.position.copy(home.pos);
    if (controls) {
      controls.target.copy(home.target);
      controls.update();
    } else {
      camera.lookAt(home.target);
    }
  }, [home, resetKey, camera, controls]);

  return null;
}

function Lights() {
  return (
    <>
      <hemisphereLight args={[0xffffff, 0x222732, 0.6]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 9, 4]} intensity={1.2} />
      <directionalLight position={[-5, 4, -3]} intensity={0.35} color={0x88aaff} />
    </>
  );
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#11131a" roughness={1} metalness={0} />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#2a2e37"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#3a4150"
        fadeDistance={22}
        fadeStrength={2}
        infiniteGrid
      />
    </>
  );
}

export default function Scene({
  model,
  built,
  step,
  autoRotate,
  resetKey,
  reducedMotion,
}: {
  model: ModelDef;
  built: BuiltModel;
  step: number;
  autoRotate: boolean;
  resetKey: number;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 42, near: 0.1, far: 100, position: [4, 4, 8] }}
      style={{ touchAction: 'none' }}
      frameloop="always"
    >
      <color attach="background" args={[PALETTE.bg]} />
      <fog attach="fog" args={[PALETTE.bg, 10, 26]} />
      <Lights />
      <Ground />
      <ModelGroup model={model} built={built} step={step} reducedMotion={reducedMotion} />
      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.55}
        scale={20}
        blur={2.6}
        far={10}
        resolution={1024}
        color="#000000"
      />
      <CameraRig model={model} resetKey={resetKey} />
      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.7}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.6}
        maxDistance={18}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 - 0.02}
      />
    </Canvas>
  );
}
