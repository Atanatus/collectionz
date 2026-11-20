# QA de navegación y funciones

| Flujo | Prueba | Resultado esperado |
| --- | --- | --- |
| Navegación | Abrir las cinco entradas principales. Usar Atrás y Adelante. | La vista y la entrada activa coinciden. El foco pasa al título de la vista al cambiar de ruta. |
| Guía | Inicio → Guía → Reglas → Duelo. | Cada enlace llega a su destino. Duelo explica el estado del prototipo. |
| Álbum | Abrir desde Inicio o desde Mis sobres. Pasar páginas en móvil y escritorio. | 27 huecos, tres exclusivas al final y sin casillas adicionales. |
| Ficha | Abrir desde el álbum o desde el último sobre. Cerrar con Escape o Cerrar. | Nombre, puesto, PV e imagen corresponden a la ficha seleccionada. El foco vuelve al control que abrió la ficha. |
| Sobres | Abrir uno desde cada camino y recargar. | Seis cartas distintas por sobre. Una exclusiva, si sale, pertenece al camino elegido. Se conservan las copias y el último sobre. |
| Almacenamiento | Bloquear el almacenamiento e intentar abrir. | El estado explica el problema. La aplicación evita presentar una apertura como guardada. |
| Tienda y mercado | Recorrer ambos apartados. | Tienda explica el estado de las compras y enlaza con la prueba. Mercado enlaza al catálogo. |

## Pantallas pendientes

- Inventario y gestión de mazos. Revisar estados vacío, selección, límite de copias y guardado.
- Inicio de duelo, turno, fin de partida y repetición. Conectar al motor y verificar la partida completa.
- Compra de sobres, publicación de cartas y gestión de anuncios. Definir los flujos antes de habilitar transacciones.

Revisar distribución, jerarquía visual y densidad una vez que los flujos se puedan recorrer.
