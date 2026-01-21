// Genera un array de radios crecientes, con opción de crecimiento geométrico
export function generateRings(
    ringCount: number,
    minRadius: number,
    maxRadius: number,
    growthFactor: number = 1,
): number[] {
    if (ringCount <= 0) return []
    if (ringCount === 1) return [minRadius]
    if (growthFactor === 1) {
        // Lineal
        const step = (maxRadius - minRadius) / (ringCount - 1)
        return Array.from({ length: ringCount }, (_, i) => minRadius + i * step)
    } else {
        // Geométrico
        // r_n = minRadius * growthFactor^n, ajustado para que el último sea <= maxRadius
        const rings: number[] = []
        let r = minRadius
        for (let i = 0; i < ringCount; i++) {
            rings.push(r)
            r *= growthFactor
            if (r > maxRadius && i < ringCount - 1) {
                // Si nos pasamos, forzar el último valor a maxRadius
                r = maxRadius
            }
        }
        // Si el último valor no es maxRadius, forzar el último
        if (rings.length === ringCount && Math.abs(rings[ringCount - 1] - maxRadius) > 1e-6) {
            rings[ringCount - 1] = maxRadius
        }
        return rings
    }
}
