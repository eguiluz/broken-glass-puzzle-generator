import { noise, noiseSeed } from "@chriscourses/perlin-noise";
import type { Point } from "./subdivideEdge";

// Inicializa la semilla para reproducibilidad
noiseSeed(12345);

/**
 * Desplaza un punto a lo largo de la normal del borde usando ruido Perlin 2D
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
    frequency: number = 0.05
): Point {
    // Vector tangente
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    // Normal 2D (perpendicular, sentido antihorario)
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    // Ruido determinista en la posición global del punto
    // Usamos la función noise(x, y) de la librería
    const n = noise(pt[0] * frequency, pt[1] * frequency);
    // Desplazamiento
    return [
        pt[0] + nx * n * amplitude,
        pt[1] + ny * n * amplitude,
    ];
}
