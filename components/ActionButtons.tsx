import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

interface ActionButtonsProps {
    regenerate: () => void
    downloadSVG: () => void
}

export function ActionButtons({ regenerate, downloadSVG }: ActionButtonsProps) {
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
