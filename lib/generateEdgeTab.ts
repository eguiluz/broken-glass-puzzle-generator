import { Point } from "./subdivideEdge"

export type Tab = {
    segmentIndex: number
    startPoint: { x: number; y: number }
    leftTipPoint: { x: number; y: number }
    rightTipPoint: { x: number; y: number }
    endPoint: { x: number; y: number }
    isTooSmall?: boolean
}

/**
 * Genera una pestaña centrada en el segmento [p0, p1] si es suficientemente largo
 */
export function generateEdgeTab(
    p0: Point,
    p1: Point,
    minTabSize: number,
    tabWidth: number,
    tabHeight: number,
    tabAngle: number,
    tabConnectionOffset: number,
): Tab | null {
    // Vector dirección
    const dx = p1[0] - p0[0]
    const dy = p1[1] - p0[1]
    const length = Math.sqrt(dx * dx + dy * dy)
    if (length < minTabSize) return null

    // Decidir aleatoriamente si se usa el offset, su valor negativo, o ninguno
    // Usar una semilla determinista basada en la posición de la arista
    const str = `${p0[0]},${p0[1]},${p1[0]},${p1[1]}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0
    }
    const mode = Math.abs(hash) % 3 // 0: no offset, 1: positivo, 2: negativo
    let offset = 0
    if (mode === 1) offset = tabConnectionOffset * length
    else if (mode === 2) offset = -tabConnectionOffset * length
    // 0: offset = 0
    const centerX = (p0[0] + p1[0]) / 2 + (dx / length) * offset
    const centerY = (p0[1] + p1[1]) / 2 + (dy / length) * offset

    // Vector perpendicular (normalizado)
    const perpX = -dy / length
    const perpY = dx / length

    // Dirección de la pestaña (aleatorio: hacia fuera o dentro)
    const direction = 1 // Siempre hacia fuera para consistencia visual

    // Escalar pestaña
    const baseWidth = tabWidth * length
    // Alto máximo absoluto (mm)
    const maxAbsHeight = 6
    let height = tabHeight * length * direction
    if (Math.abs(height) > maxAbsHeight) {
        height = maxAbsHeight * Math.sign(direction * tabHeight)
    }
    const angleRad = (tabAngle * Math.PI) / 180
    const lateralOffset = Math.tan(angleRad) * Math.abs(height)

    // Desplazamiento de conexión
    const offsetStartX = 0
    const offsetStartY = 0
    const offsetEndX = 0
    const offsetEndY = 0

    // Puntos de la pestaña
    const startPoint = {
        x: centerX - (dx / length) * (baseWidth / 2) + offsetStartX,
        y: centerY - (dy / length) * (baseWidth / 2) + offsetStartY,
    }
    const leftTipPoint = {
        x: centerX - (dx / length) * (baseWidth / 2 - lateralOffset) + perpX * height,
        y: centerY - (dy / length) * (baseWidth / 2 - lateralOffset) + perpY * height,
    }
    const rightTipPoint = {
        x: centerX + (dx / length) * (baseWidth / 2 - lateralOffset) + perpX * height,
        y: centerY + (dy / length) * (baseWidth / 2 - lateralOffset) + perpY * height,
    }
    const endPoint = {
        x: centerX + (dx / length) * (baseWidth / 2) + offsetEndX,
        y: centerY + (dy / length) * (baseWidth / 2) + offsetEndY,
    }
    const tabActualSize = Math.min(baseWidth, Math.abs(height))
    const isTooSmall = tabActualSize < minTabSize
    return {
        segmentIndex: 0,
        startPoint,
        leftTipPoint,
        rightTipPoint,
        endPoint,
        isTooSmall,
    }
}
