import { CollapsibleCard } from "@/components/CollapsibleCard"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import React from "react"

interface EdgeNoiseSectionProps {
    noiseEnabled: boolean
    setNoiseEnabled: (v: boolean) => void
    edgeSegments: number
    setEdgeSegments: (v: number) => void
    edgeAmplitude: number
    setEdgeAmplitude: (v: number) => void
    edgeFrequency: number
    setEdgeFrequency: (v: number) => void
}

export function EdgeNoiseSection({
    noiseEnabled,
    setNoiseEnabled,
    edgeSegments,
    setEdgeSegments,
    edgeAmplitude,
    setEdgeAmplitude,
    edgeFrequency,
    setEdgeFrequency,
}: EdgeNoiseSectionProps) {
    return (
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
                <Slider value={[edgeSegments]} onValueChange={([v]) => setEdgeSegments(v)} min={2} max={24} step={1} />
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
                    max={2}
                    step={0.01}
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
    )
}
