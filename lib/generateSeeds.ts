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

// Cache global para los jitter de semillas
const _seedJitterCache = new Map<string, { jitterR: number; jitterA: number }>()

function getSeedJitter(key: string): { jitterR: number; jitterA: number } {
    let cached = _seedJitterCache.get(key)
    if (!cached) {
        cached = {
            jitterR: Math.random() * 2 - 1,
            jitterA: Math.random() * 2 - 1,
        }
        _seedJitterCache.set(key, cached)
    }
    return cached
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
    for (let ringIdx = 0; ringIdx < rings.length; ringIdx++) {
        const r0 = rings[ringIdx]
        for (let angleIdx = 0; angleIdx < angles.length; angleIdx++) {
            const angle0 = angles[angleIdx]
            // Cachear jitter por posición única
            const key = `${r0},${angle0}`
            const { jitterR: randR, jitterA: randA } = getSeedJitter(key)
            const jitterR = randR * jitterRadius
            const jitterA = randA * jitterAngle
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
