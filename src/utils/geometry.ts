import type {
  ComputedShapeGeometry,
  EdgeSegment,
  Point2D,
  ShapeDimensions,
  ShapeType,
  TriangleKind,
} from '../types/mpi';

export const STAGE_WIDTH = 520;
export const STAGE_HEIGHT = 320;
const STAGE_PADDING_X = 76;
const STAGE_PADDING_Y = 56;

export const EDGE_COLORS = {
  persegi: ['#0284C7', '#0369A1', '#0EA5E9', '#38BDF8'],
  'persegi-panjang': ['#059669', '#0284C7', '#059669', '#0284C7'],
  segitiga: ['#D97706', '#0284C7', '#059669'],
} as const;

export function calculateSquarePerimeter(sisi: number): number {
  if (!Number.isFinite(sisi) || sisi <= 0) return 0;
  return Number((4 * sisi).toFixed(2));
}

export function calculateRectanglePerimeter(panjang: number, lebar: number): number {
  if (!Number.isFinite(panjang) || !Number.isFinite(lebar) || panjang <= 0 || lebar <= 0) {
    return 0;
  }
  return Number((2 * (panjang + lebar)).toFixed(2));
}

export function isValidTriangle(a: number, b: number, c: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return false;
  if (a <= 0 || b <= 0 || c <= 0) return false;
  return a + b > c && a + c > b && b + c > a;
}

export function calculateTrianglePerimeter(a: number, b: number, c: number): number {
  if (!isValidTriangle(a, b, c)) return 0;
  return Number((a + b + c).toFixed(2));
}

export function classifyTriangle(a: number, b: number, c: number): TriangleKind {
  if (!isValidTriangle(a, b, c)) return 'Tidak Valid';
  const eps = 1e-6;
  if (Math.abs(a - b) < eps && Math.abs(b - c) < eps) {
    return 'Sama Sisi';
  }
  const sorted = [a, b, c].sort((x, y) => x - y);
  const isRight = Math.abs(sorted[0] ** 2 + sorted[1] ** 2 - sorted[2] ** 2) < 1e-4;
  if (isRight) {
    return 'Siku-Siku';
  }
  if (Math.abs(a - b) < eps || Math.abs(b - c) < eps || Math.abs(a - c) < eps) {
    return 'Sama Kaki';
  }
  return 'Sembarang';
}

function outwardLabelOffset(from: Point2D, to: Point2D, centroid: Point2D, distance = 24): Point2D {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  // Two perpendicular unit normals
  let nx = -dy / len;
  let ny = dx / len;
  // Ensure normal points away from centroid
  const toMidX = midX - centroid.x;
  const toMidY = midY - centroid.y;
  if (nx * toMidX + ny * toMidY < 0) {
    nx = -nx;
    ny = -ny;
  }
  // Horizontal text labels are wider than they are tall, so give extra horizontal clearance
  const extraHorizontal = Math.abs(nx) * 22;
  const effectiveDist = distance + extraHorizontal;
  return {
    x: Number((midX + nx * effectiveDist).toFixed(1)),
    y: Number((midY + ny * effectiveDist).toFixed(1)),
  };
}

function outwardVertexLabel(vertex: Point2D, centroid: Point2D, distance = 20): Point2D {
  const dx = vertex.x - centroid.x;
  const dy = vertex.y - centroid.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: Number((vertex.x + (dx / len) * distance).toFixed(1)),
    y: Number((vertex.y + (dy / len) * distance).toFixed(1)),
  };
}

export function computeShapeGeometry(
  shape: ShapeType,
  dims: ShapeDimensions,
  options?: { hideDimension?: 'sisi' | 'lebar' | 'sisiC' }
): ComputedShapeGeometry {
  const usableW = STAGE_WIDTH - STAGE_PADDING_X * 2;
  const usableH = STAGE_HEIGHT - STAGE_PADDING_Y * 2;

  if (shape === 'persegi') {
    const s = Math.max(1, dims.sisi);
    const perimeter = calculateSquarePerimeter(s);
    // Keep visual scale proportional to 1..15 range while remaining crisp
    const ratio = 0.42 + (Math.min(s, 15) / 15) * 0.56;
    const px = Math.min(usableW, usableH) * ratio;
    const x0 = (STAGE_WIDTH - px) / 2;
    const y0 = (STAGE_HEIGHT - px) / 2;

    const vertices: Point2D[] = [
      { x: x0, y: y0 },
      { x: x0 + px, y: y0 },
      { x: x0 + px, y: y0 + px },
      { x: x0, y: y0 + px },
    ];
    const centroid = { x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 };
    const letters = ['A', 'B', 'C', 'D'];
    const hideS = options?.hideDimension === 'sisi';

    const edges: EdgeSegment[] = vertices.map((from, idx) => {
      const to = vertices[(idx + 1) % vertices.length];
      return {
        id: `sisi-${idx + 1}`,
        from,
        to,
        lengthCm: s,
        label: hideS ? (idx === 0 ? 's = ?' : 's') : `${s} cm`,
        color: EDGE_COLORS.persegi[idx],
        labelPosition: outwardLabelOffset(from, to, centroid, 22),
        tickCount: 1,
      };
    });

    return {
      shape,
      valid: true,
      perimeterCm: perimeter,
      vertices,
      vertexLabels: vertices.map((v, i) => ({
        label: letters[i],
        ...outwardVertexLabel(v, centroid, 18),
      })),
      edges,
      rightAngleVertexIndices: [0, 1, 2, 3],
      formulaSymbolic: 'K = 4 × s',
      formulaExpanded: 'K = s + s + s + s',
      formulaSubstitution: `K = ${s} + ${s} + ${s} + ${s} = 4 × ${s}`,
      formulaResult: `${perimeter} cm`,
    };
  }

  if (shape === 'persegi-panjang') {
    const p = Math.max(1, dims.panjang);
    const l = Math.max(1, dims.lebar);
    const perimeter = calculateRectanglePerimeter(p, l);
    const maxDim = Math.max(p, l, 10);
    const scale = Math.min(usableW / Math.max(p, 4), usableH / Math.max(l, 4));
    // Gentle dampening for small values so shape is always legible
    const visualScale = Math.min(scale, Math.min(usableW, usableH) / (maxDim * 0.85));
    const pxW = Math.max(90, Math.min(usableW, p * visualScale));
    const pxH = Math.max(60, Math.min(usableH, l * visualScale));

    const x0 = (STAGE_WIDTH - pxW) / 2;
    const y0 = (STAGE_HEIGHT - pxH) / 2;

    const vertices: Point2D[] = [
      { x: x0, y: y0 },
      { x: x0 + pxW, y: y0 },
      { x: x0 + pxW, y: y0 + pxH },
      { x: x0, y: y0 + pxH },
    ];
    const centroid = { x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 };
    const letters = ['P', 'Q', 'R', 'S'];
    const hideL = options?.hideDimension === 'lebar';

    const lengths = [p, l, p, l];
    const labels = [
      `p = ${p} cm`,
      hideL ? 'l = ?' : `l = ${l} cm`,
      `${p} cm`,
      hideL ? 'l = ?' : `${l} cm`,
    ];

    const edges: EdgeSegment[] = vertices.map((from, idx) => {
      const to = vertices[(idx + 1) % vertices.length];
      return {
        id: `sisi-${idx + 1}`,
        from,
        to,
        lengthCm: lengths[idx],
        label: labels[idx],
        color: EDGE_COLORS['persegi-panjang'][idx],
        labelPosition: outwardLabelOffset(from, to, centroid, idx % 2 === 0 ? 22 : 34),
        tickCount: idx % 2 === 0 ? 2 : 1,
      };
    });

    return {
      shape,
      valid: true,
      perimeterCm: perimeter,
      vertices,
      vertexLabels: vertices.map((v, i) => ({
        label: letters[i],
        ...outwardVertexLabel(v, centroid, 18),
      })),
      edges,
      rightAngleVertexIndices: [0, 1, 2, 3],
      formulaSymbolic: 'K = 2 × (p + l)',
      formulaExpanded: 'K = p + l + p + l',
      formulaSubstitution: `K = 2 × (${p} + ${l}) = 2 × ${p + l}`,
      formulaResult: `${perimeter} cm`,
    };
  }

  // Segitiga
  const a = Math.max(1, dims.sisiA); // base (alas)
  const b = Math.max(1, dims.sisiB); // right side
  const c = Math.max(1, dims.sisiC); // left side
  const valid = isValidTriangle(a, b, c);
  const triangleKind = classifyTriangle(a, b, c);

  if (!valid) {
    return {
      shape,
      valid: false,
      perimeterCm: 0,
      vertices: [],
      vertexLabels: [],
      edges: [],
      rightAngleVertexIndices: [],
      triangleKind: 'Tidak Valid',
      formulaSymbolic: 'K = a + b + c',
      formulaExpanded: 'Syarat segitiga: jumlah dua sisi harus lebih besar dari sisi ketiga',
      formulaSubstitution: `${a}, ${b}, ${c} belum membentuk segitiga tertutup`,
      formulaResult: 'Tidak Valid',
    };
  }

  const perimeter = calculateTrianglePerimeter(a, b, c);

  // Place base a along bottom horizontal axis from (0,0) to (a,0)
  // Using Law of Cosines for vertex C (top):
  // xC = (a^2 + c^2 - b^2) / (2a), yC = sqrt(c^2 - xC^2)
  const rawX = (a * a + c * c - b * b) / (2 * a);
  const rawY = Math.sqrt(Math.max(0.0001, c * c - rawX * rawX));

  const rawPoints: Point2D[] = [
    { x: 0, y: 0 }, // A (bottom-left)
    { x: a, y: 0 }, // B (bottom-right)
    { x: rawX, y: -rawY }, // C (top, inverted y for SVG)
  ];

  const minX = Math.min(...rawPoints.map((pt) => pt.x));
  const maxX = Math.max(...rawPoints.map((pt) => pt.x));
  const minY = Math.min(...rawPoints.map((pt) => pt.y));
  const maxY = Math.max(...rawPoints.map((pt) => pt.y));

  const spanX = Math.max(maxX - minX, 0.1);
  const spanY = Math.max(maxY - minY, 0.1);
  const scale = Math.min(usableW / spanX, usableH / spanY) * 0.92;

  const scaledW = spanX * scale;
  const scaledH = spanY * scale;
  const offsetX = (STAGE_WIDTH - scaledW) / 2 - minX * scale;
  const offsetY = (STAGE_HEIGHT - scaledH) / 2 - minY * scale + 8;

  const vertices: Point2D[] = rawPoints.map((pt) => ({
    x: Number((pt.x * scale + offsetX).toFixed(1)),
    y: Number((pt.y * scale + offsetY).toFixed(1)),
  }));

  const centroid: Point2D = {
    x: (vertices[0].x + vertices[1].x + vertices[2].x) / 3,
    y: (vertices[0].y + vertices[1].y + vertices[2].y) / 3,
  };

  const letters = ['A', 'B', 'C'];
  const hideC = options?.hideDimension === 'sisiC';

  // Edge 0: A->B (length a), Edge 1: B->C (length b), Edge 2: C->A (length c)
  const edgeMeta = [
    { len: a, label: `a = ${a} cm` },
    { len: b, label: `b = ${b} cm` },
    { len: c, label: hideC ? 'c = ?' : `c = ${c} cm` },
  ];

  // Detect right angle vertex if any (dot product near 0)
  const rightAngleVertexIndices: number[] = [];
  for (let i = 0; i < 3; i++) {
    const prev = vertices[(i + 2) % 3];
    const curr = vertices[i];
    const next = vertices[(i + 1) % 3];
    const v1x = prev.x - curr.x;
    const v1y = prev.y - curr.y;
    const v2x = next.x - curr.x;
    const v2y = next.y - curr.y;
    const dot = v1x * v2x + v1y * v2y;
    const mag = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
    if (mag > 0 && Math.abs(dot / mag) < 0.025) {
      rightAngleVertexIndices.push(i);
    }
  }

  const edges: EdgeSegment[] = vertices.map((from, idx) => {
    const to = vertices[(idx + 1) % 3];
    return {
      id: `sisi-${idx + 1}`,
      from,
      to,
      lengthCm: edgeMeta[idx].len,
      label: edgeMeta[idx].label,
      color: EDGE_COLORS.segitiga[idx],
      labelPosition: outwardLabelOffset(from, to, centroid, idx === 0 ? 24 : 28),
      tickCount:
        triangleKind === 'Sama Sisi'
          ? 1
          : triangleKind === 'Sama Kaki' &&
              ((idx === 1 && b === c) ||
                (idx === 2 && b === c) ||
                (idx === 0 && a === b) ||
                (idx === 1 && a === b) ||
                (idx === 0 && a === c) ||
                (idx === 2 && a === c))
            ? 1
            : 0,
    };
  });

  const formulaSymbolic =
    triangleKind === 'Sama Sisi' ? 'K = a + b + c = 3 × s' : 'K = a + b + c';

  return {
    shape,
    valid: true,
    perimeterCm: perimeter,
    vertices,
    vertexLabels: vertices.map((v, i) => ({
      label: letters[i],
      ...outwardVertexLabel(v, centroid, 20),
    })),
    edges,
    rightAngleVertexIndices,
    triangleKind,
    formulaSymbolic,
    formulaExpanded: 'K = sisi a + sisi b + sisi c',
    formulaSubstitution: `K = ${a} + ${b} + ${c}`,
    formulaResult: `${perimeter} cm`,
  };
}

export interface WalkerState {
  position: Point2D;
  activeEdgeIndex: number;
  edgeProgress: number;
  traveledCm: number;
  edgeFillFractions: number[];
}

export function interpolateWalkerPosition(
  edges: EdgeSegment[],
  progress0to1: number
): WalkerState {
  if (edges.length === 0) {
    return {
      position: { x: 0, y: 0 },
      activeEdgeIndex: 0,
      edgeProgress: 0,
      traveledCm: 0,
      edgeFillFractions: [],
    };
  }

  const clamped = Math.max(0, Math.min(1, progress0to1));
  const totalCm = edges.reduce((acc, e) => acc + e.lengthCm, 0);
  const targetCm = clamped * totalCm;

  let accumulated = 0;
  const edgeFillFractions: number[] = edges.map(() => 0);
  let activeEdgeIndex = edges.length - 1;
  let edgeProgress = 1;
  let position: Point2D = edges[edges.length - 1].to;

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (targetCm >= accumulated + edge.lengthCm && i < edges.length - 1) {
      edgeFillFractions[i] = 1;
      accumulated += edge.lengthCm;
    } else if (targetCm >= accumulated) {
      const frac = edge.lengthCm > 0 ? Math.min(1, (targetCm - accumulated) / edge.lengthCm) : 1;
      edgeFillFractions[i] = frac;
      activeEdgeIndex = i;
      edgeProgress = frac;
      position = {
        x: edge.from.x + (edge.to.x - edge.from.x) * frac,
        y: edge.from.y + (edge.to.y - edge.from.y) * frac,
      };
      break;
    } else {
      edgeFillFractions[i] = 0;
    }
  }

  return {
    position,
    activeEdgeIndex,
    edgeProgress,
    traveledCm: Number(targetCm.toFixed(1)),
    edgeFillFractions,
  };
}
