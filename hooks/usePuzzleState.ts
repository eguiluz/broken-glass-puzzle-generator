import { useState } from "react"

/**
 * Hook genérico para gestionar el estado del generador de puzzles
 * Mantiene solo los parámetros esenciales de configuración
 */
export function usePuzzleState() {
    // Punto de origen para radialidad
    const [originX, setOriginX] = useState<number | null>(null)
    const [originY, setOriginY] = useState<number | null>(null)
    // Parámetros básicos del puzzle
    const [gridWidth, setGridWidth] = useState(24)
    const [gridHeight, setGridHeight] = useState(12)
    const [seed, setSeed] = useState(() => Date.now())

    // Parámetros de corte láser
    const [cellSize, setCellSize] = useState(10)
    const [cornerRadius, setCornerRadius] = useState(1.5)
    const [strokeWidth, setStrokeWidth] = useState(0.2)

    // Vista previa
    const [zoom, setZoom] = useState(150)
    const [showDetails, setShowDetails] = useState(false)

    // Estados de secciones colapsables
    const [showPuzzleParams, setShowPuzzleParams] = useState(true)
    const [showLaserParams, setShowLaserParams] = useState(true)
    const [showView, setShowView] = useState(false)

    // Calcula dimensiones actuales
    const width = gridWidth * cellSize
    const height = gridHeight * cellSize
    // Si no hay valor, usa el default relativo al tamaño
    const computedOriginX = originX === null ? width / 2 : originX
    const computedOriginY = originY === null ? height * 0.75 : originY

    return {
        // Parámetros del puzzle
        gridWidth,
        setGridWidth,
        gridHeight,
        setGridHeight,
        seed,
        setSeed,

        // Parámetros de corte láser
        cellSize,
        setCellSize,
        cornerRadius,
        setCornerRadius,
        strokeWidth,
        setStrokeWidth,

        // Vista
        zoom,
        setZoom,
        showDetails,
        setShowDetails,

        // Estados de secciones
        showPuzzleParams,
        setShowPuzzleParams,
        showLaserParams,
        setShowLaserParams,
        showView,
        setShowView,

        // Punto de origen radial configurable
        originX: computedOriginX,
        setOriginX,
        originY: computedOriginY,
        setOriginY,
    }
}
