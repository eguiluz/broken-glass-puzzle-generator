// Dada una lista de radios y ángulos, genera semillas en coordenadas cartesianas respecto a un origen
export interface Seed {
    x: number
    y: number
    r: number
    angle: number
    jitterR?: number
    jitterA?: number
}

export interface GenerateSeedsOptions {
    jitterRadius?: number // máximo desplazamiento radial
    jitterAngle?: number // máximo desplazamiento angular (radianes)
}

export function generateSeeds(
    rings: number[],
    angles: number[],
    originX: number,
    originY: number,
    options: GenerateSeedsOptions = {},
    bounds?: { width: number; height: number },
): Seed[] {
    const { jitterRadius = 0, jitterAngle = 0 } = options
    const seeds: Seed[] = []
    for (const r0 of rings) {
        for (const angle0 of angles) {
            // Jitter aleatorio
            const jitterR = (Math.random() * 2 - 1) * jitterRadius
            const jitterA = (Math.random() * 2 - 1) * jitterAngle
            const r = r0 + jitterR
            const angle = angle0 + jitterA
            const x = originX + r * Math.cos(angle)
            const y = originY + r * Math.sin(angle)
            // Filtrado por área de trabajo si bounds está definido
            if (bounds) {
                if (x < 0 || x > bounds.width || y < 0 || y > bounds.height) continue
            }
            seeds.push({ x, y, r, angle, jitterR, jitterA })
        }
    }
    return seeds
}
