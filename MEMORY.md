# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v4 **lista**: fases 0-(g), rediseño Ascua (marca, cabecera, bento) y **auditoría WCAG 2.2 AA cerrada el 7/10/2026**: `auditar.js` da 23/23 puntos, 0 fallos y 0 avisos (axe claro/oscuro/best-practice, teclado y foco, reflujo 320/375, objetivos ≥44, i18n es/en/fr, reduced-motion, forced-colors, diálogo de enfoque y pintado con datos).
- Estructura: `js/nucleo.js`, `js/datos.js`, `js/textos.js`, `js/preferencias.js`, `js/sonido.js`, `js/cronometro.js`, `js/enfoque.js`, `js/panel.js`, `js/interfaz.js` + `estilos/base.css`, `estilos/componentes.css` y `estilos/panel.css`.
- Funcionalidad: sesiones, racha, mejor racha, meta, minutos de la semana, calendario, editar/eliminar, cronómetro, modo enfoque, panel de estadísticas, tema, idioma y movimiento.
- **Fase (g)**: seis tonos generados con Web Audio (sin ficheros), apagado por defecto (`diario-de-estudio.sonido`), checkbox `#cabecera-sonido`. Suena al guardar, al error, al iniciar/pausar/terminar cronómetro y enfoque, al cruzar meta y al subir de tramo de llama; nunca al cargar ni con la pestaña oculta.
- IDs/clases cambiados en la cabecera: `.barra` → `.cabecera` (radios `cabecera-tema/-idioma/-movimiento-*`), `#sonido-activo` → `#cabecera-sonido`, y las barras del SVG pasan de `.barra` a `.barra-dia`.
- El arnés `node:vm` original (550 checks) se perdió el 2/10/2026 (truncado a 0 bytes). Reconstruido como un arnés nuevo y funcional en `C:\Users\AERO\AppData\Local\Temp\opencode\test-harness.js`: **96 comprobaciones, 0 fallos**.
- Datos en `localStorage`: `sesiones`, `meta`, `tema`, `idioma`, `cronometro`, `enfoque`, `movimiento`, `sonido`.
- Verificado ahora: arnés nuevo **96/96** (y en `TZ` Santiago/Auckland/London), contraste **46/46**, auditoría `auditar.js` **23/23** y bento medido a 320/375/1280 px.
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
- **Minutos de la semana = semana natural (lunes→domingo)**, no 7 días rodantes (eso es el filtro del panel): tercer bloque en `card-progreso`, siempre visible, sin meta semanal ni sonido nuevo.
- Calendario de 28 días terminando hoy, con `moverClave()`: cruza meses y años sin código extra.
- Estado de edición en `idEnEdicion`, no en el DOM; editar conserva el `id`.
- Mejor racha derivada de las sesiones, nunca guardada; las fechas futuras no cuentan para racha, mejor racha, meta ni calendario.
- El filtro del panel **no se guarda** (`diasPeriodo` en memoria): el periodo es una decisión de la visita, no un dato.
- El gráfico del panel tiene **tope de 30 días aunque el periodo sea todo**; `#grafico-nota` lo avisa y los KPI cuentan fechas únicas de las sesiones.
- El panel **no lleva pestañas** (decidido): el filtro de periodo hace de navegación; dos pestañas serían un `role="tablist"` para dos destinos, y los radios nativos dan teclado, grupo y selección gratis.
- El movimiento tiene solo **dos** opciones: una preferencia del SO no se puede desactivar con CSS, así que "Completo" sería una mentira.
- **El sonido se genera, no se carga**: osciladores de Web Audio, cero ficheros, y cada `tocar()` va en `try/catch` — sin audio la app sigue igual.
- El tono de logro suena al **cruzar** (meta o tramo de llama), no al repintar: cargar la página con todo cumplido nunca suena.
- **Constitución del proyecto** en `docs/constitution.md`: seis principios innegociables (stack puro, AGENTS.md manda sobre el código, lógica e interfaz separadas, tests sin instalar nada, datos solo en el navegador, español en el código y tres idiomas en la interfaz). Un cambio que rompa uno, no se mergea.

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
- Cabecera pegajosa: `height` fija + `flex-wrap` deja las filas de más pintándose encima de la portada → `min-height` + `display: grid` en la barra; y `scroll-padding-top` en `html` para que el foco no caiga debajo (2.4.11).
- El input de fecha de Chrome se tabula por segmentos (mes/día/año): el anillo necesita `:focus-within`, y en el arnés los radios 1×1 ocultos hay que medirlos por su `label`, no por el input.
- En el arnés, `interfaz.arrancar()` **ya corre al final de `js/interfaz.js`**: volver a llamarlo engancha los oyentes dos veces y cada acción se dispara dos veces. Para simular una carga con datos, se siembra el `localStorage` inicial (6º parámetro de `crearContexto`), no se repinta a mano.
- **Un check multi-línea sin llamar a su IIFE pasa la función, no su resultado**: `JSON.stringify(fn)` es `undefined` y el cuerpo no se ejecuta. El fallo parece un bug y es un paréntesis que falta.
- En SVG la clase se escribe entera en el atributo; los `<text>` son hijos directos del `<svg>`.

## Próximos pasos
- Ampliar el arnés nuevo hacia el tamaño del antiguo (~550 checks) si hace falta más red de seguridad.
- `push` de los commits locales cuando el usuario lo pida.
