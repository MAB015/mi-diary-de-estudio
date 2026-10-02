/*
 * preferencias.js — el tema (y más adelante el sonido y las animaciones).
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
      const radio = document.getElementById(`tema-${otro}`);
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
      const radio = document.getElementById(`tema-${valor}`);
      if (radio) radio.addEventListener('change', () => elegirTema(valor));
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

  return {
    arrancar: arrancar,
    elegirTema: elegirTema,
    aplicar: aplicar,
    preferenciaGuardada: preferenciaGuardada,
  };
})());