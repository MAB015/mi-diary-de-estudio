# AGENTS.md — Diario de Estudio

Web estática de una sola página para registrar sesiones de estudio y ver la racha de días.

## Reglas del proyecto (no negociables)

- **Estructura de ficheros fija.** La app son `index.html`, dos carpetas y opcionalmente `vendor/`. Nada más:
  - `estilos/base.css`: variables de color, reset, tipografía base y contenedor.
  - `estilos/componentes.css`: el aspecto de cada pieza (cabecera, tarjetas, botones, campos, racha, calendario, lista).
  - `estilos/panel.css`: lo del panel de estadísticas (KPI, gráficos, filtros). **Todavía no existe**: se crea cuando haya panel.
  - `js/nucleo.js`, `js/datos.js`, `js/textos.js`, `js/preferencias.js`, `js/interfaz.js`: los que existen. `js/cronometro.js` y `js/panel.js` se crean con su contenido, no como ficheros vacíos.
  - `vendor/`: única excepción para librerías de terceros, con versión exacta en el nombre. Ahora vacío.
  - El orden de los `<link>` y los `<script>` en `index.html` está escrito en el fichero: **no lo cambies por gusto.**
- **Sin frameworks, sin build, sin paso de compilación, sin CDN.**
- **Debe funcionar con doble clic** en `index.html`. Por eso está prohibido `type="module"` (CORS lo bloquea en `file://`), `import`, `export`, `fetch()` de ficheros locales y cualquier import. Varios `<script src>` clásicos **sí** funcionan desde `file://`: está verificado. Un módulo ES desde `file://` falla con `blocked by CORS policy`: también verificado.
- **Todo el texto de la interfaz y los comentarios del código en español.**
- **Código para principiantes**: nombres descriptivos, funciones cortas, comentarios breves que expliquen el *porqué*. Nada de abstracciones ni helpers genéricos por adelantado.
- **Alcance cerrado**: nada que no esté en el encargo actual. Si una idea es buena pero no la pidió el usuario, no la añadas. (Editar y eliminar sí están: ver "Editar y eliminar".)
- Móvil primero. Revisar siempre a **375 px de ancho**.
- El repo está en GitHub (`MAB015/mi-diary-de-estudio`). Todo cambio que añada, modifique o quite algo se documenta con un commit: ver "Commits".
- Este `AGENTS.md` es un archivo de documentación permitido; la regla de estructura de ficheros es solo de la app. `README.md` también.

## Módulos de JavaScript (regla estructural)

Desde la v4 el código está partido en ficheros para que ninguno se haga enorme. El precio es que **no hay módulos ES**, así que esto es obligatorio:

1. **Todo lo que cuelga de `window` es exactamente una cosa: `Diario`.** Ni una variable ni una función más en el ámbito global.
2. **Cada fichero va dentro de una IIFE** y se registra: `Diario.registrar('datos', (function () { 'use strict'; … return { … }; })());`. Lo que devuelvas es su API pública; lo demás es privado.
3. **`js/nucleo.js` va primero**: crea `Diario` con `registrar()`, `obtener()` y `Diario.fechas` (`rellenar`, `claveDeFecha`, `moverClave`).
4. **Dependencias ya cargadas: se cogen arriba.** Si `datos.js` y `textos.js` ya están cargados, `interfaz.js` puede hacer `const datos = Diario.obtener('datos');` en su cabecera.
5. **Dependencias que se cargan después: `Diario.obtener()` dentro de la función**, nunca arriba. Si no, sale un error de módulo inexistente. Ejemplo: el cronómetro necesita a la interfaz, pero la interfaz carga antes.
6. **Si el orden de `<script>` se rompe, `obtener()` lo dice en español** con el nombre del módulo que falta. Es el error que hay que leer primero cuando algo no funcione.
7. **Prohibido** `type="module"`, `import`, `export` y tocar `window` con nada más que `Diario`.

Vale la pena saber por qué se chose esto y no un `app.js` de 2.600 líneas: es más fácil de depurar (el error dice el fichero), evita colisiones de nombres entre secciones y deja cada fichero con una responsabilidad. Lo que se pierde es el ámbito de módulo nativo, y por eso las IIFEs no son opcionales.

## Commits

1. **Cada cambio se documenta con un commit.** Añadir una función, corregir un fallo, tocar estilos o reescribir el `AGENTS.md` son motivos de commit. Si un cambio no está en un commit, está perdido.
2. **Primero verificar, después commitear.** Nada de commitear a ciegas: antes pasa el arnés (`node:vm`) y Chrome headless. Si no hay forma de probar el cambio, dilo en el mensaje del commit.
3. **Un commit por cambio coherente**, no uno por línea ni uno gigante con todo. Si puedes explicarlo en una frase, es un commit; si necesitas decir "y también" dos veces, probablemente son dos.
4. **El mensaje dice qué se hizo y por qué**, en español. Asunto con el nombre del proyecto y la función, como el primero: `Diario de Estudio: <qué>`. Debajo, el cuerpo con los *porqués* y los detalles que no se ven leyendo el diff.
5. **El código y su documentación van en el mismo commit.** Si un cambio altera el comportamiento, actualiza `AGENTS.md` (reglas) y/o `MEMORY.md` (estado) en ese mismo commit, nunca en uno suelto después.
6. **Nada de basura en el repo.** Solo los ficheros del proyecto (`index.html`, `js/`, `estilos/`, `vendor/` cuando haga falta) más tres carpetas de tooling: `.gitignore` (ignora `.vercel/`), `.opencode/skills/` (skills del proyecto, no son código de la app) y la documentación (`AGENTS.md`, `MEMORY.md`, `README.md`). Las copias de prueba, los arneses y los perfiles de Chrome se quedan fuera, en la carpeta temporal.
7. **No reescribas historia publicada.** Nada de `amend`, `rebase` ni `push --force` sobre lo que ya está en GitHub. Un commit ya subido se corrige con otro commit.
8. **`push` cuando el usuario lo pida** o al cerrar una tanda de trabajo; el commit en local sí es siempre inmediato.
9. Si el repo cambia de nombre o de sitio, actualiza la línea de GitHub de la cabecera.

## UI y accesibilidad

- Existe una skill de proyecto en `.opencode/skills/ui-director-accesible/SKILL.md`. **Úsala siempre que toques la interfaz**: HTML, CSS, layout, color, tipografía, espaciado, componentes o microinteracciones. WCAG 2.2 AA es el suelo, con los contrastes calculados con la función que trae, nunca estimados a ojo.
- **La skill es un suelo de calidad, no una lista de funcionalidades.** Pide modo oscuro, selector de tema, sonido, cronómetro e interfaz en ES/EN/FR, y todo eso sigue fuera de alcance: la regla de "alcance cerrado" de arriba gana. Aplica la skill a lo que ya existe o a lo que te pidan, no como motivo para añadir cosas.
- Cuando hay conflicto, el orden es: **accesibilidad > claridad > impacto visual > deleite**.

## Dónde vive cada cosa

- `localStorage`, clave `diario-de-estudio.sesiones`. Forma de cada sesión: `{ id: number, fecha: 'AAAA-MM-DD', tema: string, minutos: number }`.
- `localStorage`, clave `diario-de-estudio.meta`: un entero (minutos por día). Vive separada de las sesiones porque la meta no es una sesión.
- `localStorage`, clave `diario-de-estudio.tema`: `"sistema"` (por defecto), `"claro"` o `"oscuro"`. **Se guarda la preferencia, no el tema aplicado**: si es `sistema`, el tema efectivo se recalcula en cada carga y en cada cambio del sistema.
- `id` es interno. Sirve para **ordenar** sesiones del mismo día (la más reciente guardada arriba) y para **saber cuál se está editando o borrando**. No lo pongas en la interfaz.
- Puntos de entrada, por módulo: en `js/datos.js`, `calcularRacha()`, `calcularMejorRacha()`, `leerSesiones()`, `leerMeta()`; en `js/interfaz.js`, `pintarTodo()`, `validar()`, `pintarRacha()`, `pintarMeta()`, `pintarCalendario()`, `pintarSesiones()`. Todo lo demás son satélites de esos.
- `pintarTodo(sesiones)` es el único sitio desde el que se repinta la pantalla entera. Si añades algo que dependa de las sesiones, llámalo desde ahí y no desde el manejador del botón.
- `index.html` usa `novalidate` a propósito: los errores los pinta la app, no el navegador. Quitarlo hace que aparezcan los tooltips nativos y desaparezcan los mensajes propios.

## Tema claro y oscuro

1. **Dos bloques de variables y nada más.** `:root` es el tema claro y `:root[data-tema="oscuro"]` el oscuro. No uses `@media (prefers-color-scheme)` en el CSS: quien elige un tema a mano no podría告别arse del sistema, y quedarían tres paletas que mantener.
2. **El tema lo pone un `<script>` inline en `<head>`, antes de los `<link>`.** Es el único script inline del proyecto. Va primero para que el tema oscuro no dé un fogonazo blanco mientras carga el resto. El arnés de pruebas lo saca de `index.html` y lo ejecuta antes que los ficheros sueltos.
3. **Ese script no puede usar `Diario`.** `nucleo.js` hace `var Diario = ...` y lo reemplaza entero, así que cualquier cosa que se cuelgue ahí antes de tiempo se pierde. Si necesitas compartir estado desde la cabecera, no lo hagas: recalcula la decisión desde la misma clave.
4. La clave `diario-de-estudio.tema` y la regla "sin preferencia manda el sistema" están **escritas en dos sitios** (el script inline y `js/preferencias.js`) a propósito: el primero tiene que ser sin dependencias. Si cambias una, cambia las dos.
5. `color-scheme` va declarado por tema, para que los controles nativos (el calendario del input de fecha) no queden en blanco sobre tema oscuro.
6. El selector es un `<fieldset>` con **radios nativos**, no botones: el grupo, el teclado y el "cuál está elegido" salen del elemento. `marcarEnElSelector()` desmarca los otros a mano aunque el navegador ya lo haga, para que no dependa de una casualidad.
7. `<meta name="theme-color" id="color-barra">` se actualiza al cambiar el tema, para la barra del navegador en móvil.

## Tokens y color

1. **En `estilos/componentes.css` no puede aparecer un color suelto.** Todo sale de un token de `base.css`. Si necesitas un color nuevo, primero es un token con sus dos temas.
2. Roles, no colores: `--fondo`, `--superficie`, `--superficie-2/3`, `--texto`, `--texto-suave`, `--borde`, `--borde-fuerte`, `--fuego`, `--fuego-texto`, `--fuego-tenue`, `--texto-boton`, `--exito`, `--error`, `--aviso`, `--foco`, `--dia-vacio/-bajo/-intenso`.
3. **Calcula los contrastes con la función de la skill, no a ojo**, y anota los ratios en el informe de la fase. Se comprobaron 23 parejas por tema (46 en total).
4. `--borde-fuerte` (no `--borde`) es el que usan los campos de formulario: los bordes de control necesitan 3:1 y los decorativos no.
5. **Un token, un tipo de valor.** La rampa de la llama tenía `--llama-sombra` sirviendo a la vez de duración, de desenfoque y de color, y `transition`/`drop-shadow` rechazaban la declaración entera sin avisar. Separa `--llama-duracion`, `--llama-desenfoque` y `--llama-halo`.
6. En `forced-colors` los bordes que en el CSS son `transparent` **hay que redeclararlos**: el modo fuerza los colores del autor pero un `transparent` se queda transparente y el control se queda sin contorno.
7. La llama crece por tramos, no por día: `1`, `--1` hasta 2 días, `--2` hasta 6, `--3` hasta 29 y `--4` desde 30. La clase la pone `pintarRacha()` sobre `#racha-tarjeta`. Los tramos 1 y 2 no llevan halo ni transición: sin llama grande, el resplandor sería ruido.
8. El texto de la racha **no lleva emoji**: la llama es un SVG decorativo (`aria-hidden="true"`), y el número al lado ya dice lo mismo.

## Movimiento

1. Todo movimiento pasa por tokens (`--d-micro`, `--d-estandar`, `--d-grande`, `--e-salida`, `--e-entrada`) y por la regla final de `componentes.css` que respeta `prefers-reduced-motion`.
2. El interruptor visible "Reducir animaciones" **todavía no existe**: hasta que exista, no añadas movimiento automático de más de 5 s (fondos animados, partículas). La skill lo exige y no hay forma de pausarlo todavía.
3. Con `--force-prefers-reduced-motion` todas las duraciones bajan a `0.00001s`. Ojo: `getAnimations()` sigue listando transiciones "en curso" porque el reloj del compositor no sigue al tiempo virtual de `--virtual-time-budget`; mide `transitionDuration` en vez de `playState`.

## Meta diaria

1. Entero > 0. Sin dato o dato corrupto → `META_POR_DEFECTO` (30).
2. Se guarda en `change` (al salir del campo o al pulsar Enter), sin botón. Si el valor no vale, `mostrarError()` y **se vuelve al último válido**: una meta no cambia sin que el usuario se entere.
3. Solo suma minutos de **hoy** (`minutosDeHoy()`), en hora local. No mira ayer ni la semana.
4. El relleno usa `Math.min(100, ...)`: sin ese tope, con 200 min y meta 30 la barra se saldría de la tarjeta. `.barra` además lleva `overflow: hidden` de segunda barrera.
5. `>= meta` pone la barra en verde y enseña `🎉 ¡Meta conseguida!`.
6. La meta no afecta a la racha ni a la mejor racha.
7. Cambia la meta también repinta el calendario, porque el umbral de "día intenso" es la meta (ver abajo).

## Reglas de la racha (no reimplementar sin leer esto)

1. Un día cuenta si tiene al menos una sesión.
2. La racha son los días consecutivos que **terminan hoy**.
3. **Excepción**: si hoy no hay sesión pero ayer sí, la racha sigue viva y se cuenta desde ayer. Solo se rompe al terminar el día.
4. Con hoy = día 10: `{10,9,8}`→3, `{9,8,7}`→3, `{10,8,7}`→1, `{8,7,6}`→0, `{}`→0.

## Mejor racha (el récord)

1. Es la racha más larga de **toda la historia**, no la que está viva. No lleva la condición de "termina hoy".
2. **Se deriva siempre de las sesiones, nunca se guarda.** No hay clave nueva en `localStorage` ni migración, y así el récord no puede quedarse viejo. Si alguien "optimiza" cacheándolo, cambia el comportamiento al borrar datos a mano.
3. **El `new Set(...)` no es opcional**: como se permiten varias sesiones el mismo día, recorrer el array crudo daría rachas infladas.
4. Se descartan los días futuros (`sesion.fecha <= hoy`), igual que en la racha actual. Sin esto, 3 sesiones apuntadas al futuro fabrican un récord falso.
5. El `.sort()` sobre `"AAAA-MM-DD"` es cronológico porque el formato es de ancho fijo con ceros. Usa `moverClave(anterior, 1)` para la consecutividad, no `+ 1` sobre el número del día.
6. Con hoy = día 10: `{10,9,8,5,4}`→3, `{10,9,7,6}`→2, `{10,10,10}`→1, `{10,1,2,3,4}`→4, `{11,12}`→0, `{}`→0.

## Calendario de actividad (28 días)

1. Son **28 días seguidos terminando hoy**, no un mes ni una cuadrícula de semanas. Se recorre con `moverClave(hoy, posicion - 27)`, así que cruza meses, años y años bisiestos sin código extra. Hoy siempre es la última casilla.
2. Tres niveles, y solo tres: `dia--vacio` (0 min), `dia--bajo` (`1..meta` min) y `dia--intenso` (`> meta` min). El umbral sigue a la meta, por eso `pintarCalendario()` llama a `leerMeta()`.
3. Los minutos del día salen de `minutosPorDia()`, que **suma** todas las sesiones de esa clave. Varias sesiones del mismo día pintan una sola casilla.
4. Cada casilla lleva el número de día (`clave.slice(-2)`) y un `title` con la fecha larga y los minutos. El número es para no depender solo del color; hoy además lleva `dia--hoy` (borde naranja).
5. Días futuros fuera de rango no aparecen: es una ventana de 28 días hacia atrás, no un filtro. La leyenda se reconstruye con `pintarLeyenda(meta)`.

## Editar y eliminar

1. El estado del modo edición es **una variable**, `idEnEdicion`: el id de la sesión o `null`. No se marca en el DOM.
2. `empezarEdicion(sesion)` rellena los tres campos, pone el botón en `Guardar cambios` y enseña `cancelar-edicion`. `salirDeEdicion()` y `limpiarFormulario()` son los dos estado base: llámalos siempre en pareja, así no se olvida ninguno.
3. Guardar **siempre** edita mientras `idEnEdicion` tenga algo, aunque se pulse Editar dos veces sin guardar: la segunda pulsación sustituye a la primera.
4. Editar conserva el `id` de la sesión. Si creara uno nuevo, el orden entre sesiones del mismo día saltaría al guardarse.
5. `confirmarBorrado(sesion)` usa `confirm()` y solo borra si se acepta. Si la sesión borrada era la que se estaba editando, sale del modo edición: si no, el formulario apuntaría a algo que ya no existe.
6. Los botones de cada fila se crean con `createElement` + `addEventListener`. No uses `innerHTML`: un `<button>` dentro de un string no se puede enlazar con su función.
7. Van **dentro de la columna de texto** de la fila, no como terceros hijos de `.sesion`. En 375 px, como hermanos de los minutos, se salían de la tarjeta (medido: 6 filas con `scrollWidth > clientWidth`).

## `id` y datos antiguos

- `normalizar(datos)` se aplica en cada `leerSesiones()`. Da id a lo que no lo tenga y separa ids repetidos, sin tocar fecha, tema ni minutos. Es una red de seguridad: el `localStorage` se puede editar a mano o venir de una versión antigua.
- **Normalizar no escribe en `localStorage`.** Los ids nuevos existen solo en memoria y se persisten en el siguiente guardado. Es intencionado: leer nunca debe escribir.
- `idLibre(sesiones)` es `max(id) + 1`, nunca `length + 1`: si borraras la última sesión, `length + 1` repetiría un id que sigue en pantalla.

## Trampas de fechas (esto se rompe fácil)

- `claveDeFecha(fecha)` usa `getFullYear/getMonth/getDate`, es decir **hora local**. Es la única fuente de "hoy". Nunca uses `toISOString()` para claves de día: convierte a UTC y salta de día según el huso.
- `moverClave(clave, dias)` suma/resta días **con `Date.UTC` a propósito**, para que el cambio de hora de verano no haga que la racha salte un día. No lo "simplifiques" a aritmética de milisegundos ni a `setDate` sobre fecha local.
- El valor de `<input type="date">` ya viene en `AAAA-MM-DD` y en hora local: guárdalo tal cual.
- El texto largo de la fecha en pantalla (`new Date(clave + 'T00:00:00')`) usa `T00:00:00` a propósito; `new Date(clave)` se interpretaría como UTC.

## Trampa de CSS

`.campo__error`, `.racha__mejor`, `.meta__cumplida` y `.boton--secundario` (el botón Cancelar) **no pueden tener `display`** en `estilos/componentes.css`. Se ocultan con el atributo `hidden`, y cualquier `display` de autor lo anula y los deja siempre visibles. Compruébalo en el navegador con `getComputedStyle(el).display === 'none'` y `el.offsetHeight === 0`, no mirando solo el atributo: `<p>` ya trae `display: block` del navegador y `<button>` trae `inline-block`, así que el valor computado engaña. Si necesitas espaciado, usa `margin`/`font-size`/`border-top`. En cambio `.dia` y `.leyenda` **sí** llevan `display`: nunca se ocultan con `hidden`.

## Cómo verificar (no hay tooling: ni test, ni lint, ni package.json)

Chrome headless es la vía rápida para render y consola:

```
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --user-data-dir="$env:TEMP\perfil-x" --virtual-time-budget=3000 --dump-dom "file:///F:/Projects/MyStudyDaily/index.html"
```

Para ejercitar el código (validación, racha, meta, calendario, editar/borrar) sin navegador: cargar **los cuatro ficheros, en el mismo orden que `index.html`**, en un contexto `node:vm` con un DOM simulado y un `localStorage` simulado. Es como se validaron las tablas de racha, meta y calendario. Gotchas del arnés, todos verificados:

- **El arnés reexpone las funciones de cada módulo como globales** (`sandbox.calcularRacha = Diario.obtener('datos').calcularRacha`) para no tener que reescribir las 264 aserciones cuando se mueve código. Si mueves una función de módulo, actualiza la tabla `EXPORTAR` del arnés o falla con `no exporta`.
- **Un estado mutable necesita `Object.defineProperty` con `get`**, no una copia: `idEnEdicion` se lee como `estadoEdicion()` desde dentro del módulo, porque si copiaras el valor el arnés leería siempre el inicial.
- **Congelar "hoy" con `'2026-03-10T12:00:00'`, nunca con `'2026-03-10'`.** Una fecha sin hora se parsea como medianoche **UTC** y en husos negativos el día se desplaza, provocando ~16 fallos falsos de golpe.
- Sustituye `Date` por una subclase que en el constructor sin argumentos devuelve la fecha fija; el código solo usa `new Date()`, `new Date(string)` y `Date.UTC`.
- El stub de elemento debe **borrar los hijos cuando se escribe `textContent = ''`** (igual que el DOM). `pintarSesiones()` depende de eso para no duplicar filas.
- Usa `process.env.TZ` con 2-3 zonas con cambio de hora (p. ej. `America/Santiago`, `Pacific/Auckland`) para comprobar que la racha sobrevive al DST.
- `<input type="number">` devuelve `''` si el usuario escribe letras, así que la rama "los minutos deben ser un número" de `validar()` es inalcanzable desde la interfaz. Es una red de seguridad, no un fallo.
- Compara arrays con `join(',')`, no con `===`: dos arrays con el mismo contenido nunca son idénticos y el fallo aparece como si fueran valores distintos.
- Al escribir un caso de prueba, **mira los días que usas antes de asumir que son pasados**. Con "hoy = 10 mar", un tramo del 20 al 24 es futuro y la mejor racha lo descarta (falla por diseño, no por bug).
- Cuidado con `append('texto')`: en el DOM crea un nodo de texto y suma al `textContent` del padre. Si el stub no lo imita, hay que leer el texto de los hijos.
- `className = 'x'` y `classList.add('x')` son caminos distintos: el stub tiene un `Set` aparte, así que para leer una clase puesta con `className` compara el `className`, no el `classList`.
- `leerSesiones()` normaliza en memoria y **no** escribe. Para comprobar la normalización hay que leer `leerSesiones()`, no el JSON crudo de `localStorage`.
- Si reescribes el arnés con `Set-Content` en PowerShell se rompe la codificación (lee UTF-8 como ANSI). Usa las herramientas de edición, o `[IO.File]::WriteAllText` con UTF-8.

## Gotchas del navegador al probar

- **Chrome comparte el `localStorage` entre todos los ficheros `file://`**: los datos que dejes en una copia de prueba contaminan `index.html` (salen rachas fantasma). Usa un `--user-data-dir` limpio por prueba.
- **Chrome en Windows ignora `--window-size` por debajo de ~500 px** (muestra `innerWidth` 504 aunque pidas 375). Para comprobar 375 px de verdad, mete la página en un `<iframe style="width:375px">` en una página auxiliar y mide `contentDocument.documentElement.scrollWidth` contra `innerWidth`; necesitas `--allow-file-access-from-files`.
- Para detectar errores de JS: añade `--enable-logging=stderr --v=0` y busca `ERROR:CONSOLE`, `Uncaught`, `TypeError`. Sin eso, Chrome headless no imprime los errores de la página.

## Decisiones abiertas (acordadas con el usuario, revisar antes de cambiar)

- **Fechas futuras permitidas**: no suman a la racha, pero salen en la lista. No añadir `max` al input sin preguntar. En la mejor racha se descartan por completo (el récord de 0 no se muestra).
- **Minutos decimales aceptados** (`12.5`) aunque el input tenga `step="1"`. Si se exige entero, hay que cambiar `validar()`, no solo el `step`.
- **Varias sesiones el mismo día permitidas**; la racha cuenta ese día una sola vez.
- **`localStorage` corrupto**: `leerSesiones()` devuelve `[]` en vez de romper la página. No la simplifiques a un `JSON.parse` sin `try`.
