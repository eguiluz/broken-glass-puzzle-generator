"use client"

import React from "react"
import { STROKE_WIDTH, STROKE_COLOR } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { usePuzzleState } from "@/hooks/usePuzzleState"
import { generateAngles } from "@/lib/generateAngles"
import { generateRings } from "@/lib/generateRings"
import { generateSeeds } from "@/lib/generateSeeds"
import { computeVoronoi } from "@/lib/computeVoronoi"
import { getPerturbedEdge, clearEdgeCache } from "@/lib/reconstructEdge"
import { generateEdgeTab } from "@/lib/generateEdgeTab"

interface PreviewCardProps {
    state: ReturnType<typeof usePuzzleState>
    pieces: any[]
    previewScale: number
    angleCount: number
    ringCount: number
    growthFactor: number
    minRadiusPct: number
    jitterRadius: number
    jitterAngle: number
    biasScalar: number
    edgeSegments: number
    edgeAmplitude: number
    edgeFrequency: number
    minTabSize: number
    tabWidth: number
    tabHeight: number
    tabAngle: number
    tabPositionJitter: number
    highlightTabs: boolean
}

export function PreviewCard({
    state,
    pieces,
    previewScale,
    angleCount,
    ringCount,
    growthFactor,
    minRadiusPct,
    jitterRadius,
    jitterAngle,
    biasScalar,
    edgeSegments,
    edgeAmplitude,
    edgeFrequency,
    minTabSize,
    tabWidth,
    tabHeight,
    tabAngle,
    tabPositionJitter,
    highlightTabs,
}: PreviewCardProps) {
    // Parámetros de pestañas (pueden hacerse configurables)
    // Los parámetros de pestaña ahora vienen de props
    // Offset aleatorio para la posición de la pestaña (en porcentaje de la arista)
    function getTabConnectionOffset(p0: [number, number], p1: [number, number], idx: number) {
        if (tabPositionJitter === 0) return 0
        // Generar un valor pseudoaleatorio determinista por arista
        const str = `${p0[0]},${p0[1]},${p1[0]},${p1[1]},${idx}`
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i)
            hash |= 0
        }
        // Normalizar a [-0.5, 0.5]
        const rand = (hash % 10000) / 10000 - 0.5
        // Limitar el desplazamiento máximo a ±0.2 (±20% de la arista)
        return rand * tabPositionJitter * 0.2
    }
    // Dimensiones en mm
    const width = state.gridWidth * state.cellSize
    const height = state.gridHeight * state.cellSize
    // Escalado para previsualización
    const svgWidth = width * previewScale
    const svgHeight = height * previewScale
    // El borderRadius del SVG debe estar en px y escalar igual que el rx del rect
    // Parámetros para la generación radial (pueden hacerse configurables)
    const minRadius = Math.min(width, height) * minRadiusPct
    const maxRadius = Math.min(width, height) * 0.48
    // Generar semillas radiales con crecimiento geométrico
    const angles = generateAngles(angleCount)
    const rings = generateRings(ringCount, minRadius, maxRadius, growthFactor)
    // Generar todas las semillas (radiales + extra) de forma pura y estable
    const seeds = React.useMemo(() => {
        let baseSeeds = generateSeeds(
            rings,
            angles,
            state.originX,
            state.originY,
            { jitterRadius: jitterRadius * Math.min(width, height), jitterAngle },
            { width, height },
        )
        // Rellenar el área exterior si el último anillo no cubre el área
        const lastRadius = rings[rings.length - 1]
        const minSide = Math.min(width, height)
        if (lastRadius < minSide * 0.48) {
            // Generar varios anillos de semillas en el área exterior para evitar piezas grandes
            const outerStart = lastRadius
            const outerEnd = minSide * 0.48
            const extraRings = Math.max(4, Math.ceil((outerEnd - outerStart) / 6))
            const extraAngles = angleCount * 6 // Mucha más densidad angular para piezas pequeñas
            const seedValue = state.seed || 12345
            function pseudoRandom(i: number) {
                // Simple LCG
                return ((seedValue * (i + 1) * 9301 + 49297) % 233280) / 233280
            }
            for (let ringIdx = 0; ringIdx < extraRings; ringIdx++) {
                const r = outerStart + ((outerEnd - outerStart) * (ringIdx + 0.5)) / extraRings
                for (let i = 0; i < extraAngles; i++) {
                    const angle = (2 * Math.PI * i) / extraAngles + pseudoRandom(i + ringIdx * 100) * 0.1
                    const x = state.originX + r * Math.cos(angle)
                    const y = state.originY + r * Math.sin(angle)
                    if (x > 0 && x < width && y > 0 && y < height) {
                        baseSeeds.push({ x, y, r, angle })
                    }
                }
            }
        }
        return baseSeeds
    }, [rings, angles, state.originX, state.originY, jitterRadius, jitterAngle, width, height, angleCount, state.seed])
    // Indices de las semillas del primer anillo
    const firstRingSeedIndices = Array.from({ length: angles.length }, (_, i) => i)
    // Limpiar cache de bordes al regenerar
    React.useEffect(() => {
        clearEdgeCache()
    }, [
        state.gridWidth,
        state.gridHeight,
        angleCount,
        ringCount,
        jitterRadius,
        jitterAngle,
        biasScalar,
        edgeSegments,
        edgeAmplitude,
        edgeFrequency,
        state.originX,
        state.originY,
    ])
    // Calcular celdas Voronoi con sesgo radial
    const voronoiCells = computeVoronoi(
        seeds,
        { width, height },
        { origin: [state.originX, state.originY], biasScalar },
    )

    // Handler para click en el SVG
    function handleSvgClick(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
        const rect = (e.target as SVGSVGElement).getBoundingClientRect()
        // Coordenadas relativas al SVG (viewBox)
        const x = ((e.clientX - rect.left) / rect.width) * width
        const y = ((e.clientY - rect.top) / rect.height) * height
        state.setOriginX(x)
        state.setOriginY(y)
    }
    // --- NUEVO: Dividir piezas exteriores grandes con líneas tangenciales ---
    // Utilidad para calcular el área de un polígono
    function polygonArea(polygon: [number, number][]) {
        let area = 0
        for (let i = 0, n = polygon.length; i < n; i++) {
            const [x0, y0] = polygon[i]
            const [x1, y1] = polygon[(i + 1) % n]
            area += x0 * y1 - x1 * y0
        }
        return Math.abs(area) / 2
    }

    // Umbral de área para dividir piezas grandes (en mm^2)
    const maxPieceArea = 0.12 * width * height // 12% del área total

    // Generar líneas de corte tangenciales para piezas grandes
    const extraCuts: { cut: [number, number, number, number]; cellIdx: number }[] = []
    voronoiCells.forEach((cell, cellIdx) => {
        // Solo piezas exteriores (relleno): están fuera del último anillo
        if (firstRingSeedIndices.includes(cellIdx)) return
        const area = polygonArea(cell.polygon)
        if (area > maxPieceArea) {
            // Buscar el borde más largo (probablemente exterior)
            let maxLen = 0,
                maxIdx = 0
            for (let i = 0; i < cell.polygon.length; i++) {
                const [x0, y0] = cell.polygon[i]
                const [x1, y1] = cell.polygon[(i + 1) % cell.polygon.length]
                const len = Math.hypot(x1 - x0, y1 - y0)
                if (len > maxLen) {
                    maxLen = len
                    maxIdx = i
                }
            }
            // Trazar una línea de corte desde el punto medio de ese borde al punto medio del borde opuesto
            const n = cell.polygon.length
            const idxA = maxIdx
            const idxB = (maxIdx + Math.floor(n / 2)) % n
            const [xA0, yA0] = cell.polygon[idxA]
            const [xA1, yA1] = cell.polygon[(idxA + 1) % n]
            const [xB0, yB0] = cell.polygon[idxB]
            const [xB1, yB1] = cell.polygon[(idxB + 1) % n]
            const midA: [number, number] = [(xA0 + xA1) / 2, (yA0 + yA1) / 2]
            const midB: [number, number] = [(xB0 + xB1) / 2, (yB0 + yB1) / 2]
            extraCuts.push({ cut: [midA[0], midA[1], midB[0], midB[1]], cellIdx })
        }
    })

    return (
        <Card className="order-2 h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Vista Previa</CardTitle>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <Label className="text-xs text-muted-foreground whitespace-nowrap">Zoom: {state.zoom}%</Label>
                    <Slider
                        value={[state.zoom]}
                        onValueChange={([v]) => state.setZoom(v)}
                        min={50}
                        max={300}
                        step={10}
                        className="flex-1"
                    />
                </div>
                {/* El control de grosor de línea se gestiona desde el estado global */}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex items-center justify-center bg-muted/30">
                    <svg
                        width={svgWidth}
                        height={svgHeight}
                        viewBox={`0 0 ${width} ${height}`}
                        style={{
                            cursor: "crosshair",
                            background: "#fff",
                            boxShadow: "0 0 0 1px #ccc",
                        }}
                        xmlns="http://www.w3.org/2000/svg"
                        onClick={handleSvgClick}
                    >
                        {/* Marco del puzzle */}
                        <rect
                            x={0}
                            y={0}
                            width={width}
                            height={height}
                            fill="none"
                            stroke="#222"
                            strokeWidth={state.strokeWidth}
                            rx={0}
                        />
                        {/* Aristas normales */}
                        {(() => {
                            const edgeSet = new Set<string>()
                            const edgesToDraw: { p0: [number, number]; p1: [number, number] }[] = []
                            voronoiCells.forEach((cell, cellIdx) => {
                                if (firstRingSeedIndices.includes(cellIdx)) return
                                const n = cell.polygon.length
                                for (let j = 0; j < n; j++) {
                                    const p0 = cell.polygon[j]
                                    const p1 = cell.polygon[(j + 1) % n]
                                    const key =
                                        p0[0] < p1[0] || (p0[0] === p1[0] && p0[1] < p1[1])
                                            ? `${p0[0]},${p0[1]}|${p1[0]},${p1[1]}`
                                            : `${p1[0]},${p1[1]}|${p0[0]},${p0[1]}`
                                    if (!edgeSet.has(key)) {
                                        edgeSet.add(key)
                                        edgesToDraw.push({ p0, p1 })
                                    }
                                }
                            })
                            return edgesToDraw.map(({ p0, p1 }, idx) => {
                                // Detectar si el borde es parte del marco exterior
                                const isBorderEdge =
                                    (Math.abs(p0[0]) < 1e-6 && Math.abs(p1[0]) < 1e-6) || // borde izquierdo
                                    (Math.abs(p0[1]) < 1e-6 && Math.abs(p1[1]) < 1e-6) || // borde superior
                                    (Math.abs(p0[0] - width) < 1e-6 && Math.abs(p1[0] - width) < 1e-6) || // borde derecho
                                    (Math.abs(p0[1] - height) < 1e-6 && Math.abs(p1[1] - height) < 1e-6) // borde inferior
                                const edgePts = getPerturbedEdge(
                                    p0,
                                    p1,
                                    edgeSegments,
                                    isBorderEdge ? 0 : edgeAmplitude * state.cellSize * 0.1,
                                    edgeFrequency,
                                )
                                // No dibujar pestañas en los bordes exteriores
                                if (!isBorderEdge) {
                                    const tabConnectionOffset = getTabConnectionOffset(
                                        edgePts[0],
                                        edgePts[edgePts.length - 1],
                                        idx,
                                    )
                                    const tab = generateEdgeTab(
                                        edgePts[0],
                                        edgePts[edgePts.length - 1],
                                        minTabSize,
                                        tabWidth,
                                        tabHeight,
                                        tabAngle,
                                        tabConnectionOffset,
                                    )
                                    if (tab && !tab.isTooSmall) {
                                        const findClosestIdx = (pt: { x: number; y: number }) => {
                                            let minDist = Infinity,
                                                minIdx = 0
                                            for (let i = 0; i < edgePts.length; i++) {
                                                const dx = edgePts[i][0] - pt.x
                                                const dy = edgePts[i][1] - pt.y
                                                const d = dx * dx + dy * dy
                                                if (d < minDist) {
                                                    minDist = d
                                                    minIdx = i
                                                }
                                            }
                                            return minIdx
                                        }
                                        if (!tab) return null
                                        const idxStart = findClosestIdx(tab.startPoint)
                                        const idxEnd = findClosestIdx(tab.endPoint)
                                        const beforeTabOrig = edgePts.slice(0, idxStart + 1)
                                        const afterTabOrig = edgePts.slice(idxEnd)
                                        const tabVisualScale = 0.6
                                        function scaleTabPoint(pt: { x: number; y: number }) {
                                            if (!tab) return pt
                                            const cx = (tab.startPoint.x + tab.endPoint.x) / 2
                                            const cy = (tab.startPoint.y + tab.endPoint.y) / 2
                                            return {
                                                x: cx + (pt.x - cx) * tabVisualScale,
                                                y: cy + (pt.y - cy) * tabVisualScale,
                                            }
                                        }
                                        const sStart = scaleTabPoint(tab.startPoint)
                                        const sLeft = scaleTabPoint(tab.leftTipPoint)
                                        const sRight = scaleTabPoint(tab.rightTipPoint)
                                        const sEnd = scaleTabPoint(tab.endPoint)
                                        const beforeTabScaled = beforeTabOrig.map((pt, i) =>
                                            i === beforeTabOrig.length - 1 ? [sStart.x, sStart.y] : pt,
                                        )
                                        const afterTabScaled = afterTabOrig.map((pt, i) =>
                                            i === 0 ? [sEnd.x, sEnd.y] : pt,
                                        )
                                        const d = []
                                        if (beforeTabScaled.length > 1) {
                                            d.push(`M ${beforeTabScaled[0][0]} ${beforeTabScaled[0][1]}`)
                                            for (let i = 1; i < beforeTabScaled.length; i++) {
                                                d.push(`L ${beforeTabScaled[i][0]} ${beforeTabScaled[i][1]}`)
                                            }
                                        }
                                        if (afterTabScaled.length > 1) {
                                            d.push(`M ${afterTabScaled[0][0]} ${afterTabScaled[0][1]}`)
                                            for (let i = 1; i < afterTabScaled.length; i++) {
                                                d.push(`L ${afterTabScaled[i][0]} ${afterTabScaled[i][1]}`)
                                            }
                                        }
                                        const tabPath = `M ${sStart.x} ${sStart.y} L ${sLeft.x} ${sLeft.y} L ${sRight.x} ${sRight.y} L ${sEnd.x} ${sEnd.y}`
                                        return (
                                            <g key={idx}>
                                                {d.length > 0 && (
                                                    <path
                                                        d={d.join(" ")}
                                                        fill="none"
                                                        stroke={STROKE_COLOR}
                                                        strokeWidth={state.strokeWidth}
                                                    />
                                                )}
                                                <path
                                                    d={tabPath}
                                                    fill="none"
                                                    stroke={highlightTabs ? "#f59e42" : "#111"}
                                                    strokeWidth={highlightTabs ? 1.2 : state.strokeWidth}
                                                />
                                            </g>
                                        )
                                    }
                                }
                                // Si no hay pestaña (o es borde exterior), dibujar solo la arista
                                const d =
                                    edgePts.length > 0
                                        ? `M ${edgePts[0][0]} ${edgePts[0][1]} ` +
                                        edgePts
                                            .slice(1)
                                            .map(([x, y]) => `L ${x} ${y}`)
                                            .join(" ")
                                        : ""
                                return (
                                    <path
                                        key={idx}
                                        d={d}
                                        fill="none"
                                        stroke={STROKE_COLOR}
                                        strokeWidth={state.strokeWidth}
                                    />
                                )
                            })
                        })()}
                        {/* Líneas de corte tangenciales para piezas grandes */}
                        {extraCuts.map(({ cut }, idx) => {
                            const [x0, y0, x1, y1] = cut
                            // Generar pestaña para la línea de corte
                            const edgePts = getPerturbedEdge(
                                [x0, y0],
                                [x1, y1],
                                edgeSegments,
                                edgeAmplitude * state.cellSize * 0.3,
                                edgeFrequency,
                            )
                            const tabConnectionOffset = getTabConnectionOffset(
                                edgePts[0],
                                edgePts[edgePts.length - 1],
                                idx,
                            )
                            const tab = generateEdgeTab(
                                edgePts[0],
                                edgePts[edgePts.length - 1],
                                minTabSize,
                                tabWidth,
                                tabHeight,
                                tabAngle,
                                tabConnectionOffset,
                            )
                            if (tab && !tab.isTooSmall) {
                                const findClosestIdx = (pt: { x: number; y: number }) => {
                                    let minDist = Infinity,
                                        minIdx = 0
                                    for (let i = 0; i < edgePts.length; i++) {
                                        const dx = edgePts[i][0] - pt.x
                                        const dy = edgePts[i][1] - pt.y
                                        const d = dx * dx + dy * dy
                                        if (d < minDist) {
                                            minDist = d
                                            minIdx = i
                                        }
                                    }
                                    return minIdx
                                }
                                if (!tab) return null
                                const idxStart = findClosestIdx(tab.startPoint)
                                const idxEnd = findClosestIdx(tab.endPoint)
                                const beforeTabOrig = edgePts.slice(0, idxStart + 1)
                                const afterTabOrig = edgePts.slice(idxEnd)
                                const tabVisualScale = 0.6
                                function scaleTabPoint(pt: { x: number; y: number }) {
                                    if (!tab) return pt
                                    const cx = (tab.startPoint.x + tab.endPoint.x) / 2
                                    const cy = (tab.startPoint.y + tab.endPoint.y) / 2
                                    return {
                                        x: cx + (pt.x - cx) * tabVisualScale,
                                        y: cy + (pt.y - cy) * tabVisualScale,
                                    }
                                }
                                const sStart = scaleTabPoint(tab.startPoint)
                                const sLeft = scaleTabPoint(tab.leftTipPoint)
                                const sRight = scaleTabPoint(tab.rightTipPoint)
                                const sEnd = scaleTabPoint(tab.endPoint)
                                const beforeTabScaled = beforeTabOrig.map((pt, i) =>
                                    i === beforeTabOrig.length - 1 ? [sStart.x, sStart.y] : pt,
                                )
                                const afterTabScaled = afterTabOrig.map((pt, i) => (i === 0 ? [sEnd.x, sEnd.y] : pt))
                                const d = []
                                if (beforeTabScaled.length > 1) {
                                    d.push(`M ${beforeTabScaled[0][0]} ${beforeTabScaled[0][1]}`)
                                    for (let i = 1; i < beforeTabScaled.length; i++) {
                                        d.push(`L ${beforeTabScaled[i][0]} ${beforeTabScaled[i][1]}`)
                                    }
                                }
                                if (afterTabScaled.length > 1) {
                                    d.push(`M ${afterTabScaled[0][0]} ${afterTabScaled[0][1]}`)
                                    for (let i = 1; i < afterTabScaled.length; i++) {
                                        d.push(`L ${afterTabScaled[i][0]} ${afterTabScaled[i][1]}`)
                                    }
                                }
                                const tabPath = `M ${sStart.x} ${sStart.y} L ${sLeft.x} ${sLeft.y} L ${sRight.x} ${sRight.y} L ${sEnd.x} ${sEnd.y}`
                                return (
                                    <g key={"cut-" + idx}>
                                        {d.length > 0 && (
                                            <path
                                                d={d.join(" ")}
                                                fill="none"
                                                stroke={STROKE_COLOR}
                                                strokeWidth={state.strokeWidth}
                                            />
                                        )}
                                        <path
                                            d={tabPath}
                                            fill="none"
                                            stroke={highlightTabs ? "#f59e42" : "#111"}
                                            strokeWidth={highlightTabs ? 1.2 : state.strokeWidth}
                                        />
                                    </g>
                                )
                            } else {
                                const d =
                                    edgePts.length > 0
                                        ? `M ${edgePts[0][0]} ${edgePts[0][1]} ` +
                                        edgePts
                                            .slice(1)
                                            .map(([x, y]) => `L ${x} ${y}`)
                                            .join(" ")
                                        : ""
                                return (
                                    <path
                                        key={"cut-" + idx}
                                        d={d}
                                        fill="none"
                                        stroke={STROKE_COLOR}
                                        strokeWidth={state.strokeWidth}
                                        strokeDasharray="3 2"
                                    />
                                )
                            }
                        })}
                    </svg>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="text-center text-sm text-muted-foreground">
                        {/* Mostrar número de aristas dibujadas en vez de piezas */}
                        {(() => {
                            const edgeSet = new Set<string>()
                            voronoiCells.forEach((cell) => {
                                const n = cell.polygon.length
                                for (let j = 0; j < n; j++) {
                                    const p0 = cell.polygon[j]
                                    const p1 = cell.polygon[(j + 1) % n]
                                    const key =
                                        p0[0] < p1[0] || (p0[0] === p1[0] && p0[1] < p1[1])
                                            ? `${p0[0]},${p0[1]}|${p1[0]},${p1[1]}`
                                            : `${p1[0]},${p1[1]}|${p0[0]},${p0[1]}`
                                    edgeSet.add(key)
                                }
                            })
                            // Excluir las celdas del primer anillo (borde)
                            const numPiezas = voronoiCells.length - firstRingSeedIndices.length
                            return `~ ${numPiezas} piezas | ${width}mm x ${height}mm`
                        })()}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
