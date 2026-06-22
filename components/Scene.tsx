'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Grid, OrbitControls, RoundedBox } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { PALETTE } from '@/lib/constants';
import { levelToY } from '@/lib/quadro';
import type { BuiltModel, Connector, Coord, Dir, ModelDef, Side, TubeLen } from '@/lib/types';

const ACCENT = PALETTE.accent;
const TUBE_R = 0.058;
const UP = new THREE.Vector3(0, 1, 0);

const DIRVEC: Record<Dir, THREE.Vector3> = {
  px: new THREE.Vector3(1, 0, 0),
  nx: new THREE.Vector3(-1, 0, 0),
  py: new THREE.Vector3(0, 1, 0),
  ny: new THREE.Vector3(0, -1, 0),
  pz: new THREE.Vector3(0, 0, 1),
  nz: new THREE.Vector3(0, 0, -1),
};

function coordToVec(c: Coord, lh: TubeLen[]): THREE.Vector3 {
  return new THREE.Vector3(c[0], levelToY(lh, c[2]), c[1]);
}
const keyOf = (c: Coord) => `${c[0]},${c[1]},${c[2]}`;
function darken(hex: number, f = 0.62): THREE.Color {
  return new THREE.Color(hex).multiplyScalar(f);
}

function pulse(t: number, base: number, reduced: boolean) {
  return reduced ? base + 0.15 : base + 0.3 * (0.5 + 0.5 * Math.sin(t * 3.6));
}

/* ---------- Stab (Rohr) ---------- */
function Rod({
  a,
  b,
  color,
  current,
  reducedMotion,
  levelHeights,
}: {
  a: Coord;
  b: Coord;
  color: number;
  current: boolean;
  reducedMotion: boolean;
  levelHeights: TubeLen[];
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((s) => {
    if (!current) return;
    const m = matRef.current;
    if (m) m.emissiveIntensity = pulse(s.clock.elapsedTime, 0.5, reducedMotion);
  });
  const { position, quaternion, length } = useMemo(() => {
    const va = coordToVec(a, levelHeights);
    const vb = coordToVec(b, levelHeights);
    const dir = new THREE.Vector3().subVectors(vb, va);
    const len = dir.length();
    return {
      position: new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: len,
    };
  }, [a, b, levelHeights]);
  return (
    <mesh position={position} quaternion={quaternion} scale={[1, length, 1]}>
      <cylinderGeometry args={[TUBE_R, TUBE_R, 1, 14]} />
      <meshStandardMaterial
        ref={matRef}
        color={current ? color : darken(color)}
        emissive={ACCENT}
        emissiveIntensity={current ? 0.5 : 0}
        roughness={0.4}
        metalness={0.05}
      />
    </mesh>
  );
}

/* ---------- Verbinder ---------- */
function ConnectorMesh({
  pos,
  dirs,
  glow,
  reducedMotion,
}: {
  pos: THREE.Vector3;
  dirs: Dir[];
  glow: number; // 0 = gebaut, 1 = Endknoten des aktuellen Stabs, 2 = neu
  reducedMotion: boolean;
}) {
  const mat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(glow > 0 ? '#3b4150' : '#191c23'),
      emissive: new THREE.Color(ACCENT),
      emissiveIntensity: glow > 0 ? 0.4 : 0,
      roughness: 0.6,
      metalness: 0.25,
    });
  }, [glow]);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame((s) => {
    if (glow <= 0) return;
    mat.emissiveIntensity = pulse(s.clock.elapsedTime, glow === 2 ? 0.55 : 0.34, reducedMotion);
  });

  const stubs = useMemo(
    () =>
      dirs.map((dir) => {
        const v = DIRVEC[dir];
        return {
          dir,
          position: v.clone().multiplyScalar(0.135),
          quaternion: new THREE.Quaternion().setFromUnitVectors(UP, v),
        };
      }),
    [dirs],
  );

  return (
    <group position={pos}>
      <RoundedBox args={[0.21, 0.21, 0.21]} radius={0.045} smoothness={2} material={mat} />
      {stubs.map((s) => (
        <mesh key={s.dir} position={s.position} quaternion={s.quaternion} material={mat}>
          <cylinderGeometry args={[0.088, 0.088, 0.17, 12]} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Platte ---------- */
function Plate({
  pos,
  color,
  current,
  reducedMotion,
}: {
  pos: THREE.Vector3;
  color: number;
  current: boolean;
  reducedMotion: boolean;
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((s) => {
    if (!current) return;
    const m = matRef.current;
    if (m) m.emissiveIntensity = pulse(s.clock.elapsedTime, 0.5, reducedMotion);
  });
  return (
    <mesh position={pos}>
      <boxGeometry args={[0.92, 0.07, 0.92]} />
      <meshStandardMaterial
        ref={matRef}
        color={current ? color : darken(color, 0.7)}
        emissive={ACCENT}
        emissiveIntensity={current ? 0.5 : 0}
        roughness={0.5}
        metalness={0.05}
      />
    </mesh>
  );
}

/* ---------- Rutsche (modular) ---------- */
function slidePath(platformY: number, w: number, d: number, side: Side) {
  let edge: THREE.Vector3;
  let outward: THREE.Vector3;
  if (side === 'front') {
    edge = new THREE.Vector3(w / 2, platformY, d);
    outward = new THREE.Vector3(0, 0, 1);
  } else if (side === 'back') {
    edge = new THREE.Vector3(w / 2, platformY, 0);
    outward = new THREE.Vector3(0, 0, -1);
  } else if (side === 'left') {
    edge = new THREE.Vector3(0, platformY, d / 2);
    outward = new THREE.Vector3(-1, 0, 0);
  } else {
    edge = new THREE.Vector3(w, platformY, d / 2);
    outward = new THREE.Vector3(1, 0, 0);
  }
  const run = platformY * 0.9 + 0.8;
  const top = edge.clone().add(outward.clone().multiplyScalar(0.12)).add(new THREE.Vector3(0, -0.03, 0));
  const bottom = new THREE.Vector3(edge.x + outward.x * run, 0.07, edge.z + outward.z * run);
  const mid = new THREE.Vector3(edge.x + outward.x * run * 0.45, platformY * 0.52, edge.z + outward.z * run * 0.45);
  return { top, mid, bottom };
}

function SlideSeg({
  from,
  to,
  current,
  reducedMotion,
  width,
  bedColor,
  railColor,
  runout,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  current: boolean;
  reducedMotion: boolean;
  width: number;
  bedColor: number | string;
  railColor: number | string;
  runout: boolean;
}) {
  const refs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  useFrame((s) => {
    if (!current) return;
    const v = pulse(s.clock.elapsedTime, 0.5, reducedMotion);
    for (const m of refs.current) if (m) m.emissiveIntensity = v;
  });
  const { mid, quat, length } = useMemo(() => {
    const dir = to.clone().sub(from);
    return {
      mid: from.clone().add(to).multiplyScalar(0.5),
      quat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize()),
      length: dir.length(),
    };
  }, [from, to]);
  const setRef = (i: number) => (m: THREE.MeshStandardMaterial | null) => {
    refs.current[i] = m;
  };
  const half = width / 2 - 0.05;
  return (
    <group position={mid} quaternion={quat}>
      <mesh>
        <boxGeometry args={[width, 0.07, length]} />
        <meshStandardMaterial ref={setRef(0)} color={bedColor} emissive={ACCENT} emissiveIntensity={current ? 0.5 : 0} roughness={0.4} />
      </mesh>
      {[-half, half].map((x, i) => (
        <mesh key={x} position={[x, 0.1, 0]}>
          <boxGeometry args={[0.08, 0.2, length]} />
          <meshStandardMaterial ref={setRef(1 + i)} color={railColor} emissive={ACCENT} emissiveIntensity={current ? 0.5 : 0} roughness={0.45} />
        </mesh>
      ))}
      {runout && (
        <mesh position={[0, 0.07, length / 2 + 0.16]}>
          <boxGeometry args={[width, 0.18, 0.55]} />
          <meshStandardMaterial ref={setRef(3)} color={0xffc60b} emissive={ACCENT} emissiveIntensity={current ? 0.5 : 0} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

/* ---------- Modell-Gruppe ---------- */
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
  const slideFromY = model.slide ? levelToY(lh, model.slide.fromLevel) : levelToY(lh, model.platformAt);
  const cur = built.steps[step];

  const endpointKeys = useMemo(() => {
    const set = new Set<string>();
    if (cur?.kind === 'rod') {
      const r = built.rods[cur.ref];
      set.add(keyOf(r.a));
      set.add(keyOf(r.b));
    }
    return set;
  }, [cur, built.rods]);

  const path = useMemo(
    () => (model.slide ? slidePath(slideFromY, w, d, model.slide.side) : null),
    [model.slide, slideFromY, w, d],
  );

  return (
    <group position={[-w / 2, 0, -d / 2]}>
      {/* Verbinder */}
      {built.connectors
        .filter((c: Connector) => c.step <= step)
        .map((c) => {
          const glow = c.step === step ? 2 : endpointKeys.has(c.key) ? 1 : 0;
          return <ConnectorMesh key={c.key} pos={coordToVec(c.pos, lh)} dirs={c.dirs} glow={glow} reducedMotion={reducedMotion} />;
        })}

      {/* Stäbe */}
      {built.rods
        .filter((r) => r.step <= step)
        .map((r, i) => (
          <Rod
            key={i}
            a={r.a}
            b={r.b}
            color={r.color}
            current={r.step === step}
            reducedMotion={reducedMotion}
            levelHeights={lh}
          />
        ))}

      {/* Platten */}
      {built.plates
        .filter((p) => p.step <= step)
        .map((p, i) => (
          <Plate
            key={i}
            pos={new THREE.Vector3(p.a[0] + 0.5, levelToY(lh, p.a[2]) + 0.02, p.a[1] + 0.5)}
            color={p.color}
            current={p.step === step}
            reducedMotion={reducedMotion}
          />
        ))}

      {/* Rutsche */}
      {path &&
        built.slide
          .filter((seg) => seg.step <= step)
          .map((seg, i) => {
            const modular = built.slide.length >= 2;
            const from = !modular ? path.top : seg.kind === 'head' ? path.top : path.mid;
            const to = !modular ? path.bottom : seg.kind === 'head' ? path.mid : path.bottom;
            return (
              <SlideSeg
                key={i}
                from={from}
                to={to}
                current={seg.step === step}
                reducedMotion={reducedMotion}
                width={modular ? 1.7 : 0.84}
                bedColor={modular ? 0xe2231a : '#cfd7e2'}
                railColor={modular ? 0x9a1410 : 0x0061b0}
                runout={modular && seg.kind === 'chute'}
              />
            );
          })}
    </group>
  );
}

/* ---------- Kamera ---------- */
function Controls({
  model,
  autoRotate,
  resetKey,
  reducedMotion,
}: {
  model: ModelDef;
  autoRotate: boolean;
  resetKey: number;
  reducedMotion: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const ref = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  const home = useMemo(() => {
    const lh = model.levelHeights;
    const { w, d } = model.base;
    const top = levelToY(lh, lh.length);
    const platformY = model.slide ? levelToY(lh, model.slide.fromLevel) : levelToY(lh, model.platformAt);
    const reach = model.slide ? platformY * 0.9 + 0.8 : 0;
    const sizeX = w;
    const sizeY = Math.max(top, 1);
    const sizeZ = d + reach;
    const radius = 0.5 * Math.sqrt(sizeX * sizeX + sizeY * sizeY + sizeZ * sizeZ);
    const target = new THREE.Vector3(0, Math.max(0.55, top / 2), reach / 2);
    const dist = radius * 1.95 + 1.2;
    const pos = target.clone().add(new THREE.Vector3(0.7, 0.62, 1).normalize().multiplyScalar(dist));
    return { target, pos };
  }, [model]);

  useEffect(() => {
    camera.position.copy(home.pos);
    const c = ref.current;
    if (c) {
      c.target.copy(home.target);
      c.update();
    } else {
      camera.lookAt(home.target);
    }
  }, [home, resetKey, camera]);

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      autoRotate={autoRotate && !reducedMotion}
      autoRotateSpeed={0.7}
      enableDamping
      dampingFactor={0.08}
      minDistance={1.6}
      maxDistance={26}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI / 2 - 0.02}
    />
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={[0xffffff, 0x222732, 0.6]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 10, 4]} intensity={1.2} />
      <directionalLight position={[-5, 4, -3]} intensity={0.35} color={0x88aaff} />
    </>
  );
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#11131a" roughness={1} metalness={0} />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={[44, 44]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#2a2e37"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#3a4150"
        fadeDistance={26}
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
      role="img"
      aria-label={`3D-Ansicht: ${model.name}, Schritt ${step + 1}`}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 42, near: 0.1, far: 120, position: [5, 5, 9] }}
      style={{ touchAction: 'none' }}
      frameloop="always"
    >
      <color attach="background" args={[PALETTE.bg]} />
      <fog attach="fog" args={[PALETTE.bg, 12, 32]} />
      <Lights />
      <Ground />
      <ModelGroup model={model} built={built} step={step} reducedMotion={reducedMotion} />
      <ContactShadows position={[0, 0.012, 0]} opacity={0.5} scale={24} blur={2.6} far={12} resolution={1024} color="#000000" />
      <Controls model={model} autoRotate={autoRotate} resetKey={resetKey} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
