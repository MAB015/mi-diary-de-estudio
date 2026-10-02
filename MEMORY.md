# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v4 en curso: **Fase 0 terminada**, el código se ha partido en `js/nucleo.js`, `js/datos.js`, `js/textos.js` y `js/interfaz.js`, más `estilos/base.css` y `estilos/componentes.css`. Se han borrado `app.js` y `styles.css`.
- Funcionalidad intacta tras el reparto: registrar sesiones, racha actual, mejor racha, **meta diaria**, **calendario de 28 días** y **editar/eliminar**.
- Datos en `localStorage`: `diario-de-estudio.sesiones` (array de sesiones) y `diario-de-estudio.meta` (entero, 30 por defecto).
- Verificado tras el reparto: 264 comprobaciones en arnés `node:vm` + Chrome headless a 375 px (sin desborde, sin errores de consola).
- Skill de UI en `.opencode/skills/ui-director-accesible/SKILL.md`, obligatoria para todo lo visual.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- El código va en **scripts clásicos con IIFE**, no en módulos ES: `import`/`export` están bloqueados por CORS en `file://`, que es justo el modo de uso que manda. Por eso existe `Diario` como único global.
- Un solo global (`Diario`) y un solo registro de módulos (`registrar`/`obtener`): varios scripts clásicos comparten el ámbito global, así que sin esa barrera los nombres de dos secciones se pisan sin aviso.
- `js/nucleo.js` va primero y es el único que crea `Diario`: es lo que garantiza que los demás ficheros puedan registrarse al cargarse.
- El CSS se parte por hojas para que los tokens de tema no convivan con el aspecto de los componentes.
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

## Próximos pasos
- (vacío por ahora)
