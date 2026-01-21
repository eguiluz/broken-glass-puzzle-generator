"use client"

import React, { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Grid3X3 } from "lucide-react"
import { ActionButtons } from "@/components/ActionButtons"
import { usePuzzleState } from "@/hooks/usePuzzleState"
import { usePuzzleGenerator } from "@/hooks/usePuzzleGenerator"
import { generateAngles } from "@/lib/generateAngles"
import { generateRings } from "@/lib/generateRings"
import { generateSeeds } from "@/lib/generateSeeds"
import { computeVoronoi } from "@/lib/computeVoronoi"
import { getPerturbedEdge } from "@/lib/reconstructEdge"
import { generateEdgeTab } from "@/lib/generateEdgeTab"
import { downloadSVGFile, generatePuzzleFilename } from "@/lib/svgDownload"
import { exportSVG } from "@/lib/exportSVG"
import { CollapsibleCard } from "@/components/CollapsibleCard"
import { LaserParamsSection } from "@/components/LaserParamsSection"
import { PuzzleParamsSection } from "@/components/PuzzleParamsSection"
import { ThemeToggle } from "@/components/ThemeToggle"
import Link from "next/link"
import { HelpCircle } from "lucide-react"
import { PreviewCard } from "@/components/PreviewCard"
import { RadialSegmentationSection } from "@/components/RadialSegmentationSection"
import { EdgeNoiseSection } from "@/components/EdgeNoiseSection"
import { TabsSection } from "@/components/TabsSection"

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
    const [tabPositionJitter, setTabPositionJitter] = React.useState(0.5)
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
        exportSVG({
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
        })
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
                    <RadialSegmentationSection
                        angleCount={angleCount}
                        setAngleCount={setAngleCount}
                        ringCount={ringCount}
                        setRingCount={setRingCount}
                        minRadiusPct={minRadiusPct}
                        setMinRadiusPct={setMinRadiusPct}
                        growthFactor={growthFactor}
                        setGrowthFactor={setGrowthFactor}
                        jitterRadius={jitterRadius}
                        setJitterRadius={setJitterRadius}
                        jitterAngle={jitterAngle}
                        setJitterAngle={setJitterAngle}
                        biasScalar={biasScalar}
                        setBiasScalar={setBiasScalar}
                    />
                    <EdgeNoiseSection
                        noiseEnabled={noiseEnabled}
                        setNoiseEnabled={setNoiseEnabled}
                        edgeSegments={edgeSegments}
                        setEdgeSegments={setEdgeSegments}
                        edgeAmplitude={edgeAmplitude}
                        setEdgeAmplitude={setEdgeAmplitude}
                        edgeFrequency={edgeFrequency}
                        setEdgeFrequency={setEdgeFrequency}
                    />
                    <TabsSection
                        highlightTabs={highlightTabs}
                        setHighlightTabs={setHighlightTabs}
                        minTabSize={minTabSize}
                        setMinTabSize={setMinTabSize}
                        tabWidth={tabWidth}
                        setTabWidth={setTabWidth}
                        tabHeight={tabHeight}
                        setTabHeight={setTabHeight}
                        tabAngle={tabAngle}
                        setTabAngle={setTabAngle}
                        tabPositionJitter={tabPositionJitter}
                        setTabPositionJitter={setTabPositionJitter}
                    />
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
