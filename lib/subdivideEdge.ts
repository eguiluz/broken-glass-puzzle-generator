// Divide un borde [p0, p1] en n segmentos equidistantes, conservando el orden
export type Point = [number, number]

export function subdivideEdge(edge: [Point, Point], segments: number): Point[] {
    const [p0, p1] = edge
    if (segments < 2) return [p0, p1]
    const points: Point[] = []
    for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const x = p0[0] + (p1[0] - p0[0]) * t
        const y = p0[1] + (p1[1] - p0[1]) * t
        points.push([x, y])
    }
    return points
}
