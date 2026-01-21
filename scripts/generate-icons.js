const fs = require("fs")
const path = require("path")

// Función para generar un PNG simple con canvas (usando datos base64)
function generateIcon(size) {
    const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="${size}" height="${size}" fill="#E8D4B8"/>

    <!-- Puzzle piece outline -->
    <g transform="translate(${size * 0.15}, ${size * 0.15}) scale(${(size * 0.7) / 180})">
        <path d="M 20 20 L 80 20 L 80 5 Q 90 0 100 5 Q 110 0 120 5 L 120 20 L 180 20 L 180 80 L 195 80 Q 200 90 195 100 Q 200 110 195 120 L 180 120 L 180 180 L 120 180 L 120 195 Q 110 200 100 195 Q 90 200 80 195 L 80 180 L 20 180 L 20 120 L 5 120 Q 0 110 5 100 Q 0 90 5 80 L 20 80 Z"
              fill="#D4C4A8"
              stroke="#BEA883"
              stroke-width="4"/>

        <!-- Inner shape -->
        <circle cx="100" cy="100" r="30" fill="#C9B896" stroke="#B7A074" stroke-width="3"/>
    </g>
</svg>
    `.trim()

    return svg
}

try {
    const sharp = require("sharp")

    // Generar icono de 192x192
    const svg192 = generateIcon(192)
    sharp(Buffer.from(svg192))
        .resize(192, 192)
        .png()
        .toFile(path.join(__dirname, "../public/icon-192x192.png"))
        .then(() => console.log("✓ Icono 192x192 creado"))
        .catch((err) => console.error("Error 192:", err))

    // Generar icono de 512x512
    const svg512 = generateIcon(512)
    sharp(Buffer.from(svg512))
        .resize(512, 512)
        .png()
        .toFile(path.join(__dirname, "../public/icon-512x512.png"))
        .then(() => console.log("✓ Icono 512x512 creado"))
        .catch((err) => console.error("Error 512:", err))
} catch (error) {
    console.error("Sharp no disponible, usando SVG como fallback")

    // Fallback: guardar como SVG con extensión .png para que al menos se vea algo
    const svg192 = generateIcon(192)
    const svg512 = generateIcon(512)

    fs.writeFileSync(path.join(__dirname, "../public/icon-192x192.svg"), svg192)
    fs.writeFileSync(path.join(__dirname, "../public/icon-512x512.svg"), svg512)

    console.log("✓ Iconos SVG creados (renombra a .svg en manifest.json)")
}
