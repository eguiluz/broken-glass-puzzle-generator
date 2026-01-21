import { Delaunay } from "d3-delaunay";

export interface VoronoiCell {
    site: [number, number];
    polygon: [number, number][];
}

// Normaliza un punto a una precisión fija para evitar errores numéricos
function normalizePoint([x, y]: [number, number], precision = 6): [number, number] {
    return [
        Number(x.toFixed(precision)),
        Number(y.toFixed(precision)),
    ];
}

// Aplica un sesgo radial a las semillas antes de calcular el Voronoi
function applyRadialBias(
    seeds: { x: number; y: number }[],
    origin: [number, number],
    biasScalar: number = 1 // 1 = sin sesgo, >1 aleja, <1 acerca
): { x: number; y: number }[] {
    return seeds.map((seed) => {
        const dx = seed.x - origin[0];
        const dy = seed.y - origin[1];
        const r = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        // Multiplicador escalar, nunca negativo
        const biasedR = Math.max(0, r * biasScalar);
        return {
            x: origin[0] + biasedR * Math.cos(angle),
            y: origin[1] + biasedR * Math.sin(angle),
        };
    });
}

/**
 * Calcula celdas de Voronoi 2D limitadas a un rectángulo
 * @param seeds Array de puntos [x, y]
 * @param bounds { width, height }
 * @returns Array de celdas con su polígono recortado
 */
export function computeVoronoi(
    seeds: { x: number; y: number }[],
    bounds: { width: number; height: number },
    options?: { origin?: [number, number]; biasScalar?: number }
): VoronoiCell[] {
    if (!seeds.length) return [];
    let transformedSeeds = seeds;
    if (options?.origin && typeof options.biasScalar === 'number') {
        transformedSeeds = applyRadialBias(seeds, options.origin, options.biasScalar);
    }
    const delaunay = Delaunay.from(
        transformedSeeds,
        (d: { x: number; y: number }) => d.x,
        (d: { x: number; y: number }) => d.y
    );
    const voronoi = delaunay.voronoi([0, 0, bounds.width, bounds.height]);
    const cells: VoronoiCell[] = [];
    for (let i = 0; i < seeds.length; i++) {
        const poly = voronoi.cellPolygon(i);
        if (poly && poly.length > 2) {
            const polygon = poly.slice(0, -1).map((pt) => normalizePoint(pt)) as [number, number][];
            cells.push({ site: [seeds[i].x, seeds[i].y], polygon });
        }
    }
    return cells;
}
