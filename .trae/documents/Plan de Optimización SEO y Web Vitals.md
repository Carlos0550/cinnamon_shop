# Plan de Optimización de Rendimiento y SEO

Para alcanzar una puntuación de 10/10 en Google Web Vitals y maximizar el SEO, implementaré las siguientes mejoras técnicas:

## 1. Core Web Vitals y Rendimiento (LCP, CLS, FID)
El mayor problema actual es que la página de inicio (`Home.tsx`) se renderiza completamente en el cliente ("use client" sin datos iniciales), lo que causa un retraso significativo en el LCP (Largest Contentful Paint) y afecta el SEO.

- **Implementar SSR (Server-Side Rendering) en Home**: Refactorizaré `src/app/page.tsx` para que obtenga los productos y categorías en el servidor y los pase como datos iniciales (`initialData`) al componente cliente. Esto eliminará el estado de "Cargando..." inicial y mostrará contenido inmediato.
- **Optimización de Imágenes**:
  - Instalaré `sharp` para un procesamiento de imágenes más rápido en producción.
  - Modificaré `ProductsCards.tsx` para aceptar una propiedad `priority`.
  - Aplicar `priority={true}` a las primeras 4 imágenes de productos en la Home para mejorar el LCP.
- **Optimización de Fuentes**:
  - Reemplazaré la importación bloqueante `@import` de Google Fonts en `globals.css` por `next/font/google` en `layout.tsx`. Esto elimina el bloqueo de renderizado y mejora el CLS. *Nota: Si "Stack Sans Text" no está disponible en la API de Next.js, usaré una fuente similar optimizada (como Inter o DM Sans) o configuraré la carga asíncrona.*

## 2. SEO Técnico
- **Estructura de Datos (Schema)**: Ya existe una buena base, pero aseguraré que los datos inyectados coincidan con el contenido renderizado por el servidor.
- **Metadatos Dinámicos**: Verificaré que `canonical` URLs estén presentes en todas las páginas dinámicas.
- **Robots & Sitemap**: Revisión final para asegurar que se actualicen con la frecuencia correcta.

## 3. Configuración y Recursos
- **Next.js Config**: Habilitar compresión Gzip/Brotli (`compress: true`) y optimización de paquetes en `next.config.ts`.
- **Lazy Loading**: Verificar que los modales (`AuthModal`) y componentes pesados fuera de la vista inicial se carguen de manera diferida.

## 4. Dependencias Nuevas
- `sharp` (para optimización de imágenes)
- `next-sitemap` (opcional, pero el actual `sitemap.ts` ya es funcional, así que lo mantendré nativo).

### Pasos de Ejecución:
1.  **Instalar dependencias**: `npm install sharp`.
2.  **Configuración**: Actualizar `next.config.ts`.
3.  **Refactorización de Hooks**: Adaptar `useProducts` y `useCategories` para soportar hidratación de datos iniciales.
4.  **Refactorización de Páginas**:
    -   `src/app/page.tsx`: Fetch de datos (Server Side).
    -   `src/Components/Home/Home.tsx`: Recibir y usar `initialData`.
    -   `src/Components/Home/sub-components/ProductsCards.tsx`: Lógica de prioridad de imagen.
5.  **Fuentes**: Migrar a `next/font`.
6.  **Validación**: Verificar build y navegación.

¿Deseas proceder con este plan de optimización?