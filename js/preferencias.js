/*
 * preferencias.js - el tema, el idioma y el movimiento.
 *
 * El script de la cabecera ya pone el tema antes del primer pintado; aquí
 * solo se conecta el selector de la pantalla con esa misma decisión.
 *
 * Reparto de trabajo: la clave de localStorage y la regla "si no hay
 * preferencia guardada, manda el sistema" están escritas en los dos sitios,
 * porque el script de la cabecera no puede usar este módulo (aún no está
 * cargado, y tiene que ser sin dependencias). Si se cambia la clave en uno,
 * hay que cambiarla en el otro.
 */

Diario.registrar('preferencias', (function () {
  'use strict';

  const CLAVE_TEMA = 'diario-de-estudio.tema';
  const VALORES = ['sistema', 'claro', 'oscuro'];
  const CONSULTA = '(prefers-color-scheme: dark)';

  /*
   * Escribe la preferencia y la aplica al momento. Se guarda "sistema" tal
   * cual (no el tema que ha salido de él): si la persona eligió seguir al
   * sistema y luego cambia el del móvil, la app le sigue.
   */
  function elegirTema(valor) {
    const elegido = VALORES.indexOf(valor) === -1 ? 'sistema' : valor;
    localStorage.setItem(CLAVE_TEMA, elegido);
    aplicar(elegido, window.matchMedia(CONSULTA).matches);
    marcarEnElSelector(elegido);
    return elegido;
  }

  function aplicar(preferencia, sistemaOscuro) {
    const oscuro = preferencia === 'oscuro' || (preferencia === 'sistema' && sistemaOscuro);
    document.documentElement.setAttribute('data-tema', oscuro ? 'oscuro' : 'claro');
    const barraNavegador = document.getElementById('color-barra');
    if (barraNavegador) barraNavegador.setAttribute('content', oscuro ? '#0f1216' : '#fbf8f4');
  }

  function preferenciaGuardada() {
    const guardada = localStorage.getItem(CLAVE_TEMA);
    return VALORES.indexOf(guardada) === -1 ? 'sistema' : guardada;
  }

  function marcarEnElSelector(valor) {
    // Se desmarcan los otros a mano aunque el navegador ya lo haga por su
    // cuenta al ser un grupo de radios: así el estado no depende de una
    // casualidad del navegador y se puede comprobar en las pruebas.
    for (const otro of VALORES) {
      const radio = document.getElementById(`cabecera-tema-${otro}`);
      if (radio) radio.checked = otro === valor;
    }
  }

  /* Se llama al arrancar: refleja lo guardado, aplica el tema y escucha. */
  function arrancar() {
    const guardada = preferenciaGuardada();
    const consulta = window.matchMedia(CONSULTA);
    marcarEnElSelector(guardada);
    // El script de la cabecera ya lo aplicó; repetirlo es idempotente y
    // garantiza que el selector y el tema puesto no puedan discrepar.
    aplicar(guardada, consulta.matches);

    for (const valor of VALORES) {
      const radio = document.getElementById(`cabecera-tema-${valor}`);
      if (radio) radio.addEventListener('change', () => elegirTema(valor));
    }

    // El movimiento va aparte porque "reducido" no depende del sistema: o se
    // reduce siempre, o no se toca nada y manda el SO.
    const movimiento = movimientoGuardado();
    marcarMovimientoEnElSelector(movimiento);
    aplicarMovimiento(movimiento);

    for (const valor of VALORES_MOVIMIENTO) {
      const radio = document.getElementById(`cabecera-movimiento-${valor}`);
      if (radio) radio.addEventListener('change', () => elegirMovimiento(valor));
    }

    // Mientras la preferencia sea "sistema", el cambio del sistema se sigue
    // en vivo. Al elegir un tema a mano, esta llamada deja de importar.
    if (consulta.addEventListener) {
      consulta.addEventListener('change', () => {
        if (preferenciaGuardada() === 'sistema') {
          aplicar('sistema', consulta.matches);
          marcarEnElSelector('sistema');
        }
      });
    }
  }

  /* ---------- Movimiento ---------- */

  const CLAVE_MOVIMIENTO = 'diario-de-estudio.movimiento';
  const VALORES_MOVIMIENTO = ['sistema', 'reducido'];

  /*
   * "sistema" no pone atributo ninguno: así manda el @media
   * (prefers-reduced-motion: reduce) y el sistema sigue siendo la fuente. El
   * atributo solo se pone para "reducido", que es una decisión explícita y por
   * eso necesita un estado que lo distinga de "sistema".
   */
  function aplicarMovimiento(preferencia) {
    if (preferencia === 'reducido') {
      document.documentElement.setAttribute('data-movimiento', 'reducido');
    } else {
      document.documentElement.removeAttribute('data-movimiento');
    }
  }

  function movimientoGuardado() {
    const guardada = localStorage.getItem(CLAVE_MOVIMIENTO);
    return VALORES_MOVIMIENTO.indexOf(guardada) === -1 ? 'sistema' : guardada;
  }

  function marcarMovimientoEnElSelector(valor) {
    for (const otro of VALORES_MOVIMIENTO) {
      const radio = document.getElementById(`cabecera-movimiento-${otro}`);
      if (radio) radio.checked = otro === valor;
    }
  }

  function elegirMovimiento(valor) {
    const elegido = VALORES_MOVIMIENTO.indexOf(valor) === -1 ? 'sistema' : valor;
    localStorage.setItem(CLAVE_MOVIMIENTO, elegido);
    aplicarMovimiento(elegido);
    marcarMovimientoEnElSelector(elegido);
    return elegido;
  }

  return {
    arrancar: arrancar,
    elegirTema: elegirTema,
    aplicar: aplicar,
    preferenciaGuardada: preferenciaGuardada,
    elegirMovimiento: elegirMovimiento,
    aplicarMovimiento: aplicarMovimiento,
    movimientoGuardado: movimientoGuardado,
    marcarMovimientoEnElSelector: marcarMovimientoEnElSelector,
  };
})());