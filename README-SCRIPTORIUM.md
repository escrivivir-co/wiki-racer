# Integración con ALEPH Scriptorium

**Submódulo**: `wiki-racer`  
**Rama de integración**: `integration/beta/scriptorium`  
**Fecha de integración**: 2025-12-24

---

## Arquitectura del Submódulo

```
wiki-racer/
├── src/                           # Motor TypeScript
│   ├── estado.ts                  # Máquina de estados (Etapa, Error)
│   ├── juego.ts                   # Lógica del juego
│   └── index.ts                   # Punto de entrada
├── node-red-contrib-wikir-racer/  # Plugin Node-RED
│   ├── game.js                    # Nodo personalizado
│   ├── flow.json                  # Flow de ejemplo (1680 líneas)
│   └── package.json               # Configuración del nodo
├── CRIPTA/                        # Almacenamiento de partidas
│   └── tree.json                  # Datos persistentes
├── package.json                   # Dependencias principales
└── tsconfig.json                  # Configuración TypeScript
```

## Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| TypeScript | ^5.2.2 | Motor de lógica |
| Node-RED | ^2.1.5 | Orquestación visual |
| RxJS | ^7.8.1 | Programación reactiva |
| Axios | ^1.7.2 | HTTP requests |
| Wikipedia API | ^2.1.2 | Consulta de artículos |

## Mapeo Ontológico (3 Plugins + 1 Preset)

Este submódulo genera **3 plugins** distintos según el caso de uso:

### 1. WiringApp (Plugin: `wiring-app`)

| Componente wiki-racer | Scriptorium |
|----------------------|-------------|
| `flow.json` | Template de flow para WireEditor |
| `game.js` | Nodo Node-RED de ejemplo |
| Motor TypeScript | Lógica ejecutable en flows |

**Agente**: `WiringApp` — Experto en crear flows Node-RED desde wiki-racer  
**Relación**: Extiende `@plugin_ox_wireeditor`

### 2. ArgBoardApp (Plugin: `arg-board-app`)

| Componente wiki-racer | Scriptorium |
|----------------------|-------------|
| `estado.ts` (Etapa) | Estados de diapositivas en obras |
| Transiciones de estado | Movimientos en impress.js |
| Árbol de decisiones | Mapa de caminos narrativos |

**Agente**: `ArgBoardApp` — Máquina de estados para Teatro ARG  
**Relación**: Integra con `@plugin_ox_argboard` y `@plugin_ox_teatro`

### 3. HyperGraphEditor (Plugin: `hypergraph-editor`)

| Componente wiki-racer | Scriptorium |
|----------------------|-------------|
| Motor de navegación | Navegador de grafos hipervinculados |
| Algoritmo de búsqueda | Trazado de caminos entre nodos |
| Gestión de candidatos | Selección de hipervínculos |

**Agente**: `HyperGraphEditor` — Editor de hipergrafos navegables  
**Relación**: Plugin transversal, puede usar cualquier ontología

### 4. MediaWiki Preset (Preset para HyperGraphEditor)

| Componente wiki-racer | Scriptorium |
|----------------------|-------------|
| Wikipedia API | Conexión a MediaWiki |
| Base URL configurable | Cualquier instancia MediaWiki |
| Estructura de artículos | Ontología de navegación |

**Ubicación**: `ARCHIVO/PLUGINS/HYPERGRAPH_EDITOR/presets/mediawiki.json`

## Dependencias Externas

### Requeridas
- **Node.js** >= 16.x
- **Node-RED** >= 2.1.5 (para WiringApp)

### Opcionales
- **Conexión a Internet** (para Wikipedia API)
- **Instancia MediaWiki** (para preset personalizado)

## Estados del Motor (estado.ts)

```typescript
enum Etapa {
    NoIniciado = "NoIniciado",
    Reintentar = "Reintentar",
    Iniciado = "Iniciado",
    Acabado = "Acabado",
    Esperando = "Esperando"
}

enum Error {
    SinDatos = "SinDatos",
    NoEncontrado = "NoEncontrado",
    FaltanPropiedades = "FaltanPropiedades",
    CaminoSinSalida = "CaminoSinSalida",
    Exito = "Exito"
}
```

## Supuestos y Gaps

### Supuestos
- El flow.json es compatible con Node-RED 2.x
- El motor TypeScript puede compilarse de forma independiente
- La Wikipedia API no requiere autenticación para lectura

### Gaps Identificados
- [ ] **G1**: Adaptar flow.json al formato del WireEditor del Scriptorium
- [ ] **G2**: Crear mapeo de Etapa → Estados de diapositiva en Teatro
- [ ] **G3**: Abstraer la Wikipedia API para soportar cualquier MediaWiki
- [ ] **G4**: Documentar protocolo de creación de presets personalizados

---

## Referencias

- **Plugin WireEditor**: `.github/plugins/wire-editor/`
- **Plugin ARG Board**: `.github/plugins/arg-board/`
- **Plugin Teatro**: `.github/plugins/teatro/`
- **Instrucciones de integración**: `.github/instructions/submodulo-integracion.instructions.md`
