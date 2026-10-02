# Diario de Estudio

Web estática de una sola página para registrar sesiones de estudio y ver la racha de días.
Sin dependencias, sin build y sin cuentas: **abre `index.html` con doble clic y ya funciona.**

## Qué hace

- **Registrar sesiones**: fecha, tema y minutos.
- **Racha actual**: los días consecutivos que terminan hoy. Si hoy todavía no estudiaste pero ayer sí, la racha sigue viva.
- **Mejor racha**: el récord de toda la historia, no solo el que sigue vivo.
- **Meta diaria**: los minutos que te has fijado para hoy, con barra de progreso. Se guarda sola al salir del campo.
- **Calendario de los últimos 28 días**: cada casilla muestra el día y se colorea según cuánto estudiaste.
- **Editar y eliminar** cualquier sesión que hayas apuntado.

Los datos se guardan en el `localStorage` de tu navegador. No salen de tu equipo: no hay servidor ni cuentas.

## Cómo usarlo

1. Abre `index.html` en el navegador.
2. Pon la fecha, el tema y los minutos, y pulsa **Guardar sesión**.
3. Cambia la meta cuando quieras: se guarda al salir del campo.

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | La estructura de la página. |
| `js/nucleo.js` | El registro de módulos y las utilidades de fecha. |
| `js/datos.js` | `localStorage`, rachas, meta y minutos por día. |
| `js/textos.js` | Los textos de la interfaz. |
| `js/interfaz.js` | La pantalla: validaciones, pintado, calendario y guardado. |
| `estilos/base.css` | Variables de color, tipografía y contenedor. |
| `estilos/componentes.css` | El aspecto de cada pieza. Pensado para móvil (375 px). |

Todo son scripts y estilos clásicos: la página funciona con doble clic, sin servidor, sin build y sin conexión.

`AGENTS.md` recoge las reglas del proyecto y `MEMORY.md` el estado del desarrollo.

## Detalles que quizá te sorprendan

- Los minutos en decimal (`12.5`) están permitidos aunque el campo parezca entero.
- Se pueden apuntar varias sesiones el mismo día; la racha cuenta ese día una sola vez.
- Se pueden apuntar sesiones con fecha futura: salen en la lista, pero no cuentan para la racha, la meta ni el calendario.
- La mejor racha se recalcula siempre desde las sesiones guardadas, así que no se queda desactualizada.