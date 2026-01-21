import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Generador de Puzzles Efecto Cristal Roto",
    description: "Generador de puzzles personalizables para corte láser con formas, texturas y texto",
    generator: "v0.app",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "CristalRoto",
    },
    icons: {
        icon: [
            {
                url: "/favicon.png",
                media: "(prefers-color-scheme: light)",
            },
            {
                url: "/favicon.png",
                media: "(prefers-color-scheme: dark)",
            },
            {
                url: "/favicon.svg",
                type: "image/svg+xml",
            },
        ],
        apple: "/apple-icon.png",
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className="overflow-x-hidden">
            <body className={`font-sans antialiased overflow-x-hidden`}>{children}</body>
        </html>
    )
}
