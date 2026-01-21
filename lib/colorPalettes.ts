export type ColorPalette = {
    id: string
    name: string
    colors: string[]
}

export const COLOR_PALETTES: ColorPalette[] = [
    {
        id: "wood",
        name: "Madera Natural",
        colors: [
            "#E8D4B8",
            "#D4C4A8",
            "#C9B896",
            "#BEA883",
            "#D9C9A5",
            "#CDB994",
            "#C2AC84",
            "#B7A074",
            "#E0D0B0",
            "#D5C5A0",
            "#CABAA0",
            "#BFAF90",
        ],
    },
    {
        id: "pastel",
        name: "Colores Pastel",
        colors: [
            "#FFB3BA",
            "#FFDFBA",
            "#FFFFBA",
            "#BAFFC9",
            "#BAE1FF",
            "#E0BBE4",
            "#FFDFD3",
            "#C7CEEA",
            "#FFD1DC",
            "#B5EAD7",
            "#FFDAC1",
            "#C4FAF8",
        ],
    },
    {
        id: "vibrant",
        name: "Vibrantes",
        colors: [
            "#FF6B6B",
            "#4ECDC4",
            "#45B7D1",
            "#FFA07A",
            "#98D8C8",
            "#F7DC6F",
            "#BB8FCE",
            "#85C1E2",
            "#F8B500",
            "#52B788",
            "#E63946",
            "#457B9D",
        ],
    },
    {
        id: "earth",
        name: "Tonos Tierra",
        colors: [
            "#8B4513",
            "#A0522D",
            "#CD853F",
            "#D2691E",
            "#DEB887",
            "#F4A460",
            "#BC8F8F",
            "#CD5C5C",
            "#A0826D",
            "#896C56",
            "#C19A6B",
            "#B87333",
        ],
    },
    {
        id: "ocean",
        name: "Océano",
        colors: [
            "#006994",
            "#0582CA",
            "#00A6FB",
            "#0086C9",
            "#4DA8DA",
            "#7FB3D5",
            "#009DC4",
            "#28AFB0",
            "#19647E",
            "#1F77B4",
            "#5DA5DA",
            "#73C2FB",
        ],
    },
    {
        id: "forest",
        name: "Bosque",
        colors: [
            "#2D6A4F",
            "#40916C",
            "#52B788",
            "#74C69D",
            "#95D5B2",
            "#B7E4C7",
            "#1B4332",
            "#52796F",
            "#84A98C",
            "#588157",
            "#3A5A40",
            "#344E41",
        ],
    },
    {
        id: "sunset",
        name: "Atardecer",
        colors: [
            "#FF6F61",
            "#FF8C61",
            "#FFA861",
            "#FFC461",
            "#FFE061",
            "#FFFC61",
            "#FF7F7F",
            "#FFB347",
            "#FFCC99",
            "#FF9966",
            "#FF6B9D",
            "#FF85A1",
        ],
    },
    {
        id: "candy",
        name: "Caramelo",
        colors: [
            "#FF1493",
            "#FF69B4",
            "#FFB6C1",
            "#FFC0CB",
            "#FF85C1",
            "#FF6FD8",
            "#DA70D6",
            "#EE82EE",
            "#DDA0DD",
            "#FFABE1",
            "#FF8CC8",
            "#FF7EB6",
        ],
    },
]

export function getColorFromPalette(paletteId: string, id: number): string {
    const palette = COLOR_PALETTES.find((p) => p.id === paletteId)
    if (!palette) {
        // Fallback a la paleta de madera por defecto
        return COLOR_PALETTES[0].colors[id % COLOR_PALETTES[0].colors.length]
    }
    return palette.colors[id % palette.colors.length]
}
