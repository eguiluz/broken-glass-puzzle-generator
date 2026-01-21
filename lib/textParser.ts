import { ALL_KAWAII_EMOJIS } from "@/constants/emojis"

/**
 * Parses text into individual units (characters or multi-character emojis)
 * Handles kawaii emojis as single units even if they are multiple characters
 */
export function parseTextIntoUnits(text: string): string[] {
    const units: string[] = []
    let remaining = text

    while (remaining.length > 0) {
        let foundEmoji = false
        for (const emoji of ALL_KAWAII_EMOJIS) {
            if (remaining.startsWith(emoji)) {
                units.push(emoji)
                remaining = remaining.slice(emoji.length)
                foundEmoji = true
                break
            }
        }

        if (!foundEmoji) {
            if (remaining[0] === " " || remaining[0] === "\n") {
                remaining = remaining.slice(1)
            } else {
                units.push(remaining[0])
                remaining = remaining.slice(1)
            }
        }
    }

    return units
}
