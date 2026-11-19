# Integración

`index.html` contiene la estructura y la navegación. `assets/css/site.css` contiene los estilos. `assets/js/site.js` resuelve las rutas y dibuja la maqueta. `assets/img/` almacena arte del sitio. Los álbumes de la maqueta empiezan vacíos hasta que exista un inventario real.

## Catálogo

Al trasladar el lote local, usar un catálogo común con ID de especie, ID de ficha jugable, ID de edición y ruta relativa al PNG. Álbum, inventario, sobres y duelo deben usar esos mismos identificadores. Los PNG son la vista de carta. PV, puesto, habilidades y efectos se conservan como datos del motor. El reverso común se reutiliza en mazos y en la revelación de sobres.

## Tablero y motor

La referencia visual es el prototipo local: dos Activas enfrentadas, Apoyos desplazados, mazos a la izquierda, eliminadas a la derecha y seis huecos de mano abajo. Las vidas del rival van arriba, centradas. El tablero se ajusta al alto de la ventana. El ring es la ambientación y la ubicación de las zonas corresponde al tablero.

El primer duelo usa mazos de 12, tres vidas por jugador y un puesto de Activa y otro de Apoyo. La regla de repetición declara tablas en la tercera aparición del estado completo al comienzo del turno, antes del robo. Conservar el orden del mazo, los datos ligados a cada instancia, los vencimientos relativos y el orden de resolución. Reordenar visualmente mano o eliminadas conserva el estado.

El registro de diagnóstico guarda versión de reglas, mazos antes de la apertura, resultados aleatorios, jugador inicial, acciones aceptadas y resultado. La vista del rival solo recibe los datos que puede conocer durante la partida.

## Orden de integración

1. Incorporar los PNG finales, el reverso y el catálogo a la web.
2. Trasladar el simulador a Mis sobres y conectar sus resultados con el inventario de prueba y el álbum.
3. Trasladar el HTML del tablero local y conectar el motor. Validar una partida completa y su reproducción.
4. Fijar probabilidades y formatos comerciales antes de activar compras y mercado.
