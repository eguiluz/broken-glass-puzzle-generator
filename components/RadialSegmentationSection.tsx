import { CollapsibleCard } from "@/components/CollapsibleCard"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface RadialSegmentationSectionProps {
    angleCount: number
    setAngleCount: (v: number) => void
    ringCount: number
    setRingCount: (v: number) => void
    minRadiusPct: number
    setMinRadiusPct: (v: number) => void
    growthFactor: number
    setGrowthFactor: (v: number) => void
    jitterRadius: number
    setJitterRadius: (v: number) => void
    jitterAngle: number
    setJitterAngle: (v: number) => void
    biasScalar: number
    setBiasScalar: (v: number) => void
}

export function RadialSegmentationSection({
    angleCount,
    setAngleCount,
    ringCount,
    setRingCount,
    minRadiusPct,
    setMinRadiusPct,
    growthFactor,
    setGrowthFactor,
    jitterRadius,
    setJitterRadius,
    jitterAngle,
    setJitterAngle,
    biasScalar,
    setBiasScalar,
}: RadialSegmentationSectionProps) {
    return (
        <CollapsibleCard title="Segmentación Radial" open={true} onOpenChange={() => {}}>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Nº ángulos</Label>
                    <span className="text-sm font-medium">{angleCount}</span>
                </div>
                <Slider value={[angleCount]} onValueChange={([v]) => setAngleCount(v)} min={6} max={48} step={1} />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between">
                    <Label>Nº anillos</Label>
                    <span className="text-sm font-medium">{ringCount}</span>
                </div>
                <Slider value={[ringCount]} onValueChange={([v]) => setRingCount(v)} min={2} max={12} step={1} />
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
                    <span className="text-sm font-medium">{((jitterAngle * 180) / Math.PI).toFixed(1)}°</span>
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
                <Slider value={[biasScalar]} onValueChange={([v]) => setBiasScalar(v)} min={0.5} max={2} step={0.01} />
            </div>
        </CollapsibleCard>
    )
}
