import { CollapsibleCard } from "@/components/CollapsibleCard"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import React from "react"

interface TabsSectionProps {
    highlightTabs: boolean
    setHighlightTabs: (v: boolean) => void
    minTabSize: number
    setMinTabSize: (v: number) => void
    tabWidth: number
    setTabWidth: (v: number) => void
    tabHeight: number
    setTabHeight: (v: number) => void
    tabAngle: number
    setTabAngle: (v: number) => void
    tabPositionJitter: number
    setTabPositionJitter: (v: number) => void
}

export function TabsSection({
    highlightTabs,
    setHighlightTabs,
    minTabSize,
    setMinTabSize,
    tabWidth,
    setTabWidth,
    tabHeight,
    setTabHeight,
    tabAngle,
    setTabAngle,
    tabPositionJitter,
    setTabPositionJitter,
}: TabsSectionProps) {
    return (
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
                <Slider value={[minTabSize]} onValueChange={([v]) => setMinTabSize(v)} min={0.5} max={20} step={0.1} />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Ancho relativo</Label>
                    <span className="text-sm font-medium">{tabWidth.toFixed(2)}</span>
                </div>
                <Slider value={[tabWidth]} onValueChange={([v]) => setTabWidth(v)} min={0.1} max={0.7} step={0.01} />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Alto relativo</Label>
                    <span className="text-sm font-medium">{tabHeight.toFixed(2)}</span>
                </div>
                <Slider value={[tabHeight]} onValueChange={([v]) => setTabHeight(v)} min={0.1} max={0.7} step={0.01} />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Ángulo (°)</Label>
                    <span className="text-sm font-medium">{tabAngle}°</span>
                </div>
                <Slider value={[tabAngle]} onValueChange={([v]) => setTabAngle(v)} min={-45} max={45} step={1} />
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
    )
}
