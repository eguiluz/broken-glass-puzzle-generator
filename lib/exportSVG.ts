import { generateAngles } from "@/lib/generateAngles"
import { generateRings } from "@/lib/generateRings"
import { generateSeeds } from "@/lib/generateSeeds"
import { computeVoronoi } from "@/lib/computeVoronoi"
import { getPerturbedEdge } from "@/lib/reconstructEdge"
import { generateEdgeTab } from "@/lib/generateEdgeTab"
import { downloadSVGFile, generatePuzzleFilename } from "@/lib/svgDownload"

interface ExportSVGParams {
    state: any
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
    noiseEnabled: boolean
}

export function exportSVG(params: ExportSVGParams) {
    const {
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
    } = params

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
                if (d) svg += `<path d=\"${d.trim()}\" fill=\"none\" stroke=\"#111\" stroke-width=\"0.15\"/>\n`
                svg += `<path d=\"${tabPath}\" fill=\"none\" stroke=\"${highlightTabs ? "#f59e42" : "#111"}\" stroke-width=\"${highlightTabs ? 1.2 : 0.15}\"/>\n`
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
        svg += `<path d=\"${d.trim()}\" fill=\"none\" stroke=\"#111\" stroke-width=\"0.15\"/>\n`
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
            if (d) svg += `<path d=\"${d.trim()}\" fill=\"none\" stroke=\"#111\" stroke-width=\"0.15\"/>\n`
            svg += `<path d=\"${tabPath}\" fill=\"none\" stroke=\"${highlightTabs ? "#f59e42" : "#111"}\" stroke-width=\"${highlightTabs ? 1.2 : 0.15}\"/>\n`
        } else {
            const d =
                edgePts.length > 0
                    ? `M ${edgePts[0][0]} ${edgePts[0][1]} ` +
                    edgePts
                        .slice(1)
                        .map(([x, y]) => `L ${x} ${y}`)
                        .join(" ")
                    : ""
            svg += `<path d=\"${d.trim()}\" fill=\"none\" stroke=\"#111\" stroke-width=\"0.15\" stroke-dasharray=\"3 2\"/>\n`
        }
    })
    svg += `</svg>`
    // Descargar
    const filename = generatePuzzleFilename(state.gridWidth, state.gridHeight, "cristal")
    downloadSVGFile(svg, filename)
}