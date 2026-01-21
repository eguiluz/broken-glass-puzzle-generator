const fs = require("fs")
const path = require("path")
const sharp = require("sharp")

const svg = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="#E8D4B8"/>
    <g transform="translate(4, 4) scale(0.75)">
        <path d="M 3 3 L 13 3 L 13 1 Q 15 0 17 1 Q 19 0 21 1 L 21 3 L 31 3 L 31 13 L 33 13 Q 34 15 33 17 Q 34 19 33 21 L 31 21 L 31 31 L 21 31 L 21 33 Q 19 34 17 33 Q 15 34 13 33 L 13 31 L 3 31 L 3 21 L 1 21 Q 0 19 1 17 Q 0 15 1 13 L 3 13 Z"
              fill="#D4C4A8"
              stroke="#BEA883"
              stroke-width="1"/>
    </g>
</svg>
`.trim()

sharp(Buffer.from(svg))
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, "../public/favicon.png"))
    .then(() => {
        console.log("✓ Favicon PNG creado")
        // También crear un ICO
        return sharp(Buffer.from(svg)).resize(32, 32).toFile(path.join(__dirname, "../public/favicon.ico"))
    })
    .then(() => console.log("✓ Favicon ICO creado"))
    .catch((err) => console.error("Error:", err))
