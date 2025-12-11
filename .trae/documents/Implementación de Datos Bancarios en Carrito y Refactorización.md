Voy a implementar la solución completa para obtener y mostrar la información bancaria en el carrito de compras.

### Pasos de implementación:

1.  **Backend (API)**:
    *   Modificar `backend/src/modules/Business/router.ts` para exponer una ruta pública `GET /public` que permita obtener los datos del negocio (incluyendo cuentas bancarias) sin necesidad de ser administrador.

2.  **Frontend (Shop) - API Hook**:
    *   Crear `shop/src/Api/useBankInfo.ts` utilizando `@tanstack/react-query`.
    *   Este hook consumirá el nuevo endpoint público y tipará correctamente la respuesta (datos del negocio y cuentas bancarias).

3.  **Frontend (Shop) - Lógica del Carrito (Refactorización)**:
    *   Crear `shop/src/Components/Cart/useCart.ts` para extraer toda la lógica de estado y manejo del formulario del componente visual.
    *   Integrar `useBankInfo` dentro de esta lógica o pasar los datos al componente visual.
    *   Implementar validaciones y manejo de la subida de comprobantes de forma más limpia.

4.  **Frontend (Shop) - Componente Visual**:
    *   Refactorizar `shop/src/Components/Cart/Cart.tsx` para que sea un componente "tonto" (presentational) que solo recibe props y renderiza.
    *   Mostrar la información bancaria de forma elegante cuando se seleccione "Transferencia bancaria".
    *   Añadir estados de carga (skeletons o loaders) mientras se obtienen los datos bancarios.
    *   Optimizar con `React.memo` para evitar re-renderizados innecesarios.

### Archivos a modificar/crear:
*   `backend/src/modules/Business/router.ts` (Modificación)
*   `shop/src/Api/useBankInfo.ts` (Nuevo)
*   `shop/src/Components/Cart/useCart.ts` (Nuevo)
*   `shop/src/Components/Cart/Cart.tsx` (Refactorización completa)
