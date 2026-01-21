import { ReactNode } from "react"

/**
 * Props for the CollapsibleCard component
 */
export interface CollapsibleCardProps {
    title: string | ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
    children: ReactNode
}

// TODO: Añadir tipos específicos según el tipo de puzzle que se implemente
