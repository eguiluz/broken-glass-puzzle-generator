import { CollapsibleCard } from "@/components/CollapsibleCard"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { usePuzzleState } from "@/hooks/usePuzzleState"

interface LaserParamsSectionProps {
    state: ReturnType<typeof usePuzzleState>
}

export function LaserParamsSection({ state }: LaserParamsSectionProps) {
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
