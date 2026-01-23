import { Point } from "./subdivideEdge"

export type Tab =
    | {
        segmentIndex: number
        startPoint: { x: number; y: number }
        leftTipPoint: { x: number; y: number }
        rightTipPoint: { x: number; y: number }
        endPoint: { x: number; y: number }
        isTooSmall?: boolean
        type: "three-arm"
    }
    | {
        segmentIndex: number
        startPoint: { x: number; y: number }
        tipPoint: { x: number; y: number }
        endPoint: { x: number; y: number }
        isTooSmall?: boolean
        type: "triangle"
    }
    | {
        segmentIndex: number
        startPoint: { x: number; y: number }
        zMid1: { x: number; y: number }
        zMid2: { x: number; y: number }
        endPoint: { x: number; y: number }
        isTooSmall?: boolean
        type: "z-shape"
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

    // Decide tab type: 1/3 z-shape, 1/6 triangle, rest three-arm (deterministic)
    let tabType: "three-arm" | "triangle" | "z-shape"
    if (Math.abs(hash) % 3 === 0) tabType = "z-shape"
    else if (Math.abs(hash) % 6 === 1) tabType = "triangle"
    else tabType = "three-arm"

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
    const endPoint = {
        x: centerX + (dx / length) * (baseWidth / 2) + offsetEndX,
        y: centerY + (dy / length) * (baseWidth / 2) + offsetEndY,
    }
    const tabActualSize = Math.min(baseWidth, Math.abs(height))
    const isTooSmall = tabActualSize < minTabSize

    if (tabType === "triangle") {
        // Only one tip in the center (triangle tab)
        const tipPoint = {
            x: centerX + perpX * height,
            y: centerY + perpY * height,
        }
        return {
            segmentIndex: 0,
            startPoint,
            tipPoint,
            endPoint,
            isTooSmall,
            type: "triangle",
        }
    } else if (tabType === "z-shape") {
        // Z-shape: one midpoint offset, the other connects directly to the edge
        const t1 = 1 / 3
        const t2 = 2 / 3
        // Points along the edge
        const mid1 = {
            x: startPoint.x + (endPoint.x - startPoint.x) * t1,
            y: startPoint.y + (endPoint.y - startPoint.y) * t1,
        }
        const mid2 = {
            x: startPoint.x + (endPoint.x - startPoint.x) * t2,
            y: startPoint.y + (endPoint.y - startPoint.y) * t2,
        }
        // Randomly mirror the Z tab in both axes (deterministic)
        const mirrorMain = Math.abs(hash) % 2 === 0 ? 1 : -1
        const mirrorPerp = Math.abs(Math.floor(hash / 2)) % 2 === 0 ? 1 : -1
        // Offset only mid1 perpendicularly, possibly mirrored
        const zOffset = height * 0.8 * mirrorMain
        const zMid1 = {
            x: mid1.x + perpX * zOffset * mirrorPerp,
            y: mid1.y + perpY * zOffset * mirrorPerp,
        }
        // mid2 stays on the edge
        return {
            segmentIndex: 0,
            startPoint,
            zMid1,
            zMid2: mid2,
            endPoint,
            isTooSmall,
            type: "z-shape",
        }
    } else {
        // Usual three-arm tab
        const leftTipPoint = {
            x: centerX - (dx / length) * (baseWidth / 2 - lateralOffset) + perpX * height,
            y: centerY - (dy / length) * (baseWidth / 2 - lateralOffset) + perpY * height,
        }
        const rightTipPoint = {
            x: centerX + (dx / length) * (baseWidth / 2 - lateralOffset) + perpX * height,
            y: centerY + (dy / length) * (baseWidth / 2 - lateralOffset) + perpY * height,
        }
        return {
            segmentIndex: 0,
            startPoint,
            leftTipPoint,
            rightTipPoint,
            endPoint,
            isTooSmall,
            type: "three-arm",
        }
    }
}
