# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v4 en curso: **Fases 0, (a), (b), (c), (d), (e), (f) y (g) listas**, más rediseño de pantalla (marca Ascua, cabecera compacta, tablero bento, racha/meta compactas). Falta la auditoría WCAG final y reconstruir el arnés.
- Estructura: `js/nucleo.js`, `js/datos.js`, `js/textos.js`, `js/preferencias.js`, `js/sonido.js`, `js/cronometro.js`, `js/enfoque.js`, `js/panel.js`, `js/interfaz.js` + `estilos/base.css`, `estilos/componentes.css` y `estilos/panel.css`.
- Funcionalidad: sesiones, racha, mejor racha, meta, calendario, editar/eliminar, cronómetro, modo enfoque, panel de estadísticas, tema, idioma y movimiento.
- **Fase (g)**: seis tonos generados con Web Audio (sin ficheros), apagado por defecto (`diario-de-estudio.sonido`), checkbox `#cabecera-sonido`. Suena al guardar, al error, al iniciar/pausar/terminar cronómetro y enfoque, al cruzar meta y al subir de tramo de llama; nunca al cargar ni con la pestaña oculta.
- IDs/clases cambiados en la cabecera: `.barra` → `.cabecera` (radios `cabecera-tema/-idioma/-movimiento-*`), `#sonido-activo` → `#cabecera-sonido`, y las barras del SVG pasan de `.barra` a `.barra-dia`.
- **Arnés node:vm perdido** (fichero `test-diario.js` truncado a 0 bytes por un reemplazo con regex mal hecho; no recuperable). La verificación queda en Chrome headless + `contraste.js` hasta reconstruirlo.
- Datos en `localStorage`: `sesiones`, `meta`, `tema`, `idioma`, `cronometro`, `enfoque`, `movimiento`, `sonido`.
- Verificado hasta la v4 antigua: **550 comprobaciones** en arnés `node:vm` (perdido después, ver arriba) + Chrome headless a 320/375/500/1280/1440 px, ambos temas, tres idiomas, `prefers-reduced-motion`, `forced-colors`, foco y sonido. Sin desborde ni errores de consola. 46/46 contrastes.
- Skill de UI en `.opencode/skills/ui-director-accesible/SKILL.md`, obligatoria para todo lo visual.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- **Scripts clásicos con IIFE**, no módulos ES: `import`/`export` están bloqueados por CORS en `file://`. Por eso existe `Diario` como único global, con `registrar`/`obtener`.
- `js/nucleo.js` va primero y es el único que crea `Diario`.
- El CSS se parte por hojas: tokens de tema en `base.css`, aspecto en `componentes.css` y `panel.css`.
- El tema efectivo es `data-tema` en `<html>`: dos bloques de variables y ningún `@media (prefers-color-scheme)`, porque quien elige a mano no podría volver al sistema.
- El tema se aplica con un `<script>` inline antes de los `<link>` (anti-fogonazo). No puede usar `Diario`, así que la clave y la regla están duplicadas a propósito en `preferencias.js`.
- Se guarda la **preferencia** (`sistema`), no el valor aplicado: con `sistema` se recalcula en cada carga y en cada cambio del SO (también para el movimiento).
- La llama crece por tramos, no por día; los dos primeros tramos van sin halo.
- Lo que depende del estado **no puede llevar `data-i18n`**: hay que repintarlo, y `alCambiarIdioma()` es una **lista** de oyentes (app, cronómetro, enfoque y panel).
- El cronómetro guarda `inicioMs`/`pausadoMs`, no un contador: recargar no pierde el rato y no se acumula deriva.
- Terminar cronómetro o enfoque **no guarda la sesión**, solo rellena el formulario: un único camino para escribir en `localStorage`.
- El modo enfoque usa `<dialog showModal()>` y una clase en `<body>` (nunca `hidden`); el reloj **cuenta hacia arriba** y el objetivo es un objetivo, no un límite; la pantalla completa es un extra; salir sin terminar **pregunta**.
- Meta guardada en `change`, sin botón, revierte al último válido; el umbral de "día intenso" del calendario **es la meta**.
- Calendario de 28 días terminando hoy, con `moverClave()`: cruza meses y años sin código extra.
- Estado de edición en `idEnEdicion`, no en el DOM; editar conserva el `id`.
- Mejor racha derivada de las sesiones, nunca guardada; las fechas futuras no cuentan para racha, mejor racha, meta ni calendario.
- El filtro del panel **no se guarda** (`diasPeriodo` en memoria): el periodo es una decisión de la visita, no un dato.
- El gráfico del panel tiene **tope de 30 días aunque el periodo sea todo**; `#grafico-nota` lo avisa y los KPI cuentan fechas únicas de las sesiones.
- El panel **no lleva pestañas** (decidido): el filtro de periodo hace de navegación; dos pestañas serían un `role="tablist"` para dos destinos, y los radios nativos dan teclado, grupo y selección gratis.
- El movimiento tiene solo **dos** opciones: una preferencia del SO no se puede desactivar con CSS, así que "Completo" sería una mentira.
- **El sonido se genera, no se carga**: osciladores de Web Audio, cero ficheros, y cada `tocar()` va en `try/catch` — sin audio la app sigue igual.
- El tono de logro suena al **cruzar** (meta o tramo de llama), no al repintar: cargar la página con todo cumplido nunca suena.

## Aprendizajes y errores a evitar
- Varios `<script src>` clásicos cargan desde `file://`; un módulo ES falla con `blocked by CORS policy`.
- Al repartir el código, el arnés debe **reexportar cada módulo como global**; los que comparten nombre llevan prefijo (`enfoque_*`, `panel_*`, `sonido_*`) o el último pisa al otro **sin error visible**.
- `new Set` antes de contar días: varias sesiones el mismo día inflarían la mejor racha.
- Clases ocultas con `hidden` + `display` en CSS = trampa: comprobar con `offsetHeight === 0`, no con el atributo.
- En 375 px, un tercer hijo flex en `.sesion` desborda: los botones van dentro de la columna de texto.
- Fecha congelada siempre `'AAAA-MM-DDT12:00:00'`: sin hora se parsea en UTC y desplaza el día.
- En tests, mira si los días que usas son pasados o futuros antes de esperar un resultado.
- `Set-Content` en PowerShell rompe UTF-8; para reescribir en masa, `[IO.File]::WriteAllText`.
- **Un token, un tipo de valor**: `transition`/`drop-shadow` rechazan la declaración entera si el token mezcla duración y color, sin avisar.
- En `forced-colors` hay que redeclarar los bordes `transparent` como `ButtonText`.
- Con `--virtual-time-budget` las transiciones no avanzan; `getAnimations()` lista transiciones "en curso" aunque la duración sea 0.00001s: medir `transitionDuration`, no `playState`.
- Un `aria-live` no puede reescribirse en cada tick: se compara la descripción, no la frase entera.
- En el arnés, `interfaz.arrancar()` **ya corre al final de `js/interfaz.js`**: volver a llamarlo engancha los oyentes dos veces y cada acción se dispara dos veces. Para simular una carga con datos, se siembra el `localStorage` inicial (6º parámetro de `crearContexto`), no se repinta a mano.
- **Un check multi-línea sin llamar a su IIFE pasa la función, no su resultado**: `JSON.stringify(fn)` es `undefined` y el cuerpo no se ejecuta. El fallo parece un bug y es un paréntesis que falta.
- En SVG la clase se escribe entera en el atributo; los `<text>` son hijos directos del `<svg>`.

## Próximos pasos
- Cerrar con una auditoría WCAG 2.2 AA completa.
