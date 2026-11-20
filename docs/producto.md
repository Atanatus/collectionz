# Navegación y estado

| Ruta | Función | Estado |
| --- | --- | --- |
| `#inicio` | Novedades y acceso a álbumes. | Maqueta navegable. Mueca Radiactivo se muestra como arte de desarrollo. |
| `#albumes` | Elegir temporada y consultar progreso. | Temporada 1 con 27 huecos. |
| `#albumes/abierto` | Ver el álbum de la temporada. | Seis huecos por página. Una página en móvil y dos en escritorio. |
| `#duelo` | Acceder al tablero y combate 1 contra 1. | Prototipo local separado. La ruta pública muestra su estado. |
| `#tienda` | Consultar sobres individuales, lotes y cajas. | Escaparate. Cantidades de lotes, cajas y precios pendientes. |
| `#perfil` | Consultar las pertenencias del jugador. | Entrada a Mis sobres. |
| `#perfil/mis-sobres` | Consultar y abrir sobres adquiridos. | Estado vacío de maqueta. El simulador existe en el prototipo local. |
| `#mercado` | Compraventa de cartas entre jugadores. | Previsto. Moneda, comisión y flujo de venta pendientes. |

El flujo de colección previsto es **Tienda → Perfil / Mis sobres → Apertura → Álbum**. Las copias repetidas se muestran por cantidad. El progreso cuenta fichas distintas. Si se vende la última copia, el hueco vuelve a quedar vacío.

La barra principal conserva cinco entradas. Duelo se abre desde Inicio.

## Temporada 1

- 24 fichas base y 3 variantes exclusivas. Los 27 PNG están verificados a 1.000 × 1.400 px en el lote local.
- Amigo de la Naturaleza tiene Mueca — Refugio y Cérulo — Cauce Vivo. Cazador Furtivo tiene Mueca — Contención.
- Las bases parten en mate. Las tres exclusivas aprobadas son holográficas.
- Formato de trabajo de los sobres: seis cartas, cinco bases distintas y una sexta base o exclusiva del camino. La sexta ficha tampoco se repite dentro del sobre. El 10 % del simulador es un valor de prueba. Queda por fijar la probabilidad comercial.
