# PokeLibrary — Prueba técnica BinPar

Aplicación web para explorar y buscar información de Pokemon, desarrollada como prueba técnica para BinPar por **Raúl Jiménez**.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **PokeAPI** — fuente de datos

## Funcionalidades

- **Listado** de 386 Pokémon (Generaciones I–III) con imagen, tipos con colores y generación
- **Filtros** por tipo y generación, combinables entre sí
- **Buscador en tiempo real** con debounce — incluye evoluciones en los resultados (buscar "pikachu" muestra Pichu, Pikachu y Raichu)
- **Página de detalle** con stats visuales, tipos y cadena de evoluciones navegable
- **Estado persistido**: filtros, búsqueda y scroll position se mantienen al volver desde el detalle
- **Manejo de errores** con página de error y botón de reintento
- **Responsive**: de 2 columnas en móvil a 6 en desktop

## Decisiones técnicas destacadas

- **Server Components por defecto**: el fetch de datos ocurre en el servidor con caching de 24h (`next: { revalidate: 86400 }`), evitando requests repetidas a PokeAPI.
- **Estado en URL**: los filtros se persisten como query params (`?type=fire&gen=1`), lo que permite restaurarlos al navegar atrás sin necesidad de un store global.
- **`Promise.all` para requests paralelas**: los detalles de los 386 Pokémon se obtienen en paralelo, no secuencialmente.
- **Búsqueda con evoluciones**: al buscar, se obtienen las cadenas de evolución de los Pokémon coincidentes y se expanden los resultados. Las URLs duplicadas se deduplican antes de hacer las requests.
- **`router.replace` para filtros**: los cambios de filtro no generan entradas en el historial, preservando el comportamiento esperado del botón "atrás".

## Instalación y uso

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

```bash
npm run build   # Build de producción
npm run lint    # Linting
```

## Demo

[pokelibrary.vercel.app](https://pokelibrary.vercel.app/)

## Limitación conocida

El listado incluye Pokemon de las generaciones I–III (386 Pokémon). Evoluciones de generaciones posteriores (ej: Leafeon, Glaceon, Sylveon) no aparecen en los resultados del buscador. Ampliar el límite es trivial pero aumenta el tiempo de carga inicial.
