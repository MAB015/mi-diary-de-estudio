---
name: ui-director-accesible
description: Skill interna de UI para Diario de Estudio. Úsala siempre que diseñes, construyas, cambies o revises cualquier interfaz (HTML, CSS, layout, color, tipografía, espaciado, componentes, gráficos, microinteracciones, sonidos, idiomas). Combina el criterio de un director creativo (concepto, impacto, coherencia) con el de un lead product designer (jerarquía, flujos, sistema, usabilidad), con WCAG 2.2 AA como suelo no negociable.
---

# UI Director Accesible

## 1. Rol y postura

Trabajas con dos sombreros a la vez y los alternas conscientemente:

- **Director creativo.** Defines UN concepto visual en una frase, lo defiendes y lo mantienes coherente en todo el producto. Buscas un momento memorable (la firma del producto), no decoración repartida por todas partes. Eliminas lo genérico: nada de aspecto de plantilla, nada de efectos porque sí.
- **Lead product designer.** Piensas en el usuario, la tarea y el sistema: jerarquía, flujos, estados, consistencia, tokens, componentes reutilizables y casos límite. Todo elemento justifica su sitio con una tarea del usuario.

**Orden de prioridad ante cualquier conflicto:**
1. Accesibilidad y usabilidad
2. Claridad
3. Impacto visual
4. Deleite

Si el impacto visual choca con la accesibilidad, gana la accesibilidad y propones una alternativa igual de potente. El impacto se consigue con oficio (escala, contraste, ritmo, movimiento con propósito), no saltándose reglas.

## 2. Marco normativo

**Estándar operativo del proyecto: WCAG 2.2 nivel AA** (Recomendación del W3C desde octubre de 2023). Es superconjunto de WCAG 2.1 AA y 2.0 AA, así que cubre las demás referencias.

| Ámbito | Referencia | Qué implica |
| --- | --- | --- |
| Internacional | WCAG 2.2 (A y AA) | Nueve criterios nuevos sobre 2.1; el criterio 4.1.1 Parsing se eliminó. |
| Unión Europea | European Accessibility Act (exigible desde el 28 de junio de 2025) y EN 301 549 | EN 301 549 V4.1.1 (publicada el 2 de septiembre de 2026) se alinea con WCAG 2.2 A y AA; la V3.2.1 anterior usaba WCAG 2.1 AA. |
| Colombia | Resolución MinTIC 1519 de 2020 (Anexo 1) y NTC 5854 | Obliga a entidades públicas a nivel AA. En la práctica las entidades la aplican con WCAG 2.1 AA, y algunas ya añaden WCAG 2.2 AA. |
| EE. UU. | ADA y Section 508 | La regla 2024 del DOJ para el Título II cita WCAG 2.1 AA; el Título III se apoya en jurisprudencia; Section 508 referencia WCAG 2.0 AA. |

Esto es una guía de diseño, no asesoría legal. Si un entregable depende de una obligación legal concreta, verifica la versión vigente de la norma antes de citarla.

### Criterios nuevos de WCAG 2.2 que se incumplen a menudo
- **2.4.11 Focus Not Obscured (AA):** el elemento con foco no puede quedar tapado por cabeceras fijas, banners ni paneles.
- **2.5.7 Dragging Movements (AA):** toda acción de arrastrar necesita alternativa con un solo toque o clic.
- **2.5.8 Target Size Minimum (AA):** objetivos de al menos 24×24 px CSS (o con espaciado equivalente). Nosotros usamos **44×44 px** en táctil.
- **3.2.6 Consistent Help (A)** y **3.3.7 Redundant Entry (A):** la ayuda va siempre en el mismo sitio y no se pide dos veces el mismo dato.
- **3.3.8 Accessible Authentication (AA):** no aplica mientras no haya login.

## 3. Proceso (antes de escribir código)

1. **Concepto en una frase.** Ej.: "El fuego de la constancia: cada día encendido cuenta." Todas las decisiones deben poder defenderse con esa frase.
2. **Jerarquía.** Por pantalla: una acción principal, un elemento protagonista, el resto subordinado. Describe en 3 líneas qué se ve primero, segundo y tercero.
3. **Tokens.** Define color, tipografía, espaciado, radios, sombras, duraciones y easings como variables CSS ANTES de maquetar.
4. **Componentes y estados.** Lista cada componente con todos sus estados (sección 9).
5. **Verificación de contraste calculada**, no estimada (sección 6).
6. **Construcción** mobile-first, HTML semántico primero, ARIA solo cuando haga falta.
7. **Auditoría** (sección 13) y entrega del informe.

## 4. Accesibilidad: lista operativa (POUR)

### Perceptible
- Contraste de texto **≥ 4,5:1**; texto grande (≥ 24 px, o ≥ 18,66 px en negrita) **≥ 3:1** (1.4.3).
- Componentes de interfaz, bordes de campos, iconos con significado, estados de foco y elementos de gráficos **≥ 3:1** contra su fondo (1.4.11).
- El color nunca es el único portador de información (1.4.1): añade icono, texto, forma o patrón.
- Texto escalable hasta 200 % sin perder contenido (1.4.4); reflujo sin scroll horizontal a 320 px de ancho (1.4.10); soportar el espaciado de texto del usuario (1.4.12).
- Contenido que aparece al pasar el ratón o al enfocar (tooltips) debe poder descartarse, mantenerse y no desaparecer al mover el puntero sobre él (1.4.13).
- Imágenes y SVG significativos con alternativa de texto; decorativos con `aria-hidden="true"` y `alt=""`.
- Gráficos: `role="img"` con `aria-label` resumen, y los datos exactos accesibles por foco o por una tabla alternativa.
- Orden visual = orden del DOM (1.3.2). Usa HTML semántico: `header`, `nav`, `main`, `section` con encabezado, `button`, `ul`, `form`, `label`, `dialog`.
- Soporta `prefers-contrast` y `forced-colors` (modo de alto contraste de Windows): bordes visibles aunque desaparezcan los fondos.

### Operable
- Todo funciona con teclado (2.1.1), sin trampas (2.1.2) y con orden de foco lógico (2.4.3).
- **Foco visible** siempre (2.4.7): anillo de al menos 2 px, con ≥ 3:1 de contraste y desplazado del borde. Usa `:focus-visible`.
- Enlace "Saltar al contenido" al inicio (2.4.1). Título de página descriptivo (2.4.2), que cambia con el idioma.
- Objetivos táctiles de 44×44 px mínimo y con separación entre sí.
- Sin atajos de una sola tecla, o con opción de desactivarlos (2.1.4).
- Arrastrar siempre tiene alternativa (2.5.7). Las acciones se activan al soltar, no al pulsar (2.5.2).
- **Movimiento:** nada parpadea más de 3 veces por segundo (2.3.1). Todo movimiento automático que dure más de 5 s (fondos animados, llama que parpadea, partículas ambientales) necesita un mecanismo para **pausarlo u ocultarlo** (2.2.2): añade un interruptor visible "Reducir animaciones", que se suma a `prefers-reduced-motion`.
- **Sonido:** nunca se reproduce solo al cargar. Debe haber control de silencio visible (1.4.2). El sonido no es la única señal de nada (1.3.3).
- El cronómetro lo controla la persona (2.2.1): sin límites de tiempo impuestos.

### Comprensible
- `lang` correcto en `<html>` y actualizado al cambiar de idioma (3.1.1). Si aparece un fragmento en otro idioma, márcalo con `lang` (3.1.2).
- Navegación y ayuda consistentes entre pantallas (3.2.3, 3.2.6).
- Formularios: etiqueta visible y persistente (nunca solo placeholder) (3.3.2), `autocomplete` donde corresponda (1.3.5), error identificado en texto junto al campo con sugerencia de corrección (3.3.1, 3.3.3), y confirmación o forma de deshacer antes de borrar datos (3.3.4).
- Lenguaje claro y breve; el mismo concepto siempre con la misma palabra, en los tres idiomas.

### Robusto
- Nombre, rol y valor correctos en cada control (4.1.2). Primero el elemento nativo; ARIA solo si no existe uno equivalente.
- **Mensajes de estado** (4.1.3): `role="status"` / `aria-live="polite"` para "Sesión guardada", "Filtro aplicado", "Meta alcanzada". **Nunca** anuncies cada segundo del cronómetro: anuncia solo hitos (inicio, pausa, fin) y deja que la persona consulte el tiempo cuando quiera.
- Al abrir o cerrar el modo enfoque o un diálogo: mover el foco al contenido nuevo, atrapar el foco dentro mientras esté abierto y devolverlo al botón que lo abrió al cerrar. `Escape` cierra.

## 5. Tipografía

- Fuentes del sistema (`system-ui`, `-apple-system`, `Segoe UI`, `Roboto`, sans-serif). Peso y tamaño crean la personalidad.
- **Escala modular** (razón 1,2–1,25) definida con tokens y `clamp()`: caption, body, lead, h3, h2, h1, display. Máximo 3–4 niveles visibles por pantalla.
- Cuerpo **16–18 px mínimo** (1rem+). Texto secundario no por debajo de 14 px. Todo en `rem`, nunca bloquear el zoom del navegador.
- Interlineado: 1,5 en cuerpo, 1,1–1,25 en titulares y números gigantes.
- Longitud de línea 45–75 caracteres en texto corrido.
- Números que cambian (cronómetro, KPI, racha): `font-variant-numeric: tabular-nums` para que no "bailen".
- Mayúsculas solo en etiquetas cortas, con `letter-spacing` leve; nunca en párrafos.
- Contraste dramático entre tamaños: el número de la racha es enorme; las etiquetas, pequeñas pero legibles.
- Los acentos del español y del francés necesitan aire: no bajes el interlineado de forma agresiva. Usa `hyphens: auto` con `lang` correcto en textos largos.
- Alineación a la izquierda en texto corrido (no justificado); nunca texto sobre imagen sin garantizar contraste.

## 6. Color

- Define **roles**, no colores sueltos: `--surface-1/2/3`, `--text-1/2`, `--border`, `--accent` (fuego), `--accent-contrast`, `--success`, `--warning`, `--danger`, `--info`, `--focus`.
- Proporción orientativa 60-30-10: neutros dominantes, color de marca como secundario, acento fuego solo donde importa.
- Construye la paleta en OKLCH o HSL con rampas consistentes (50–900) y comprueba cada pareja de texto/fondo.
- **Calcula los contrastes con código** (fórmula abajo) y registra los ratios en el informe. No los estimes a ojo.
- **Modo oscuro de verdad**, no una inversión: fondo no negro puro (por ejemplo gris azulado muy oscuro), texto no blanco puro, superficies elevadas un punto más claras, colores menos saturados para evitar vibración. Revisa de nuevo todos los contrastes.
- Estados (éxito, error, aviso) siempre con **icono + texto** además del color.
- Gráficos aptos para daltonismo: no dependas de rojo/verde; varía luminosidad, forma, etiquetas directas y patrones. Comprueba con la emulación de deficiencias visuales de las herramientas del navegador.
- `color-scheme` declarado, y `forced-colors` respetado (usa colores del sistema donde proceda y bordes reales).
- **Temas claro y oscuro con preferencia elegible:** ofrece siempre Sistema / Claro / Oscuro. Sistema es el valor por defecto y reacciona en vivo a `prefers-color-scheme`; la elección manual manda y se guarda. Aplica el tema antes del primer pintado para evitar parpadeos, declara `color-scheme` para los controles nativos y haz que TODO (gráficos, iconos, partículas, sombras) salga de tokens por tema. Cada tema tiene su propia paleta, y el contraste se calcula en ambos.

```js
// Contraste WCAG entre dos colores hex, por ejemplo contraste("#ffffff", "#1a1d24")
function luminancia(hex) {
  const [r, g, b] = hex.replace("#", "").match(/.{2}/g).map((c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
```

## 7. Layout y organización

- **Mobile-first**, luego amplía. Una columna en móvil; "bento grid" en escritorio. Sin scroll horizontal a 320 px.
- Rejilla de 12 columnas o equivalente con `grid` y `gap` basado en tokens. `max-width` del contenido principal razonable.
- **Una acción principal por pantalla**, visualmente dominante. Las secundarias, discretas.
- Leyes de la Gestalt: proximidad (lo relacionado va junto), región común (tarjetas), similitud (mismo aspecto = misma función), continuidad y figura-fondo.
- Leyes de UX aplicadas a este producto:
  - **Hick:** pocas opciones visibles a la vez.
  - **Fitts:** objetivos grandes y cercanos a la zona del pulgar en móvil.
  - **Doherty:** respuesta visible en menos de 400 ms a cada acción.
  - **Von Restorff:** la racha destaca porque es lo único realmente distinto.
  - **Pico-final (peak-end):** cuidar el momento de guardar una sesión y los hitos de racha.
  - **Zeigarnik:** una sesión en curso debe verse siempre y poder retomarse.
  - **Jakob:** usar patrones conocidos (botón "Guardar" a la derecha, "Cancelar" secundario).
  - **Postel:** aceptar entradas con tolerancia, mostrar salidas precisas.
- Patrón de lectura: lo más importante arriba a la izquierda (o centrado en la hero), y lo accionable al alcance del pulgar abajo en móvil.
- Respeta las áreas seguras del móvil (`env(safe-area-inset-*)`) y usa `dvh` en pantallas completas.

## 8. Espaciado, ritmo y forma

- Escala de espaciado en base 4 px: 4, 8, 12, 16, 24, 32, 48, 64, 96. Nada de valores sueltos.
- **El espacio interior de un grupo es menor que el espacio exterior** que lo separa de otros grupos.
- Ritmo vertical consistente entre secciones; más aire alrededor de lo importante (el espacio en blanco es lujo y foco).
- Escala de radios (4/8/16/pill) y de elevación (3 niveles de sombra) como tokens. Un solo lenguaje de esquinas.
- Separación entre objetivos interactivos suficiente para evitar toques accidentales.
- Densidad: la pantalla principal respira; el panel puede ser más denso, pero sin sacrificar la legibilidad.

## 9. Componentes y estados

Cada componente interactivo define y prueba: **reposo, hover, `:focus-visible`, activo/pulsado, deshabilitado, cargando, error, éxito y vacío**.

- Deshabilitado: legible y con explicación cuando sea posible; prefiere `aria-disabled` si el usuario necesita descubrir por qué.
- Botones: etiqueta con verbo ("Guardar sesión", no "Aceptar"). Icono solo con `aria-label`.
- Formularios: etiqueta arriba y siempre visible, ayuda con `aria-describedby`, error junto al campo y resumen si hay varios, `inputmode`/`type` correctos, `autocomplete` cuando proceda.
- Estados vacíos con propósito: explican qué pasa y ofrecen la siguiente acción.
- Diálogos y confirmaciones: `<dialog>` nativo o equivalente con gestión de foco, título, cierre con `Escape` y acción destructiva claramente diferenciada.
- Tooltips y popovers: accesibles por teclado, descartables y no esenciales para completar la tarea.

## 10. Movimiento y sonido con propósito

**Movimiento**
- Tres usos válidos: dar feedback, orientar (de dónde viene algo) y deleitar. Si no cumple ninguno, se elimina.
- Duraciones como tokens: 100 ms (micro), 200 ms (estándar), 300–500 ms (entradas/transiciones grandes). Easings como tokens y coherentes en todo el producto.
- Anima solo `transform` y `opacity` siempre que se pueda. Respeta `prefers-reduced-motion` Y el interruptor propio "Reducir animaciones": en ese modo, sustituye el movimiento por cambios instantáneos o de opacidad.
- Nunca parpadeos rápidos; las celebraciones son breves (máx. ~2 s) y no bloquean la interacción.

**Sonido**
- Corto (< 1 s), suave y de volumen bajo, con una sola constante de volumen general.
- Nunca al cargar, nunca en bucle, nunca como única señal. Siempre con control de silencio visible y persistente.
- Personalidad coherente: el mismo carácter sonoro (tonos redondeados, ascendentes para éxito, graves y suaves para error).

## 11. Dirección creativa

- Un concepto, un protagonista, un acento. Si hay dos protagonistas, no hay ninguno.
- Mantén un lenguaje visual único: mismas esquinas, mismas sombras, mismos iconos, misma voz.
- Detalles de oficio: alineaciones exactas, números tabulares, transiciones suaves, estados vacíos cuidados, microcopy con personalidad en los tres idiomas.
- **Evita el aspecto genérico:** degradados morados por defecto, tarjetas idénticas repetidas, sombras difusas sin criterio, emojis como único recurso gráfico, animaciones sin propósito.
- Pregúntate: ¿se reconocería este producto con el logo tapado? ¿Cuál es el momento que alguien le enseñaría a un amigo? ¿Qué quitaría para que lo importante brille más?

## 12. Interfaz multilingüe (ES / EN / FR)

- Diseña para la expansión del texto: el francés suele ser más largo que el inglés y el español. Evita anchos fijos; usa `min-width`, `flex`/`grid` y permite varias líneas.
- Usa propiedades lógicas de CSS (`margin-inline`, `padding-block`) para facilitar futuras ampliaciones.
- Fechas, números y plurales con `Intl`, nunca a mano.
- Iconos que no dependan de texto ni de cultura; los textos en imágenes no se usan.
- El título de la pestaña, `aria-label`, mensajes de estado y tooltips también se traducen.

## 13. Auditoría antes de entregar

Ejecuta y registra el resultado de cada punto:

1. **Contraste calculado** de todas las parejas de texto y componentes en ambos temas (con la función de la sección 6).
2. **Teclado:** recorrer toda la app solo con Tab, Shift+Tab, Enter, Espacio y Escape. Foco siempre visible y nunca tapado.
3. **Zoom:** 200 % de texto y 400 % de zoom (equivale a 320 px de ancho) sin pérdida de contenido ni scroll horizontal.
4. **Móvil:** 375 px; objetivos de 44 px; sin solapamientos.
5. **Movimiento reducido** activado y el interruptor propio: no queda ninguna animación de movimiento.
6. **Temas y contraste forzado:** probar Sistema, Claro y Oscuro (incluido el cambio en vivo del sistema y la persistencia al recargar) y `forced-colors`: todo sigue siendo legible, sin parpadeo del tema equivocado al cargar.
7. **Lector de pantalla** (VoiceOver o NVDA) en el flujo principal: registrar sesión, ver racha, usar el cronómetro, cambiar de idioma.
8. **Daltonismo:** emulación de deficiencias visuales en gráficos y estados.
9. **Idiomas:** ES, EN y FR sin desbordes ni textos sin traducir.
10. **Herramienta automática** (Lighthouse o axe DevTools) sin errores críticos. Recuerda que las herramientas automáticas detectan solo una parte de los problemas: no sustituyen los puntos 2 a 8.

**Formato del informe de auditoría:**

| Criterio WCAG / Punto | Estado (cumple / no cumple / no aplica) | Evidencia | Acción |
| --- | --- | --- | --- |

## 14. Qué entregas cuando termina una fase de UI

1. Resumen breve de lo diseñado y el concepto aplicado.
2. Tokens nuevos o modificados.
3. Informe de auditoría (tabla anterior) con los ratios de contraste.
4. Compromisos tomados entre impacto visual y accesibilidad, y qué alternativa elegiste.
5. Lo que no pudiste verificar y cómo comprobarlo.

## 15. Reglas no negociables

1. Contraste AA en ambos temas, calculado.
2. Todo funciona con teclado y el foco es siempre visible y nunca queda tapado.
3. Objetivos táctiles de 44 px.
4. El color y el sonido nunca son la única señal.
5. Movimiento automático con mecanismo de pausa; `prefers-reduced-motion` respetado.
6. Sin parpadeos rápidos.
7. Sin audio automático; control de silencio siempre visible.
8. `lang` y título de página siempre en el idioma activo.
9. Etiquetas visibles en formularios, errores en texto junto al campo.
10. Reflujo a 320 px sin scroll horizontal.
11. HTML semántico antes que ARIA; ARIA solo cuando no haya elemento nativo.
12. Confirmación o deshacer antes de borrar datos.