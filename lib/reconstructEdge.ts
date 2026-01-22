import type { Point } from "./subdivideEdge"

// Cache para bordes compartidos: key = "x0,y0|x1,y1" (ordenado)
const edgeCache = new Map<string, Point[]>()

function edgeKey(p0: Point, p1: Point): string {
    return p0[0] < p1[0] || (p0[0] === p1[0] && p0[1] <= p1[1])
        ? `${p0[0]},${p0[1]}|${p1[0]},${p1[1]}`
        : `${p1[0]},${p1[1]}|${p0[0]},${p0[1]}`
}

/**
 * Reconstruye un borde serpenteante suave y determinista
 */
export function getPerturbedEdge(
    p0: Point,
    p1: Point,
    segments: number,
    amplitude: number,
    frequency: number,
): Point[] {
    const key = edgeKey(p0, p1)
    if (edgeCache.has(key)) {
        const cached = edgeCache.get(key)!
        return cached[0][0] === p0[0] && cached[0][1] === p0[1] ? cached : [...cached].reverse()
    }

    // Subdivisión lineal
    const subdivided: Point[] = []
    for (let i = 0; i <= segments; i++) {
        const t = i / segments
        subdivided.push([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t])
    }

    // Normal unitaria
    const dx = p1[0] - p0[0]
    const dy = p1[1] - p0[1]
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len

    // Fase determinista por arista
    const edgeSeed = Math.abs(((p0[0] * 73856093) ^ (p0[1] * 19349663) ^ (p1[0] * 83492791) ^ (p1[1] * 1234567)) >>> 0)

    const phase = ((edgeSeed % 1000) / 1000) * Math.PI * 2

    const perturbed: Point[] = subdivided.map((pt, i) => {
        const t = i / segments

        const envelope = Math.sin(Math.PI * t)

        const ampLocal = amplitude * envelope * (0.8 + 0.2 * Math.sin(t * Math.PI * 2))

        const wave = Math.sin(t * frequency * Math.PI * 2 + phase)

        const offset = ampLocal * wave

        return [pt[0] + nx * offset, pt[1] + ny * offset]
    })

    edgeCache.set(key, perturbed)
    return perturbed
}

export function clearEdgeCache() {
    edgeCache.clear()
}
