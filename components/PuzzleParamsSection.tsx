import { CollapsibleCard } from "@/components/CollapsibleCard"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { usePuzzleState } from "@/hooks/usePuzzleState"

interface PuzzleParamsSectionProps {
    state: ReturnType<typeof usePuzzleState>
}

export function PuzzleParamsSection({ state }: PuzzleParamsSectionProps) {
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
        </CollapsibleCard>
    )
}
