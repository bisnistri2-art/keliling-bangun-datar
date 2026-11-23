import { AlertTriangle } from 'lucide-react';
import type { ComputedShapeGeometry } from '../types/mpi';
import { interpolateWalkerPosition, STAGE_HEIGHT, STAGE_WIDTH } from '../utils/geometry';

interface ShapeDiagramProps {
  geometry: ComputedShapeGeometry;
  showGrid?: boolean;
  walkProgress?: number | null; // 0..1 when animating/stepping, null when static
  knownPerimeter?: number;
  compact?: boolean;
}

function renderRightAngleMark(
  vertices: { x: number; y: number }[],
  vertexIndex: number,
  size = 12
) {
  const n = vertices.length;
  const curr = vertices[vertexIndex];
  const prev = vertices[(vertexIndex + n - 1) % n];
  const next = vertices[(vertexIndex + 1) % n];

  const v1x = prev.x - curr.x;
  const v1y = prev.y - curr.y;
  const len1 = Math.hypot(v1x, v1y) || 1;
  const u1x = (v1x / len1) * size;
  const u1y = (v1y / len1) * size;

  const v2x = next.x - curr.x;
  const v2y = next.y - curr.y;
  const len2 = Math.hypot(v2x, v2y) || 1;
  const u2x = (v2x / len2) * size;
  const u2y = (v2y / len2) * size;

  const p1 = `${curr.x + u1x},${curr.y + u1y}`;
  const p2 = `${curr.x + u1x + u2x},${curr.y + u1y + u2y}`;
  const p3 = `${curr.x + u2x},${curr.y + u2y}`;

  return (
    <polyline
      key={`ra-${vertexIndex}`}
      points={`${p1} ${p2} ${p3}`}
      fill="none"
      stroke="#64748B"
      strokeWidth={1.5}
    />
  );
}

function renderTickMarks(
  from: { x: number; y: number },
  to: { x: number; y: number },
  count: number,
  color: string
) {
  if (!count) return null;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const tickHalf = 5.5;
  const offsets = count === 2 ? [-3.5, 3.5] : [0];

  return offsets.map((offset, idx) => {
    const cx = midX + ux * offset;
    const cy = midY + uy * offset;
    return (
      <line
        key={`tick-${idx}`}
        x1={cx - nx * tickHalf}
        y1={cy - ny * tickHalf}
        x2={cx + nx * tickHalf}
        y2={cy + ny * tickHalf}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    );
  });
}

export function ShapeDiagram({
  geometry,
  showGrid = true,
  walkProgress = null,
  knownPerimeter,
  compact = false,
}: ShapeDiagramProps) {
  if (!geometry.valid) {
    return (
      <div
        data-testid="invalid-triangle-notice"
        className="w-full min-h-[260px] flex flex-col items-center justify-center text-center p-8 bg-amber-50/70 border border-amber-200 rounded-xl"
      >
        <AlertTriangle className="w-8 h-8 text-amber-600 mb-3" aria-hidden="true" />
        <p className="font-display font-semibold text-slate-900 text-lg">
          Ukuran Sisi Belum Membentuk Segitiga
        </p>
        <p className="text-sm text-slate-600 max-w-md mt-1.5">
          Ingat syarat segitiga: jumlah panjang dua sisi mana pun harus lebih besar daripada
          panjang sisi ketiganya (<span className="font-mono-math">a + b &gt; c</span>).
        </p>
      </div>
    );
  }

  const polygonPoints = geometry.vertices.map((v) => `${v.x},${v.y}`).join(' ');
  const isWalking = walkProgress !== null;
  const walker = isWalking ? interpolateWalkerPosition(geometry.edges, walkProgress) : null;

  const fillColor =
    geometry.shape === 'persegi'
      ? 'rgba(2, 132, 199, 0.08)'
      : geometry.shape === 'persegi-panjang'
        ? 'rgba(5, 150, 105, 0.08)'
        : 'rgba(217, 119, 6, 0.09)';

  const centroidX =
    geometry.vertices.reduce((sum, v) => sum + v.x, 0) / geometry.vertices.length;
  const centroidY =
    geometry.vertices.reduce((sum, v) => sum + v.y, 0) / geometry.vertices.length;

  return (
    <div
      data-testid={`shape-stage-${geometry.shape}`}
      data-perimeter={geometry.perimeterCm}
      className={`w-full rounded-xl border border-slate-200 overflow-hidden ${
        showGrid ? 'blueprint-grid' : 'bg-white'
      }`}
    >
      <svg
        viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
        role="img"
        aria-label={`Diagram bangun datar ${geometry.shape} dengan keliling ${geometry.perimeterCm} cm`}
        className={`w-full ${compact ? 'max-h-[230px]' : 'max-h-[340px]'} h-auto block select-none`}
      >
        {/* Subtle polygon interior fill */}
        <polygon points={polygonPoints} fill={fillColor} />

        {/* Right-angle geometric markers */}
        {geometry.rightAngleVertexIndices.map((vIdx) =>
          renderRightAngleMark(geometry.vertices, vIdx, compact ? 10 : 12)
        )}

        {/* Base edges */}
        {geometry.edges.map((edge, idx) => {
          const fillFraction = walker ? walker.edgeFillFractions[idx] : 1;
          const partialX = edge.from.x + (edge.to.x - edge.from.x) * fillFraction;
          const partialY = edge.from.y + (edge.to.y - edge.from.y) * fillFraction;

          return (
            <g key={edge.id}>
              {/* Ghost track line when walker is active */}
              <line
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                stroke={isWalking ? '#CBD5E1' : edge.color}
                strokeWidth={isWalking ? 2.5 : 3.5}
                strokeDasharray={isWalking ? '6 5' : undefined}
                strokeLinecap="round"
              />

              {/* Traced active segment */}
              {isWalking && fillFraction > 0 && (
                <line
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={partialX}
                  y2={partialY}
                  stroke={edge.color}
                  strokeWidth={4.5}
                  strokeLinecap="round"
                />
              )}

              {/* Equal-side tick marks */}
              {renderTickMarks(edge.from, edge.to, edge.tickCount ?? 0, edge.color)}

              {/* Edge dimension label with crisp white halo for legibility */}
              <text
                x={edge.labelPosition.x}
                y={edge.labelPosition.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono-math"
                fontSize={compact ? 12.5 : 13.5}
                fontWeight={600}
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth={4}
                paintOrder="stroke"
              >
                {edge.label}
              </text>
            </g>
          );
        })}

        {/* Center known perimeter hint (for inverse problems) */}
        {typeof knownPerimeter === 'number' && (
          <text
            x={centroidX}
            y={centroidY + (geometry.shape === 'segitiga' ? 14 : 0)}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-mono-math"
            fontSize={14}
            fontWeight={600}
            fill="#0F172A"
          >
            K = {knownPerimeter} cm
          </text>
        )}

        {/* Vertices */}
        {geometry.vertices.map((v, i) => (
          <circle
            key={`vertex-${i}`}
            cx={v.x}
            cy={v.y}
            r={4.5}
            fill="#FFFFFF"
            stroke="#0F172A"
            strokeWidth={2}
          />
        ))}

        {/* Vertex letter labels */}
        {geometry.vertexLabels.map((vl) => (
          <text
            key={`vl-${vl.label}`}
            x={vl.x}
            y={vl.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={600}
            fill="#475569"
            stroke="#FFFFFF"
            strokeWidth={3}
            paintOrder="stroke"
          >
            {vl.label}
          </text>
        ))}

        {/* Animated Perimeter Walker indicator */}
        {walker && (
          <g transform={`translate(${walker.position.x}, ${walker.position.y})`}>
            <circle r={11} fill="rgba(2, 132, 199, 0.2)" />
            <circle r={6.5} fill="#0284C7" stroke="#FFFFFF" strokeWidth={2.5} />
          </g>
        )}
      </svg>
    </div>
  );
}
