"use client"

import React, { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Download, RefreshCw, Grid3X3 } from "lucide-react"
import { usePuzzleState } from "@/hooks/usePuzzleState"
import { usePuzzleGenerator } from "@/hooks/usePuzzleGenerator"
import { generateAngles } from "@/lib/generateAngles"
import { generateRings } from "@/lib/generateRings"
import { generateSeeds } from "@/lib/generateSeeds"
import { computeVoronoi } from "@/lib/computeVoronoi"
import { getPerturbedEdge, clearEdgeCache } from "@/lib/reconstructEdge"
import { generateEdgeTab } from "@/lib/generateEdgeTab"
import { downloadSVGFile, generatePuzzleFilename } from "@/lib/svgDownload"
import { CollapsibleCard } from "@/components/CollapsibleCard"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from "next/link"
import { HelpCircle } from "lucide-react"
import { PreviewCard } from "./PreviewCard"

/**
 * Componente principal del generador de puzzles efecto cristal roto
 * Estructura genérica lista para implementar cualquier tipo de puzzle
 */
export function PuzzleGenerator() {
    // Parámetros de pestañas (configurables)
    const [minTabSize, setMinTabSize] = React.useState(1.3)
    const [tabWidth, setTabWidth] = React.useState(0.35)
    const [tabHeight, setTabHeight] = React.useState(0.15)
    const [tabAngle, setTabAngle] = React.useState(-30)
    // Aleatoriedad en la posición de la pestaña (0 = centro, 1 = totalmente aleatorio)
    const [tabPositionJitter, setTabPositionJitter] = React.useState(.5)
    // Toggle para marcar visualmente las pestañas
    const [highlightTabs, setHighlightTabs] = React.useState(false)
    // ...
    const [noiseEnabled, setNoiseEnabled] = React.useState(false)
    const state = usePuzzleState()

    // Parámetros configurables para la segmentación radial
    const [angleCount, setAngleCount] = React.useState(18)
    const [ringCount, setRingCount] = React.useState(8)
    const [growthFactor, setGrowthFactor] = React.useState(1.25)
    // minRadius como porcentaje del menor lado (0.05 a 0.4)
    const [minRadiusPct, setMinRadiusPct] = React.useState(0.095)
    const [jitterRadius, setJitterRadius] = React.useState(0.06)
    const [jitterAngle, setJitterAngle] = React.useState(Math.PI / 16)
    const [biasScalar, setBiasScalar] = React.useState(1.4)
    // Parámetros de ruido para bordes
    const [edgeSegments, setEdgeSegments] = React.useState(8)
    const [edgeAmplitude, setEdgeAmplitude] = React.useState(3)
    const [edgeFrequency, setEdgeFrequency] = React.useState(0.05)

    // Generar las piezas del puzzle
    const pieces = usePuzzleGenerator({
        gridWidth: state.gridWidth,
        gridHeight: state.gridHeight,
        seed: state.seed,
    })

    // Regenerar puzzle con nueva semilla
    const regenerate = useCallback(() => {
        state.setSeed(Date.now())
    }, [state])

    // Exportar SVG idéntico al preview
    const downloadSVG = useCallback(() => {
        // Replicar la lógica de PreviewCard
        const width = state.gridWidth * state.cellSize
        const height = state.gridHeight * state.cellSize
        const minRadius = Math.min(width, height) * minRadiusPct
        const maxRadius = Math.min(width, height) * 0.48
        const angles = generateAngles(angleCount)
        const rings = generateRings(ringCount, minRadius, maxRadius, growthFactor)
        // Semillas
        let seeds = generateSeeds(
            rings,
            angles,
            state.originX,
            state.originY,
            { jitterRadius: jitterRadius * Math.min(width, height), jitterAngle },
            { width, height },
        )
        // Relleno exterior
        const lastRadius = rings[rings.length - 1]
        const minSide = Math.min(width, height)
        if (lastRadius < minSide * 0.48) {
            const outerStart = lastRadius
            const outerEnd = minSide * 0.48
            const extraRings = Math.max(4, Math.ceil((outerEnd - outerStart) / 6))
            const extraAngles = angleCount * 6
            const seedValue = state.seed || 12345
            function pseudoRandom(i: number) {
                return ((seedValue * (i + 1) * 9301 + 49297) % 233280) / 233280
            }
            for (let ringIdx = 0; ringIdx < extraRings; ringIdx++) {
                const r = outerStart + ((outerEnd - outerStart) * (ringIdx + 0.5)) / extraRings
                for (let i = 0; i < extraAngles; i++) {
                    const angle = (2 * Math.PI * i) / extraAngles + pseudoRandom(i + ringIdx * 100) * 0.1
                    const x = state.originX + r * Math.cos(angle)
                    const y = state.originY + r * Math.sin(angle)
                    if (x > 0 && x < width && y > 0 && y < height) {
                        seeds.push({ x, y, r, angle })
                    }
                }
            }
        }
        const firstRingSeedIndices = Array.from({ length: angles.length }, (_, i) => i)
        const voronoiCells = computeVoronoi(
            seeds,
            { width, height },
            { origin: [state.originX, state.originY], biasScalar },
        )
        // ---
        function getTabConnectionOffset(p0: [number, number], p1: [number, number], idx: number) {
            if (tabPositionJitter === 0) return 0
            const str = `${p0[0]},${p0[1]},${p1[0]},${p1[1]},${idx}`
            let hash = 0
            for (let i = 0; i < str.length; i++) {
                hash = (hash << 5) - hash + str.charCodeAt(i)
                hash |= 0
            }
            const rand = (hash % 10000) / 10000 - 0.5
            return rand * tabPositionJitter * 0.2
        }
        // ---
        // Extra cuts
        function polygonArea(polygon: [number, number][]) {
            let area = 0
            for (let i = 0, n = polygon.length; i < n; i++) {
                const [x0, y0] = polygon[i]
                const [x1, y1] = polygon[(i + 1) % n]
                area += x0 * y1 - x1 * y0
            }
            return Math.abs(area) / 2
        }
        const maxPieceArea = 0.12 * width * height
        const extraCuts: { cut: [number, number, number, number]; cellIdx: number }[] = []
        voronoiCells.forEach((cell, cellIdx) => {
            if (firstRingSeedIndices.includes(cellIdx)) return
            const area = polygonArea(cell.polygon)
            if (area > maxPieceArea) {
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
        // ---
        // SVG
        let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`
        svg += `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}mm\" height=\"${height}mm\" viewBox=\"0 0 ${width} ${height}\">\n`
        svg += `<rect x=\"0\" y=\"0\" width=\"${width}\" height=\"${height}\" fill=\"none\" stroke=\"#222\" stroke-width=\"${state.strokeWidth}\" rx=\"${state.cornerRadius}\"/>\n`
        // --- Edges
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
        edgesToDraw.forEach(({ p0, p1 }, idx) => {
            const isBorderEdge =
                (Math.abs(p0[0]) < 1e-6 && Math.abs(p1[0]) < 1e-6) ||
                (Math.abs(p0[1]) < 1e-6 && Math.abs(p1[1]) < 1e-6) ||
                (Math.abs(p0[0] - width) < 1e-6 && Math.abs(p1[0] - width) < 1e-6) ||
                (Math.abs(p0[1] - height) < 1e-6 && Math.abs(p1[1] - height) < 1e-6)
            const edgePts = getPerturbedEdge(p0, p1, edgeSegments, noiseEnabled ? edgeAmplitude : 0, edgeFrequency)
            if (!isBorderEdge) {
                const tabConnectionOffset = getTabConnectionOffset(edgePts[0], edgePts[edgePts.length - 1], idx)
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
                    let d = ""
                    if (beforeTabScaled.length > 1) {
                        d += `M ${beforeTabScaled[0][0]} ${beforeTabScaled[0][1]}`
                        for (let i = 1; i < beforeTabScaled.length; i++) {
                            d += ` L ${beforeTabScaled[i][0]} ${beforeTabScaled[i][1]}`
                        }
                    }
                    if (afterTabScaled.length > 1) {
                        d += ` M ${afterTabScaled[0][0]} ${afterTabScaled[0][1]}`
                        for (let i = 1; i < afterTabScaled.length; i++) {
                            d += ` L ${afterTabScaled[i][0]} ${afterTabScaled[i][1]}`
                        }
                    }
                    const tabPath = `M ${sStart.x} ${sStart.y} L ${sLeft.x} ${sLeft.y} L ${sRight.x} ${sRight.y} L ${sEnd.x} ${sEnd.y}`
                    if (d) svg += `<path d=\"${d.trim()}\" fill=\"none\" stroke=\"#111\" stroke-width=\"0.45\"/>\n`
                    svg += `<path d=\"${tabPath}\" fill=\"none\" stroke=\"${highlightTabs ? "#f59e42" : "#111"}\" stroke-width=\"${highlightTabs ? 1.2 : 0.45}\"/>\n`
                    return
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
            svg += `<path d=\"${d.trim()}\" fill=\"none\" stroke=\"#111\" stroke-width=\"0.45\"/>\n`
        })
        // --- Extra cuts
        extraCuts.forEach(({ cut }, idx) => {
            const [x0, y0, x1, y1] = cut
            const edgePts = getPerturbedEdge(
                [x0, y0],
                [x1, y1],
                edgeSegments,
                noiseEnabled ? edgeAmplitude : 0,
                edgeFrequency,
            )
            const tabConnectionOffset = getTabConnectionOffset(edgePts[0], edgePts[edgePts.length - 1], idx)
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
                let d = ""
                if (beforeTabScaled.length > 1) {
                    d += `M ${beforeTabScaled[0][0]} ${beforeTabScaled[0][1]}`
                    for (let i = 1; i < beforeTabScaled.length; i++) {
                        d += ` L ${beforeTabScaled[i][0]} ${beforeTabScaled[i][1]}`
                    }
                }
                if (afterTabScaled.length > 1) {
                    d += ` M ${afterTabScaled[0][0]} ${afterTabScaled[0][1]}`
                    for (let i = 1; i < afterTabScaled.length; i++) {
                        d += ` L ${afterTabScaled[i][0]} ${afterTabScaled[i][1]}`
                    }
                }
                const tabPath = `M ${sStart.x} ${sStart.y} L ${sLeft.x} ${sLeft.y} L ${sRight.x} ${sRight.y} L ${sEnd.x} ${sEnd.y}`
                if (d) svg += `<path d=\"${d.trim()}\" fill=\"none\" stroke=\"#111\" stroke-width=\"0.45\"/>\n`
                svg += `<path d=\"${tabPath}\" fill=\"none\" stroke=\"${highlightTabs ? "#f59e42" : "#111"}\" stroke-width=\"${highlightTabs ? 1.2 : 0.45}\"/>\n`
            } else {
                const d =
                    edgePts.length > 0
                        ? `M ${edgePts[0][0]} ${edgePts[0][1]} ` +
                          edgePts
                              .slice(1)
                              .map(([x, y]) => `L ${x} ${y}`)
                              .join(" ")
                        : ""
                svg += `<path d=\"${d.trim()}\" fill=\"none\" stroke=\"#111\" stroke-width=\"0.45\" stroke-dasharray=\"3 2\"/>\n`
            }
        })
        svg += `</svg>`
        // Descargar
        const filename = generatePuzzleFilename(state.gridWidth, state.gridHeight, "cristal")
        downloadSVGFile(svg, filename)
    }, [
        state,
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
        noiseEnabled,
    ])

    const previewScale = (400 / Math.max(state.gridWidth, state.gridHeight) / state.cellSize) * (state.zoom / 100)

    return (
        <div className="h-screen flex flex-col max-w-6xl mx-auto p-4">
            <div className="text-center space-y-2 pb-4">
                <div className="flex items-center justify-center gap-3 relative">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Grid3X3 className="w-8 h-8" />
                        Generador de puzzles efecto cristal roto
                    </h1>
                    <div className="absolute right-0 flex items-center gap-2">
                        <Link href="/ayuda">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <HelpCircle className="w-4 h-4" />
                                Ayuda
                            </Button>
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-[400px_1fr] gap-4 flex-1 min-h-0">
                <div className="order-1 space-y-4 h-full overflow-y-auto pr-2">
                    <PuzzleParamsSection state={state} />
                    <LaserParamsSection state={state} />
                    {/* Controles de segmentación radial */}
                    <CollapsibleCard title="Segmentación Radial" open={true} onOpenChange={() => {}}>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Nº ángulos</Label>
                                <span className="text-sm font-medium">{angleCount}</span>
                            </div>
                            <Slider
                                value={[angleCount]}
                                onValueChange={([v]) => setAngleCount(v)}
                                min={6}
                                max={48}
                                step={1}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Nº anillos</Label>
                                <span className="text-sm font-medium">{ringCount}</span>
                            </div>
                            <Slider
                                value={[ringCount]}
                                onValueChange={([v]) => setRingCount(v)}
                                min={2}
                                max={12}
                                step={1}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Radio primer anillo</Label>
                                <span className="text-sm font-medium">{(minRadiusPct * 100).toFixed(1)}%</span>
                            </div>
                            <Slider
                                value={[minRadiusPct]}
                                onValueChange={([v]) => setMinRadiusPct(v)}
                                min={0.05}
                                max={0.4}
                                step={0.005}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Crecimiento geométrico</Label>
                                <span className="text-sm font-medium">{growthFactor.toFixed(2)}x</span>
                            </div>
                            <Slider
                                value={[growthFactor]}
                                onValueChange={([v]) => setGrowthFactor(v)}
                                min={1}
                                max={2}
                                step={0.01}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Jitter radio</Label>
                                <span className="text-sm font-medium">{(jitterRadius * 100).toFixed(1)}%</span>
                            </div>
                            <Slider
                                value={[jitterRadius]}
                                onValueChange={([v]) => setJitterRadius(v)}
                                min={0}
                                max={0.1}
                                step={0.001}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Jitter ángulo</Label>
                                <span className="text-sm font-medium">
                                    {((jitterAngle * 180) / Math.PI).toFixed(1)}°
                                </span>
                            </div>
                            <Slider
                                value={[jitterAngle]}
                                onValueChange={([v]) => setJitterAngle(v)}
                                min={0}
                                max={Math.PI / 8}
                                step={0.001}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Sesgo radial</Label>
                                <span className="text-sm font-medium">{biasScalar.toFixed(2)}x</span>
                            </div>
                            <Slider
                                value={[biasScalar]}
                                onValueChange={([v]) => setBiasScalar(v)}
                                min={0.5}
                                max={2}
                                step={0.01}
                            />
                        </div>
                    </CollapsibleCard>
                    <CollapsibleCard title="Ruido de Bordes" open={true} onOpenChange={() => {}}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="noiseEnabled"
                                    checked={noiseEnabled}
                                    onChange={(e) => setNoiseEnabled(e.target.checked)}
                                />
                                <Label htmlFor="noiseEnabled">Activar ruido en bordes</Label>
                            </div>
                            <div className="flex justify-between">
                                <Label>Subdivisiones</Label>
                                <span className="text-sm font-medium">{edgeSegments}</span>
                            </div>
                            <Slider
                                value={[edgeSegments]}
                                onValueChange={([v]) => setEdgeSegments(v)}
                                min={2}
                                max={24}
                                step={1}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Amplitud</Label>
                                <span className="text-sm font-medium">{edgeAmplitude.toFixed(1)}mm</span>
                            </div>
                            <Slider
                                value={[edgeAmplitude]}
                                onValueChange={([v]) => setEdgeAmplitude(v)}
                                min={0}
                                max={10}
                                step={0.1}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Frecuencia</Label>
                                <span className="text-sm font-medium">{edgeFrequency.toFixed(3)}</span>
                            </div>
                            <Slider
                                value={[edgeFrequency]}
                                onValueChange={([v]) => setEdgeFrequency(v)}
                                min={0.01}
                                max={0.2}
                                step={0.001}
                            />
                        </div>
                    </CollapsibleCard>
                    <CollapsibleCard title="Pestañas (tabs)" open={true} onOpenChange={() => {}}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="highlightTabs"
                                    checked={highlightTabs}
                                    onChange={(e) => setHighlightTabs(e.target.checked)}
                                />
                                <Label htmlFor="highlightTabs">Marcar visualmente pestañas</Label>
                            </div>
                            <div className="flex justify-between">
                                <Label>Tamaño mínimo (mm)</Label>
                                <span className="text-sm font-medium">{minTabSize}</span>
                            </div>
                            <Slider
                                value={[minTabSize]}
                                onValueChange={([v]) => setMinTabSize(v)}
                                min={0.5}
                                max={20}
                                step={0.1}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Ancho relativo</Label>
                                <span className="text-sm font-medium">{tabWidth.toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[tabWidth]}
                                onValueChange={([v]) => setTabWidth(v)}
                                min={0.1}
                                max={0.7}
                                step={0.01}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Alto relativo</Label>
                                <span className="text-sm font-medium">{tabHeight.toFixed(2)}</span>
                            </div>
                            <Slider
                                value={[tabHeight]}
                                onValueChange={([v]) => setTabHeight(v)}
                                min={0.1}
                                max={0.7}
                                step={0.01}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Ángulo (°)</Label>
                                <span className="text-sm font-medium">{tabAngle}°</span>
                            </div>
                            <Slider
                                value={[tabAngle]}
                                onValueChange={([v]) => setTabAngle(v)}
                                min={-45}
                                max={45}
                                step={1}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Jitter posición pestaña</Label>
                                <span className="text-sm font-medium">{(tabPositionJitter * 100).toFixed(0)}%</span>
                            </div>
                            <Slider
                                value={[tabPositionJitter]}
                                onValueChange={([v]) => setTabPositionJitter(v)}
                                min={0}
                                max={1}
                                step={0.01}
                            />
                        </div>
                    </CollapsibleCard>
                    <ActionButtons regenerate={regenerate} downloadSVG={downloadSVG} />
                </div>

                <PreviewCard
                    state={state}
                    pieces={pieces}
                    previewScale={previewScale}
                    angleCount={angleCount}
                    ringCount={ringCount}
                    growthFactor={growthFactor}
                    minRadiusPct={minRadiusPct}
                    jitterRadius={jitterRadius}
                    jitterAngle={jitterAngle}
                    biasScalar={biasScalar}
                    edgeSegments={edgeSegments}
                    edgeAmplitude={noiseEnabled ? edgeAmplitude : 0}
                    edgeFrequency={edgeFrequency}
                    minTabSize={minTabSize}
                    tabWidth={tabWidth}
                    tabHeight={tabHeight}
                    tabAngle={tabAngle}
                    tabPositionJitter={tabPositionJitter}
                    highlightTabs={highlightTabs}
                />
            </div>
        </div>
    )
}

// Secciones de configuración
function PuzzleParamsSection({ state }: { state: ReturnType<typeof usePuzzleState> }) {
    return (
        <CollapsibleCard
            title="Parámetros del puzzle"
            open={state.showPuzzleParams}
            onOpenChange={state.setShowPuzzleParams}
        >
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Ancho: {state.gridWidth} celdas</Label>
                    <span className="text-sm text-muted-foreground">{state.gridWidth * state.cellSize}mm</span>
                </div>
                <Slider
                    value={[state.gridWidth]}
                    onValueChange={([v]) => state.setGridWidth(v)}
                    min={5}
                    max={30}
                    step={1}
                />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Alto: {state.gridHeight} celdas</Label>
                    <span className="text-sm text-muted-foreground">{state.gridHeight * state.cellSize}mm</span>
                </div>
                <Slider
                    value={[state.gridHeight]}
                    onValueChange={([v]) => state.setGridHeight(v)}
                    min={5}
                    max={30}
                    step={1}
                />
            </div>
            {/* TODO: Añadir más parámetros según el tipo de puzzle */}
        </CollapsibleCard>
    )
}

function LaserParamsSection({ state }: { state: ReturnType<typeof usePuzzleState> }) {
    return (
        <CollapsibleCard
            title="Parámetros de Corte Láser"
            open={state.showLaserParams}
            onOpenChange={state.setShowLaserParams}
        >
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Tamaño de celda</Label>
                    <span className="text-sm font-medium">{state.cellSize}mm</span>
                </div>
                <Slider
                    value={[state.cellSize]}
                    onValueChange={([v]) => state.setCellSize(v)}
                    min={5}
                    max={20}
                    step={0.5}
                />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Radio de esquinas</Label>
                    <span className="text-sm font-medium">{state.cornerRadius}mm</span>
                </div>
                <Slider
                    value={[state.cornerRadius]}
                    onValueChange={([v]) => state.setCornerRadius(v)}
                    min={0}
                    max={5}
                    step={0.1}
                />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Grosor de línea</Label>
                    <span className="text-sm font-medium">{state.strokeWidth}mm</span>
                </div>
                <Slider
                    value={[state.strokeWidth]}
                    onValueChange={([v]) => state.setStrokeWidth(v)}
                    min={0.1}
                    max={1}
                    step={0.05}
                />
            </div>
        </CollapsibleCard>
    )
}

//

function ActionButtons({ regenerate, downloadSVG }: { regenerate: () => void; downloadSVG: () => void }) {
    return (
        <div className="flex gap-2">
            <Button onClick={regenerate} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar
            </Button>
            <Button onClick={downloadSVG} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Descargar SVG
            </Button>
        </div>
    )
}
