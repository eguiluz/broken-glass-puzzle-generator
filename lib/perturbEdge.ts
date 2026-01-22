import { noise, noiseSeed } from "@chriscourses/perlin-noise"
import type { Point } from "./subdivideEdge"

// Inicializa la semilla para reproducibilidad
noiseSeed(12345)

/**
 * Desplaza un punto a lo largo de la normal del borde usando ruido Perlin 2D
 * @param p0 Punto inicial del borde
 * @param p1 Punto final del borde
 * @param pt Punto a desplazar (debe estar sobre el borde)
 * @param amplitude Amplitud máxima del desplazamiento
 * @param frequency Frecuencia del ruido
 * @returns Nuevo punto desplazado
 */
/**
 * Desplaza un punto a lo largo de la normal del borde usando ruido Perlin 1D a lo largo de la arista
 * @param p0 Punto inicial del borde
 * @param p1 Punto final del borde
 * @param pt Punto a desplazar (debe estar sobre el borde)
 * @param amplitude Amplitud máxima del desplazamiento
 * @param frequency Frecuencia del ruido
 * @returns Nuevo punto desplazado
 */
export function perturbPointWithNoise(
    p0: Point,
    p1: Point,
    pt: Point,
    amplitude: number = 1,
    frequency: number = 0.05,
    t?: number,
    edgeId?: number,
    nx?: number,
    ny?: number,
): Point {
    // Si se pasan t, edgeId, nx, ny, usar esos valores
    if (typeof t === "number" && typeof edgeId === "number" && typeof nx === "number" && typeof ny === "number") {
        const n = noise(t * frequency, edgeId)
        return [pt[0] + nx * n * amplitude, pt[1] + ny * n * amplitude]
    }
    // Vector tangente
    const dx = p1[0] - p0[0]
    const dy = p1[1] - p0[1]
    // Normal 2D (perpendicular, sentido antihorario)
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const nx2 = -dy / len
    const ny2 = dx / len
    // Calcular t a lo largo de la arista (0 en p0, 1 en p1)
    const totalDist = len
    const distToPt = Math.sqrt((pt[0] - p0[0]) ** 2 + (pt[1] - p0[1]) ** 2)
    const t2 = totalDist > 0 ? distToPt / totalDist : 0
    // No desplazar extremos
    if (t2 < 1e-6 || t2 > 1 - 1e-6) return pt
    // EdgeId único para la arista (hash simple)
    const edgeId2 = ((p0[0] * 73856093) ^ (p0[1] * 19349663) ^ (p1[0] * 83492791) ^ (p1[1] * 1234567)) % 1000000
    // Ruido 1D a lo largo de la arista, usando t y edgeId
    const n = noise(t2 * frequency, edgeId2)
    // Desplazamiento
    return [pt[0] + nx2 * n * amplitude, pt[1] + ny2 * n * amplitude]
}
