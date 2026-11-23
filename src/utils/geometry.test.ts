import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRectanglePerimeter,
  calculateSquarePerimeter,
  calculateTrianglePerimeter,
  classifyTriangle,
  computeShapeGeometry,
  interpolateWalkerPosition,
  isValidTriangle,
} from './geometry';

test('calculates square perimeter accurately', () => {
  assert.equal(calculateSquarePerimeter(6), 24);
  assert.equal(calculateSquarePerimeter(12.5), 50);
  assert.equal(calculateSquarePerimeter(0), 0);
  assert.equal(calculateSquarePerimeter(-4), 0);
});

test('calculates rectangle perimeter accurately', () => {
  assert.equal(calculateRectanglePerimeter(12, 5), 34);
  assert.equal(calculateRectanglePerimeter(14, 9), 46);
  assert.equal(calculateRectanglePerimeter(0, 5), 0);
});

test('validates and classifies triangles correctly', () => {
  assert.equal(isValidTriangle(3, 4, 5), true);
  assert.equal(isValidTriangle(2, 2, 10), false);
  assert.equal(isValidTriangle(5, 5, 10), false);

  assert.equal(classifyTriangle(8, 8, 8), 'Sama Sisi');
  assert.equal(classifyTriangle(6, 8, 10), 'Siku-Siku');
  assert.equal(classifyTriangle(10, 13, 13), 'Sama Kaki');
  assert.equal(classifyTriangle(11, 8, 6), 'Sembarang');
  assert.equal(classifyTriangle(2, 3, 9), 'Tidak Valid');
  assert.equal(calculateTrianglePerimeter(8, 10, 6), 24);
  assert.equal(calculateTrianglePerimeter(2, 3, 9), 0);
});

test('computes valid SVG geometry for all three shapes', () => {
  const baseDims = { sisi: 8, panjang: 12, lebar: 6, sisiA: 8, sisiB: 10, sisiC: 6 };

  const sq = computeShapeGeometry('persegi', baseDims);
  assert.equal(sq.valid, true);
  assert.equal(sq.perimeterCm, 32);
  assert.equal(sq.vertices.length, 4);
  assert.equal(sq.edges.length, 4);

  const rect = computeShapeGeometry('persegi-panjang', baseDims);
  assert.equal(rect.valid, true);
  assert.equal(rect.perimeterCm, 36);
  assert.equal(rect.vertices.length, 4);

  const tri = computeShapeGeometry('segitiga', baseDims);
  assert.equal(tri.valid, true);
  assert.equal(tri.perimeterCm, 24);
  assert.equal(tri.vertices.length, 3);
  assert.equal(tri.triangleKind, 'Siku-Siku');
  assert.ok(tri.rightAngleVertexIndices.length === 1);
});

test('interpolates perimeter walker position along edges smoothly', () => {
  const sq = computeShapeGeometry('persegi', {
    sisi: 5,
    panjang: 8,
    lebar: 4,
    sisiA: 6,
    sisiB: 6,
    sisiC: 6,
  });

  const start = interpolateWalkerPosition(sq.edges, 0);
  assert.equal(start.traveledCm, 0);
  assert.equal(start.activeEdgeIndex, 0);

  const half = interpolateWalkerPosition(sq.edges, 0.5);
  assert.equal(half.traveledCm, 10);
  assert.equal(half.edgeFillFractions[0], 1);
  assert.equal(half.edgeFillFractions[1], 1);

  const end = interpolateWalkerPosition(sq.edges, 1);
  assert.equal(end.traveledCm, 20);
  assert.deepEqual(end.edgeFillFractions, [1, 1, 1, 1]);
});
