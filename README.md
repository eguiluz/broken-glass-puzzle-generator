# 🧩 Generador de Puzzles Efecto Cristal Roto

Generador de puzzles efecto cristal roto personalizable con soporte para corte láser. Crea piezas únicas con formas orgánicas, texturas grabables, texto/emojis personalizados y exportación a SVG optimizado para máquinas láser.

## ✨ Características

### 🎯 Configuración de Puzzle

- **Formas base**: Rectángulo, hexágono o círculo
- **Dimensiones personalizables**: 5-30 celdas de ancho/alto
- **Tamaño de celda ajustable**: 5-20mm para adaptarse a diferentes materiales

### 🧩 Personalización de Piezas

- **Tamaño variable**: Define el mínimo y máximo de celdas por pieza (2-20)
- **Modo intrincado**: Piezas que se entrelazan entre sí
- **Serpenteo**: Control de piezas compactas vs. alargadas
- **Complejidad**: Añade ramificaciones y formas en L/T/Y

### 📝 Texto y Emojis

- **Texto personalizado**: Graba caracteres en las piezas
- **Librería Kawaii**: Más de 100 emojis organizados por categorías
- **Distribución configurable**: Todas las piezas, alternadas o aleatorias
- **Soporte multi-carácter**: Emojis complejos ocupan 2 celdas

### 🎨 Texturas

- **10 patrones diferentes**: Líneas horizontales, verticales, diagonales, grid, puntos, ondas, círculos, zigzag, cruces y hexágonos
- **Espaciado ajustable**: 1-5mm
- **Rotación**: 0-180° en incrementos de 15°
- **Distribución personalizable**: Todas, alternadas o aleatorias

### ⚙️ Parámetros Láser

- **Radio de esquina**: 0-3mm para bordes redondeados
- **Grosor de línea**: 0.05-0.5mm
- **Margen con base**: 5-50mm
- **Borde de base**: 0-5 celdas
- **Colores láser personalizables**: Corte, grabado y raster

### 🎁 Personalización de Base

- **Texto dedicatoria**: Graba mensajes en la base
- **Fuentes del sistema**: Arial, Times New Roman, Courier, Georgia, Comic Sans y más
- **Tamaño de texto**: 2-20mm
- **Alineación**: Izquierda, centro o derecha
- **Posicionamiento preciso**: Ajuste horizontal y vertical en 0.5mm

### 👁️ Vista Previa

- **Zoom**: 50-300%
- **Colores opcionales**: Visualiza las piezas con colores
- **Modo piezas/dedicatoria**: Alterna entre ver el puzzle completo o solo la base
- **Detalles técnicos**: Dimensiones exactas y distribución por tamaño

## 🛠️ Tecnologías

- **Next.js 16** - Framework React con App Router y Turbopack
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos utilitarios
- **Radix UI** - Componentes de UI accesibles
- **Lucide React** - Iconos

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/eguiluz/polyomino-puzzle-generator.git

# Navegar al directorio
cd polyomino-puzzle-generator

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## 📁 Estructura del Proyecto

```
polyomino-puzzle-generator/
├── app/                          # Next.js App Router
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página principal
├── components/                   # Componentes React
│   ├── ui/                      # Componentes UI reutilizables
│   ├── CollapsibleCard.tsx      # Tarjeta colapsable
│   ├── PuzzlePreview.tsx        # Vista previa del puzzle
│   └── polyomino-generator.tsx  # Componente principal
├── constants/                    # Constantes de la aplicación
│   ├── emojis.ts               # Librería de emojis kawaii
│   └── fonts.ts                # Fuentes del sistema
├── hooks/                        # Custom React Hooks
│   ├── usePolyominoState.ts    # Estado del generador
│   └── usePuzzlePieces.ts      # Generación de piezas
├── lib/                          # Utilidades y lógica de negocio
│   ├── base-shapes.ts          # Cálculos geométricos
│   ├── polyomino.tsx           # Algoritmo de generación
│   ├── svg-download.ts         # Exportación SVG
│   ├── text-parser.ts          # Parser de texto/emojis
│   └── utils.ts                # Utilidades generales
├── types/                        # Definiciones TypeScript
│   └── components.ts           # Interfaces de componentes
└── public/                       # Archivos estáticos
```

## 🎯 Uso

1. **Configura los parámetros del puzzle**
    - Selecciona la forma base (rectángulo, hexágono o círculo)
    - Define el tamaño del grid
    - Ajusta el tamaño mínimo y máximo de las piezas

2. **Personaliza las piezas**
    - Activa el modo intrincado para piezas entrelazadas
    - Ajusta serpenteo y complejidad

3. **Añade contenido**
    - Escribe texto personalizado o selecciona emojis kawaii
    - Configura texturas para grabado láser
    - Personaliza la dedicatoria en la base

4. **Ajusta parámetros láser**
    - Define tamaño de celda según tu material
    - Configura radio de esquina y grosor de línea
    - Ajusta los colores para corte, grabado y raster

5. **Descarga el SVG**
    - Previsualiza con zoom ajustable
    - Descarga el archivo SVG optimizado para láser
    - El archivo incluye capas separadas por tipo de operación

## 🎨 Algoritmo de Generación

El generador utiliza un algoritmo de crecimiento aleatorio que:

1. Divide el grid en una cuadrícula base
2. Crea "semillas" aleatorias que crecen célula a célula
3. Respeta límites de tamaño min/max configurados
4. Aplica transformaciones según serpenteo y complejidad
5. Genera paths SVG optimizados con esquinas redondeadas
6. Añade clip paths para texturas por pieza
7. Renderiza texto/emojis con posicionamiento inteligente

## 🔧 Características Técnicas

- **Generación determinista**: Usa semillas para reproducibilidad
- **Optimización de paths**: Merge de celdas adyacentes en paths únicos
- **Clip paths por pieza**: Texturas contenidas dentro de cada forma
- **Texto inteligente**: Detecta emojis multi-carácter y ajusta espaciado
- **Responsive**: Interfaz adaptable a diferentes tamaños de pantalla
- **Type-safe**: 100% TypeScript con tipos estrictos

## 📝 Formato SVG Exportado

El SVG exportado incluye:

- **Capa de corte** (color configurable): Contornos de piezas y base
- **Capa de grabado** (color configurable): Texturas vectoriales
- **Capa de raster** (color configurable): Texto y emojis

Las máquinas láser interpretan estos colores para aplicar diferentes potencias y velocidades.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

**GitHub Copilot** - Agente de IA de programación

Creado con ❤️ para makers y entusiastas del corte láser.

---

**¿Te gusta el proyecto? ¡Dale una ⭐ en GitHub!**
