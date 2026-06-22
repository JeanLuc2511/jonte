import { buildModel, levelToY } from '@/lib/quadro';
import type { Coord, ModelDef, TubeLen } from '@/lib/types';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

// Isometrische 2D-Projektion einer Gitterkoordinate.
function iso(i: number, j: number, y: number): [number, number] {
  return [(i - j) * 0.866, (i + j) * 0.5 - y];
}

function projCoord(c: Coord, lh: TubeLen[]): [number, number] {
  return iso(c[0], c[1], levelToY(lh, c[2]));
}

export default function ModelPreview({ model, className }: { model: ModelDef; className?: string }) {
  const lh = model.levelHeights;
  const { w, d } = model.base;
  const built = buildModel(model);

  type Line = { x1: number; y1: number; x2: number; y2: number; color: string; depth: number; vertical: boolean };
  const lines: Line[] = [];
  const nodes: { x: number; y: number }[] = [];
  const pts: [number, number][] = [];

  for (const p of built.parts) {
    if (p.type === 'tube' && p.a && p.b) {
      const [x1, y1] = projCoord(p.a, lh);
      const [x2, y2] = projCoord(p.b, lh);
      pts.push([x1, y1], [x2, y2]);
      lines.push({
        x1,
        y1,
        x2,
        y2,
        color: hex(p.color ?? 0x888888),
        depth: (y1 + y2) / 2,
        vertical: p.a[0] === p.b[0] && p.a[1] === p.b[1],
      });
    } else if (p.type === 'node' && p.a) {
      const [x, y] = projCoord(p.a, lh);
      nodes.push({ x, y });
      pts.push([x, y]);
    }
  }

  // Plattform-Viereck
  const py = levelToY(lh, model.platformAt);
  const platform = [
    iso(0, 0, py),
    iso(w, 0, py),
    iso(w, d, py),
    iso(0, d, py),
  ];
  platform.forEach((p) => pts.push(p));

  // Rutsche (vorderkante, schräg nach unten)
  const slideTopL = iso(0, d, py);
  const slideTopR = iso(w, d, py);
  const run = py * 0.9 + 0.7;
  const slideBotL = iso(0, d + run, 0.06);
  const slideBotR = iso(w, d + run, 0.06);
  if (model.slide) pts.push(slideBotL, slideBotR);

  // Bounding box
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const pad = 0.6;
  const minX = Math.min(...xs) - pad;
  const maxX = Math.max(...xs) + pad;
  const minY = Math.min(...ys) - pad;
  const maxY = Math.max(...ys) + pad;
  const vbW = maxX - minX;
  const vbH = maxY - minY;

  lines.sort((a, b) => a.depth - b.depth);

  return (
    <svg
      viewBox={`${minX} ${minY} ${vbW} ${vbH}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Vorschau ${model.name}`}
    >
      {/* Bodendiamant */}
      <polygon
        points={[iso(0, 0, 0), iso(w, 0, 0), iso(w, d, 0), iso(0, d, 0)]
          .map((p) => `${p[0]},${p[1]}`)
          .join(' ')}
        fill="#ffffff"
        opacity={0.04}
      />
      {/* Rutsche */}
      {model.slide && (
        <polygon
          points={[slideTopL, slideTopR, slideBotR, slideBotL].map((p) => `${p[0]},${p[1]}`).join(' ')}
          fill="#cfd7e2"
          opacity={0.5}
          stroke="#cfd7e2"
          strokeWidth={0.05}
          strokeLinejoin="round"
        />
      )}
      {/* Rohre */}
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke={l.color}
          strokeWidth={l.vertical ? 0.12 : 0.13}
          strokeLinecap="round"
          opacity={0.95}
        />
      ))}
      {/* Plattform */}
      <polygon
        points={platform.map((p) => `${p[0]},${p[1]}`).join(' ')}
        fill="#0061b0"
        opacity={0.32}
        stroke="#0061b0"
        strokeWidth={0.05}
        strokeLinejoin="round"
      />
      {/* Verbinder */}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={0.11} fill="#0f1116" stroke="#2a2e37" strokeWidth={0.03} />
      ))}
    </svg>
  );
}
