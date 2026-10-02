# AGENTS.md — Diario de Estudio

Web estática de una sola página para registrar sesiones de estudio y ver la racha de días.

## Reglas del proyecto (no negociables)

- **Solo tres archivos de la app**: `index.html`, `styles.css`, `app.js`. Sin frameworks, sin librerías, sin CDN, sin build, sin paso de compilación.
- **Debe funcionar con doble clic** en `index.html`. Por eso está prohibido `type="module"` (CORS lo bloquea en `file://`), `fetch()` de ficheros locales y cualquier import. Script clásico al final del `<body>`.
- **Todo el texto de la interfaz y los comentarios del código en español.**
- **Código para principiantes**: nombres descriptivos, funciones cortas, comentarios breves que expliquen el *porqué*. Nada de abstracciones ni helpers genéricos por adelantado.
- **Alcance cerrado**: nada de gráficos, estadísticas, exportación ni "mejoras" no pedidas. Si una idea es buena pero no está en el encargo, no la añadas. (Editar y eliminar sí están: ver "Editar y eliminar".)
- Móvil primero. Revisar siempre a **375 px de ancho**.
- El repo está en GitHub (`MAB015/mi-diary-de-estudio`). Todo cambio que añada, modifique o quite algo se documenta con un commit: ver "Commits".
- Este `AGENTS.md` es un archivo de documentación permitido; la regla de "tres archivos" es solo de la app. `README.md` también.

## Commits

1. **Cada cambio se documenta con un commit.** Añadir una función, corregir un fallo, tocar estilos o reescribir el `AGENTS.md` son motivos de commit. Si un cambio no está en un commit, está perdido.
2. **Primero verificar, después commitear.** Nada de commitear a ciegas: antes pasa el arnés (`node:vm`) y Chrome headless. Si no hay forma de probar el cambio, dilo en el mensaje del commit.
3. **Un commit por cambio coherente**, no uno por línea ni uno gigante con todo. Si puedes explicarlo en una frase, es un commit; si necesitas decir "y también" dos veces, probablemente son dos.
4. **El mensaje dice qué se hizo y por qué**, en español. Asunto con el nombre del proyecto y la función, como el primero: `Diario de Estudio: <qué>`. Debajo, el cuerpo con los *porqués* y los detalles que no se ven leyendo el diff.
5. **El código y su documentación van en el mismo commit.** Si un cambio altera el comportamiento, actualiza `AGENTS.md` (reglas) y/o `MEMORY.md` (estado) en ese mismo commit, nunca en uno suelto después.
6. **Nada de basura en el repo.** Solo los seis ficheros del proyecto. Las copias de prueba, los arneses y los perfiles de Chrome se quedan fuera, en la carpeta temporal.
7. **No reescribas historia publicada.** Nada de `amend`, `rebase` ni `push --force` sobre lo que ya está en GitHub. Un commit ya subido se corrige con otro commit.
8. **`push` cuando el usuario lo pida** o al cerrar una tanda de trabajo; el commit en local sí es siempre inmediato.
9. Si el repo cambia de nombre o de sitio, actualiza la línea de GitHub de la cabecera.

## Dónde vive cada cosa

- `localStorage`, clave `diario-de-estudio.sesiones`. Forma de cada sesión: `{ id: number, fecha: 'AAAA-MM-DD', tema: string, minutos: number }`.
- `localStorage`, clave `diario-de-estudio.meta`: un entero (minutos por día). Vive separada de las sesiones porque la meta no es una sesión.
- `id` es interno. Sirve para **ordenar** sesiones del mismo día (la más reciente guardada arriba) y para **saber cuál se está editando o borrando**. No lo pongas en la interfaz.
- Puntos de entrada de `app.js`: `calcularRacha()`, `calcularMejorRacha()`, `pintarTodo()`, `validar()`, `pintarRacha()`, `pintarMeta()`, `pintarCalendario()`, `pintarSesiones()`, `leerSesiones()`, `leerMeta()`. Todo lo demás son satélites de esos.
- `pintarTodo(sesiones)` es el único sitio desde el que se repinta la pantalla entera. Si añades algo que dependa de las sesiones, llámalo desde ahí y no desde el manejador del botón.
- `index.html` usa `novalidate` a propósito: los errores los pinta la app, no el navegador. Quitarlo hace que aparezcan los tooltips nativos y desaparezcan los mensajes propios.

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

`.campo__error`, `.racha__mejor`, `.meta__cumplida` y `.boton--secundario` (el botón Cancelar) **no pueden tener `display`** en `styles.css`. Se ocultan con el atributo `hidden`, y cualquier `display` de autor lo anula y los deja siempre visibles. Compruébalo en el navegador con `getComputedStyle(el).display === 'none'` y `el.offsetHeight === 0`, no mirando solo el atributo: `<p>` ya trae `display: block` del navegador y `<button>` trae `inline-block`, así que el valor computado engaña. Si necesitas espaciado, usa `margin`/`font-size`/`border-top`. En cambio `.dia` y `.leyenda` **sí** llevan `display`: nunca se ocultan con `hidden`.

## Cómo verificar (no hay tooling: ni test, ni lint, ni package.json)

Chrome headless es la vía rápida para render y consola:

```
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu --user-data-dir="$env:TEMP\perfil-x" --virtual-time-budget=3000 --dump-dom "file:///F:/Projects/MyStudyDaily/index.html"
```

Para ejercitar `app.js` (validación, racha, meta, calendario, editar/borrar) sin navegador: cargar el fichero en un contexto `node:vm` con un DOM simulado y un `localStorage` simulado. Es como se validaron las tablas de racha, meta y calendario. Gotchas del arnés, todos verificados:

- **Congelar "hoy" con `'2026-03-10T12:00:00'`, nunca con `'2026-03-10'`.** Una fecha sin hora se parsea como medianoche **UTC** y en husos negativos el día se desplaza, provocando ~16 fallos falsos de golpe.
- Sustituye `Date` por una subclase que en el constructor sin argumentos devuelve la fecha fija; `app.js` solo usa `new Date()`, `new Date(string)` y `Date.UTC`.
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
