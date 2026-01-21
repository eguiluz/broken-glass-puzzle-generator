import Link from "next/link"
import { ArrowLeft, Grid3X3, Palette, Type, Scissors, Settings, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AyudaPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3">
                            <Grid3X3 className="w-10 h-10" />
                            Ayuda
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Guía completa para usar el Generador de Puzzles Efecto Cristal Roto
                        </p>
                    </div>
                </div>

                {/* Introducción */}
                <Card>
                    <CardHeader>
                        <CardTitle>¿Qué es un puzzle efecto cristal roto?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            Los puzzles efecto cristal roto son composiciones generadas mediante celdas Voronoi radiales
                            y bordes orgánicos, simulando el aspecto de un vidrio fracturado. Este generador crea
                            puzzles únicos donde cada pieza tiene una forma diferente, perfectos para cortar con láser
                            en madera, acrílico o cartón.
                        </p>
                        <p>
                            Puedes personalizar completamente tu puzzle: desde la forma base hasta los textos y texturas
                            que se grabarán en cada pieza.
                        </p>
                    </CardContent>
                </Card>

                {/* Secciones de ayuda */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Grid3X3 className="w-5 h-5" />
                                Parámetros del Puzzle
                            </CardTitle>
                            <CardDescription>Configura la forma y dimensiones del puzzle</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h4 className="font-semibold mb-1">Forma del puzzle</h4>
                                <p className="text-sm text-muted-foreground">
                                    Elige entre rectángulo (más común), hexágono (simétrico) o círculo (decorativo). Las
                                    formas hexagonales y circulares requieren que ancho y alto sean iguales.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Dimensiones</h4>
                                <p className="text-sm text-muted-foreground">
                                    Define el tamaño en celdas (5-30). El tamaño en milímetros dependerá del tamaño de
                                    celda que configures en Parámetros Láser.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scissors className="w-5 h-5" />
                                Tamaño y Forma de Piezas
                            </CardTitle>
                            <CardDescription>Controla la complejidad del puzzle</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h4 className="font-semibold mb-1">Tamaño de piezas</h4>
                                <p className="text-sm text-muted-foreground">
                                    Piezas más pequeñas = puzzle más difícil. Piezas más grandes = puzzle más fácil.
                                    Recomendado: mínimo 3-4, máximo 6-8 celdas.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Modo intrincado</h4>
                                <p className="text-sm text-muted-foreground">
                                    Las piezas se entrelazan entre sí, haciendo el puzzle más desafiante.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Serpenteo y Complejidad</h4>
                                <p className="text-sm text-muted-foreground">
                                    <strong>Serpenteo:</strong> Controla si las piezas son compactas (bloques) o
                                    alargadas (serpientes).
                                    <br />
                                    <strong>Complejidad:</strong> Añade ramificaciones y formas en L/T/Y a las piezas.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="w-5 h-5" />
                                Personalización con Texto
                            </CardTitle>
                            <CardDescription>Añade mensajes o emojis a las piezas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h4 className="font-semibold mb-1">Texto personalizado</h4>
                                <p className="text-sm text-muted-foreground">
                                    Escribe cualquier texto que quieras grabar. Puedes usar letras, números o emojis.
                                    Los emojis kawaii ocupan 2 celdas horizontales para verse mejor.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Librería Kawaii</h4>
                                <p className="text-sm text-muted-foreground">
                                    Más de 100 emojis organizados por categorías: animales, comida, objetos, naturaleza,
                                    caritas, símbolos y fantasía. Haz clic para añadirlos al texto.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Distribución</h4>
                                <p className="text-sm text-muted-foreground">
                                    <strong>Todas:</strong> Cada pieza tiene un carácter.
                                    <br />
                                    <strong>Alternar:</strong> Una pieza sí, una no.
                                    <br />
                                    <strong>Aleatorio:</strong> ~50% de las piezas tendrán texto.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="w-5 h-5" />
                                Texturas para Grabado
                            </CardTitle>
                            <CardDescription>Patrones decorativos grabables con láser</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h4 className="font-semibold mb-1">Tipos de textura</h4>
                                <p className="text-sm text-muted-foreground">
                                    10 patrones disponibles: líneas (horizontal, vertical, diagonal), rejilla, puntos,
                                    ondas, círculos, zigzag, cruces y hexágonos. Selecciona los que quieras usar.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Espaciado y rotación</h4>
                                <p className="text-sm text-muted-foreground">
                                    Ajusta la densidad del patrón (1-5mm) y rótalo (0-180°) para crear efectos únicos.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Parámetros para Láser
                            </CardTitle>
                            <CardDescription>Optimiza el archivo SVG para tu cortadora</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h4 className="font-semibold mb-1">Tamaño de celda</h4>
                                <p className="text-sm text-muted-foreground">
                                    Define cuántos milímetros mide cada celda del puzzle. Típicamente 8-15mm para
                                    puzzles de tamaño medio.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Radio de esquina</h4>
                                <p className="text-sm text-muted-foreground">
                                    Redondea las esquinas de las piezas. 0mm = esquinas rectas, 2-3mm = esquinas suaves.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Colores láser</h4>
                                <p className="text-sm text-muted-foreground">
                                    <strong>Corte (rojo):</strong> Contornos de piezas y base
                                    <br />
                                    <strong>Grabado (azul):</strong> Texturas vectoriales
                                    <br />
                                    <strong>Raster (negro):</strong> Texto y emojis
                                    <br />
                                    Tu máquina láser usará estos colores para aplicar diferentes potencias.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Descarga y Uso del SVG
                            </CardTitle>
                            <CardDescription>Cómo usar el archivo generado</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h4 className="font-semibold mb-1">Archivo SVG</h4>
                                <p className="text-sm text-muted-foreground">
                                    El archivo descargado contiene dos elementos separados: el puzzle con sus piezas y
                                    la base donde encajan. Están separados por un margen configurable.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Importar a software láser</h4>
                                <p className="text-sm text-muted-foreground">
                                    Abre el SVG en LightBurn, RDWorks, LaserGRBL o tu software favorito. Los colores ya
                                    están configurados para que tu máquina sepa qué cortar y qué grabar.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Materiales recomendados</h4>
                                <p className="text-sm text-muted-foreground">
                                    Madera contrachapada (3-6mm), MDF (3-5mm), acrílico (3-4mm) o cartón grueso. Ajusta
                                    la potencia y velocidad según tu material.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tips */}
                <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
                    <CardHeader>
                        <CardTitle>💡 Consejos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li>✓ Usa la semilla para regenerar el mismo puzzle con diferentes parámetros</li>
                            <li>✓ Empieza con puzzles pequeños (10×10) para probar configuraciones</li>
                            <li>
                                ✓ El modo &quot;Dedicatoria&quot; te muestra solo la base con el texto personalizado
                            </li>
                            <li>✓ Haz pruebas de corte con cartón antes de usar materiales caros</li>
                            <li>✓ Los emojis kawaii se ven mejor con texturas desactivadas en esas piezas</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Volver */}
                <div className="flex justify-center pt-4">
                    <Link href="/">
                        <Button size="lg">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver al Generador
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
