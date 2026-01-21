import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { CollapsibleCardProps } from "@/types/components"

export function CollapsibleCard({ title, open, onOpenChange, children }: CollapsibleCardProps) {
    return (
        <Collapsible open={open} onOpenChange={onOpenChange}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="text-lg flex items-center justify-between">
                            {title}
                            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="space-y-4">{children}</CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}
