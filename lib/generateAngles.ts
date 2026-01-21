// Genera un array de ángulos equiespaciados entre 0 y 2π
export function generateAngles(count: number): number[] {
    if (count <= 0) return []
    const step = (2 * Math.PI) / count
    return Array.from({ length: count }, (_, i) => i * step)
}
