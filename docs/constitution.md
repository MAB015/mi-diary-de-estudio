# Constitución del Diario de Estudio

Seis principios innegociables. Si un cambio rompe uno, no se mergea. Se comprueban como se dice en cada punto.

1. **Stack de HTML/CSS/JS puro.** Sin frameworks, ni build, ni dependencias: la app se abre con doble clic en `index.html`. Se comprueba: no existe `package.json` ni `node_modules`.
2. **AGENTS.md manda sobre el código.** Si discrepan, se arregla uno de los dos en el mismo commit; nunca se queda desincronizado. Nadie "arregla" el código leyendo solo el código.
3. **Lógica e interfaz separadas.** Los cálculos viven sin DOM (`datos.js`), lo que pinta solo pinta (`interfaz.js`), y `pintarTodo()` es el único repintado. Se comprueba: `datos.js` no contiene la palabra `document`.
4. **Verificación sin instalar nada.** Antes de cada commit: arnés `node:vm` a 0 fallos y Chrome headless sin errores de consola. Se comprueba: se rechaza cualquier dependencia de testing.
5. **Los datos no salen del navegador.** Todo en `localStorage`, cero peticiones de red, cero CDNs. Se comprueba: `js/` no contiene `fetch(`, `XMLHttpRequest` ni `https://`.
6. **Español en el código, tres idiomas en la interfaz.** Comentarios y mensajes en español; todo texto visible sale de `textos.js` con `es`/`en`/`fr`. Se comprueba: ningún literal en `index.html` sin `data-i18n`.
