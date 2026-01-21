# 🧩 Generador de Puzzles - Scaffolding Genérico

Este proyecto ha sido preparado como un scaffolding genérico listo para implementar cualquier tipo de generador de puzzles.

## 📁 Estructura Actual

### Archivos Activos (Genéricos)
- `components/PuzzleGenerator.tsx` - Componente principal genérico
- `hooks/usePuzzleState.ts` - Hook para gestionar estado básico del puzzle
- `hooks/usePuzzleGenerator.ts` - Hook placeholder para lógica de generación
- `lib/svgGenerator.ts` - Generador SVG genérico (placeholder)
- `lib/svgDownload.ts` - Utilidades de descarga de SVG
- `lib/colorPalettes.ts` - Paletas de colores (reutilizable)
- `lib/textParser.ts` - Parser de texto (reutilizable)

### Archivos Preservados (*.old)
Los archivos con lógica específica de poliominós han sido renombrados con extensión `.old` (referencia histórica, ahora el enfoque es efecto cristal roto):
- `components/PolyominoGenerator.tsx.old`
- `hooks/usePolyominoState.ts.old`
- `hooks/usePuzzlePieces.ts.old`
- `lib/polyomino.tsx.old`
- `lib/baseShapes.ts.old`
- `lib/textureGenerators.ts.old`
- `lib/svgGenerator.ts.old`
- `components/PuzzlePreview.tsx.old`
- `components/PuzzleActions.tsx.old`
- `types/components.ts.old`

Estos archivos se mantienen como referencia y pueden servir de inspiración para implementar el nuevo generador.

## 🚀 Próximos Pasos

Para implementar un nuevo generador de puzzles, sigue estos pasos:

### 1. Definir el Tipo de Puzzle
Decide qué tipo de puzzle quieres generar (ej: jigsaw tradicional, tangram, hexagonal, etc.)

### 2. Actualizar `hooks/usePuzzleState.ts`
Añade los parámetros específicos que necesite tu puzzle:
```typescript
// Ejemplo:
const [pieceCount, setPieceCount] = useState(20)
const [difficultyLevel, setDifficultyLevel] = useState(1)
// etc...
```

### 3. Implementar `hooks/usePuzzleGenerator.ts`
Desarrolla la lógica de generación del puzzle:
```typescript
export function usePuzzleGenerator(params: UsePuzzleGeneratorParams): PuzzlePiece[] {
    const pieces = useMemo(() => {
        // AQUÍ: Implementa tu algoritmo de generación
        return generatedPieces
    }, [/* dependencias */])

    return pieces
}
```

### 4. Actualizar `lib/svgGenerator.ts`
Implementa la función para generar el SVG del puzzle:
```typescript
export function generatePuzzleSVG(params: SVGGeneratorParams): string {
    // AQUÍ: Genera el SVG basado en las piezas del puzzle
    return svgString
}
```

### 5. Crear Componente de Vista Previa
Si necesitas visualización customizada, crea `components/PuzzlePreview.tsx`:
```typescript
export function PuzzlePreview({ pieces, ...otherProps }) {
    // AQUÍ: Renderiza la vista previa del puzzle
}
```

### 6. Actualizar `components/PuzzleGenerator.tsx`
- Añade secciones de configuración específicas para tu tipo de puzzle
- Integra el componente de vista previa
- Implementa la lógica de descarga con el SVG generado

### 7. Añadir Tipos (Opcional)
Actualiza `types/components.ts` con los tipos específicos de tu implementación.

## 💡 Funcionalidades Mantenidas

El scaffolding ya incluye:
- ✅ Layout responsivo con panel de configuración y vista previa
- ✅ Sistema de tema claro/oscuro
- ✅ Parámetros básicos de corte láser (tamaño de celda, radio de esquinas, etc.)
- ✅ Sistema de zoom y visualización
- ✅ Botones de regenerar y descargar SVG
- ✅ Componentes UI reutilizables (botones, sliders, cards colapsables)
- ✅ Paletas de colores predefinidas
- ✅ Utilidades de descarga de archivos

## 📝 Ejemplo de Implementación

Para inspirarte, los archivos `.old` contienen una implementación previa de un generador de puzzles de poliominós (ahora el enfoque es efecto cristal roto) con:
- Formas base (rectángulo, hexágono, círculo)
- Algoritmo de generación de piezas entrelazadas
- Sistema de texturas y personalización
- Generación de SVG optimizado para corte láser

## 🎯 Notas Importantes

- Los TODOs en el código marcan los puntos donde debes implementar lógica específica
- Mantén la estructura de archivos para facilitar el mantenimiento
- Los archivos `.old` pueden borrarse una vez implementado el nuevo generador
- Asegúrate de actualizar el título y descripción en `PuzzleGenerator.tsx`

---

**¡Listo para implementar tu generador de puzzles personalizado! 🎨**
