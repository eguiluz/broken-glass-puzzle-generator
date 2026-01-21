import type { Point } from "./subdivideEdge"
import { subdivideEdge } from "./subdivideEdge"
import { perturbPointWithNoise } from "./perturbEdge"

// Cache para bordes compartidos: key = "x0,y0|x1,y1" (ordenado)
const edgeCache = new Map<string, Point[]>()

function edgeKey(p0: Point, p1: Point): string {
    // Orden lexicográfico para que key sea igual en ambos sentidos
    return p0[0] < p1[0] || (p0[0] === p1[0] && p0[1] <= p1[1])
        ? `${p0[0]},${p0[1]}|${p1[0]},${p1[1]}`
        : `${p1[0]},${p1[1]}|${p0[0]},${p0[1]}`
}

/**
 * Reconstruye un borde perturbado, cacheando la lista de puntos para continuidad C0
 * @param p0 Punto inicial
 * @param p1 Punto final
 * @param segments Nº de subdivisiones
 * @param amplitude Amplitud del ruido
 * @param frequency Frecuencia del ruido
 * @returns Lista de puntos perturbados (ordenada de p0 a p1)
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
        // Si el borde está en cache, devolverlo (en orden correcto)
        const cached = edgeCache.get(key)!
        // Si el orden es inverso, invertir la lista
        if (cached[0][0] === p0[0] && cached[0][1] === p0[1]) {
            return cached
        } else {
            return [...cached].reverse()
        }
    }
    // Subdividir y perturbar
    const subdivided = subdivideEdge([p0, p1], segments)
    const perturbed = subdivided.map((pt) => perturbPointWithNoise(p0, p1, pt, amplitude, frequency))
    edgeCache.set(key, perturbed)
    return perturbed
}

export function clearEdgeCache() {
    edgeCache.clear()
}
