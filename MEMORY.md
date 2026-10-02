# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v4 en curso: **Fases 0 y (a) listas**; la (a) es la primera de la modernization visual y aún no está pusheada.
- Estructura: `js/nucleo.js`, `js/datos.js`, `js/textos.js`, `js/preferencias.js`, `js/interfaz.js` + `estilos/base.css` y `estilos/componentes.css`. `app.js` y `styles.css` borrados.
- Funcionalidad intacta: registrar sesiones, racha actual, mejor racha, meta diaria, calendario de 28 días y editar/eliminar.
- **Fase (a)**: tema claro/oscuro completo, selector con radios nativos, llama SVG por tramos y estados de interacción.
- Datos en `localStorage`: `sesiones` (array), `meta` (entero, 30 por defecto) y `tema` (`sistema`/`claro`/`oscuro`).
- Verificado: **297 comprobaciones** en arnés `node:vm` + Chrome headless a 320/375/500 px, texto al 200 %, ambos temas, `prefers-reduced-motion` y foco en los 20 controles. Sin desborde ni errores de consola. 46/46 contrastes ≥ 4.5:1.
- Skill de UI en `.opencode/skills/ui-director-accesible/SKILL.md`, obligatoria para todo lo visual.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- El código va en **scripts clásicos con IIFE**, no en módulos ES: `import`/`export` están bloqueados por CORS en `file://`, que es justo el modo de uso que manda. Por eso existe `Diario` como único global.
- Un solo global (`Diario`) y un solo registro de módulos (`registrar`/`obtener`): varios scripts clásicos comparten el ámbito global, así que sin esa barrera los nombres de dos secciones se pisan sin aviso.
- `js/nucleo.js` va primero y es el único que crea `Diario`: es lo que garantiza que los demás ficheros puedan registrarse al cargarse.
- El CSS se parte por hojas para que los tokens de tema no convivan con el aspecto de los componentes.
- El tema efectivo es un atributo `data-tema` en `<html>`, no una clase: dos bloques de variables (`:root` y `:root[data-tema="oscuro"]`) y ni un `@media (prefers-color-scheme)`, porque quien elige a mano no podría volver al sistema.
- El tema lo aplica un `<script>` inline antes de los `<link>` para evitar el fogonazo blanco. No puede usar `Diario` (nucleo.js lo reemplaza entero), así que la clave y la regla están duplicadas a propósito en `preferencias.js`.
- Se guarda la **preferencia** (`sistema`), no el tema aplicado: con `sistema` se recalcula en cada carga y en cada cambio del SO.
- La llama crece por tramos y no por día: la forma siempre es la misma para reconocer el producto, y los dos primeros tramos van sin halo porque un resplandor grande ahí sería ruido.
- CTA "Empezar a estudiar" aplazada a la fase de enfoque y fondo animado a la de movimiento: un botón sin acción o un bucle que no se puede pausar es peor que no tenerlo.
- Meta guardada en `change`, sin botón, y revierte al último valor válido si escribes algo que no vale: una meta no cambia sin que te enteres.
- Meta, racha y mejor racha son independientes: subir la meta a 20 no debe fingir más días de estudio.
- El umbral de "día intenso" del calendario **es la meta**, no un número fijo: así el color significa lo mismo que la barra.
- Calendario de 28 días seguidos terminando hoy, no un mes: se recorre con `moverClave()` y por eso cruza meses y años sin código extra.
- Estado de edición en una variable (`idEnEdicion`), no en el DOM: el DOM se repinta entero y ahí se perdería.
- Editar conserva el `id`: si creara uno nuevo, el orden entre sesiones del mismo día saltaría al guardar.
- Mejor racha derivada de las sesiones, nunca guardada: sin clave nueva ni migración, y el récord no puede quedarse viejo si se borran datos a mano.
- Las fechas futuras no cuentan para la racha, la mejor racha, la meta ni el calendario, aunque sí salen en la lista.

## Aprendizajes y errores a evitar
- Varios `<script src>` clásicos **sí** cargan desde `file://`; un módulo ES falla con `blocked by CORS policy`. La duda ya está resuelta a favor de los clásicos.
- Al repartir el código, el arnés debe **reexportar cada módulo como global**; si no, falla al leer algo que ya no está en el ámbito compartido.
- `new Set` antes de contar días: se permiten varias sesiones el mismo día y sin él la mejor racha saldría inflada.
- Clases ocultas con `hidden` + `display` en CSS = trampa. `.campo__error`, `.racha__mejor`, `.meta__cumplida` y `#cancelar-edicion` no pueden declarar `display`; comprobar con `offsetHeight === 0`, no con el atributo.
- En 375 px, un tercer hijo flex en `.sesion` (los botones) desborda la tarjeta. Van dentro de la columna de texto.
- Al probar con fecha congelada, siempre `'AAAA-MM-DDT12:00:00'`: una fecha sin hora se parsea en UTC y desplaza el día.
- En tests, mira si los días que usas son pasados o futuros antes de esperar un resultado.
- Los botones de fila se crean con `createElement` + `addEventListener`: dentro de un string no hay forma de enlazarlos.
- `Set-Content` en PowerShell rompe la codificación de un fichero UTF-8 (lee como ANSI). Para reescribir en masa, `[IO.File]::WriteAllText` con UTF-8.
- **Un token, un tipo de valor.** `--llama-sombra` era a la vez duración, desenfoque y color: `transition` y `drop-shadow` rechazan la declaración entera sin avisar, así que la llama no tenía ni transición ni halo. Separado en `--llama-duracion`, `--llama-desenfoque` y `--llama-halo`.
- En `forced-colors` un `border-color: transparent` **no** se corrige solo: hay que redeclararlo como `ButtonText`.
- El texto del selector de tema (`display:flex; flex-wrap:wrap`) desbordaba a 385 px con texto al 200 %; con `inline-flex` + `white-space` las etiquetas no bajan de línea. Probar siempre al 200 %.
- Con `--virtual-time-budget` las transiciones CSS no avanzan (el reloj del compositor no sigue al tiempo virtual): para comprobar un valor de token mide `getPropertyValue('--token')`, no el `filter` computado.

## Próximos pasos
- Commit y push de la fase (a).
- Fase (b): i18n ES/EN/FR con las claves ya decididas (`tema`, `sonido`, `movimiento`, `idioma`, `enfoque`).
