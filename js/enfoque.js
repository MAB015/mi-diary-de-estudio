/*
 * enfoque.js — el modo sin distracciones.
 *
 * Tres cosas y nada más: un diálogo para decir qué y cuánto, una pantalla a
 * pantalla completa con el reloj, y un camino de vuelta que no pierde el rato
 * sin preguntar.
 *
 * El reloj cuenta hacia arriba, no hacia abajo a propósito. El objetivo que se
 * elige es un objetivo, no un límite: si alguien estudia 40 minutos con un
 * objetivo de 25, se anotan 40. Un contador que se para solo obligaría a
 * inventar el tiempo que queda, y lo que se guarda es tiempo real de estudio.
 *
 * No reutiliza el cronómetro aunque la fórmula del tiempo sea la misma: aquel
 * se guarda en localStorage y sobrevive a cerrar la pestaña, y este no. Couplarlos
 * por cuatro líneas de aritmética costaría más que repetirlas.
 */

Diario.registrar('enfoque', (function () {
  'use strict';

  const textos = Diario.obtener('textos');

  const CLAVE = 'diario-de-estudio.enfoque';
  const OBJETIVO_POR_DEFECTO = 25;
  const OBJETIVO_MAXIMO = 480;

  /*
   * Estado de la sesión en curso. Vive aquí y no en el DOM porque es estado de
   * la app; el DOM solo lo refleja.
   */
  let activo = false;
  let temaSesion = '';
  let objetivoMinutos = OBJETIVO_POR_DEFECTO;
  let objetivoCumplido = false;
  let inicioMs = 0;
  let pausadoMs = 0;
  let pausaDesdeMs = 0;
  let reloj = null;

  const ahora = () => Date.now();

  /* ---------- El diálogo ---------- */

  function leerPreferencia() {
    let dato = null;
    try {
      dato = JSON.parse(localStorage.getItem(CLAVE));
    } catch (error) {
      return { minutos: OBJETIVO_POR_DEFECTO, pantallaCompleta: true };
    }
    if (!dato || typeof dato !== 'object') {
      return { minutos: OBJETIVO_POR_DEFECTO, pantallaCompleta: true };
    }
    return {
      minutos: validarObjetivo(dato.minutos) ?? OBJETIVO_POR_DEFECTO,
      pantallaCompleta: dato.pantallaCompleta !== false,
    };
  }

  function guardarPreferencia() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({
        minutos: objetivoMinutos,
        pantallaCompleta: document.getElementById('enfoque-pantalla').checked,
      }));
    } catch (error) {
      // Sin permiso de guardado el modo funciona igual en esta carga.
    }
  }

  /* Un entero de 1 a 480 minutos, o null si no lo es. */
  function validarObjetivo(valor) {
    const numero = Number(valor);
    if (!Number.isInteger(numero)) return null;
    if (numero < 1 || numero > OBJETIVO_MAXIMO) return null;
    return numero;
  }

  /* Abre el diálogo con lo de la última vez y el tema que ya esté escrito. */
  function abrirDialogo() {
    const preferencia = leerPreferencia();
    const dialogo = document.getElementById('dialogo-enfoque');
    const campoTema = document.getElementById('enfoque-tema');
    const campoObjetivo = document.getElementById('enfoque-objetivo');
    const casillaPantalla = document.getElementById('enfoque-pantalla');

    campoTema.value = document.getElementById('tema').value.trim();
    campoObjetivo.value = String(preferencia.minutos);
    casillaPantalla.checked = preferencia.pantallaCompleta;

    limpiarErrores();
    if (dialogo.showModal) dialogo.showModal();
    campoTema.focus();
  }

  /* Valida el diálogo. Devuelve el motivo del error, o null si está todo bien. */
  function validarDialogo() {
    const tema = document.getElementById('enfoque-tema');
    const objetivo = document.getElementById('enfoque-objetivo');

    if (tema.value.trim() === '') return 'enfoque.temaError';
    if (validarObjetivo(objetivo.value) === null) return 'enfoque.objetivoError';
    return null;
  }

  function limpiarErrores() {
    for (const id of ['enfoque-tema', 'enfoque-objetivo']) {
      const aviso = document.getElementById(`error-${id}`);
      if (aviso) {
        aviso.textContent = '';
        aviso.hidden = true;
      }
      document.getElementById(id).removeAttribute('aria-invalid');
    }
  }

  function mostrarError(id, clave) {
    const aviso = document.getElementById(`error-${id}`);
    aviso.textContent = textos.t(clave);
    aviso.hidden = false;
    document.getElementById(id).setAttribute('aria-invalid', 'true');
  }

  /* ---------- La sesión ---------- */

  function transcurrido(fechaActual) {
    const momento = fechaActual === undefined ? ahora() : fechaActual;
    const enPausaAhora = pausaDesdeMs > 0 ? Math.max(0, momento - pausaDesdeMs) : 0;
    return Math.max(0, momento - inicioMs - pausadoMs - enPausaAhora);
  }

  function minutosTranscurridos(fechaActual) {
    return Math.max(1, Math.round(transcurrido(fechaActual) / 60000));
  }

  function formatearTiempo(ms) {
    const total = Math.floor(Math.max(0, ms) / 1000);
    const dos = (n) => String(n).padStart(2, '0');
    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = total % 60;
    return horas > 0 ? `${dos(horas)}:${dos(minutos)}:${dos(segundos)}` : `${dos(minutos)}:${dos(segundos)}`;
  }

  function iniciar() {
    // Primero se limpian los errores del intento anterior: si ahora todo está
    // bien, un aviso viejo pondría "escribe el tema" encima de un formulario
    // ya correcto.
    limpiarErrores();
    const problema = validarDialogo();
    if (problema) {
      const id = problema === 'enfoque.temaError' ? 'enfoque-tema' : 'enfoque-objetivo';
      mostrarError(id, problema);
      document.getElementById(id).focus();
      return false;
    }

    temaSesion = document.getElementById('enfoque-tema').value.trim();
    objetivoMinutos = validarObjetivo(document.getElementById('enfoque-objetivo').value);
    objetivoCumplido = false;
    inicioMs = ahora();
    pausadoMs = 0;
    pausaDesdeMs = 0;
    activo = true;

    guardarPreferencia();
    document.getElementById('dialogo-enfoque').close();
    // La clase en <body> esconde la app: con el atributo hidden no valdría,
    // porque el CSS le da display a la pantalla de enfoque.
    document.body.classList.add('en-foco');
    document.getElementById('enfoque-tema-pantalla').textContent = temaSesion;
    document.getElementById('enfoque-anuncio').textContent = textos.t('enfoque.anuncioInicio', {
      tema: temaSesion,
      minutos: textos.formatearNumero(objetivoMinutos),
    });

    pedirPantallaCompleta();
    document.getElementById('enfoque-alternar').focus();
    ponerEnMarcha();
    pintar();
    return true;
  }

  /*
   * La pantalla completa es un extra, nunca un requisito: en un iPhone no
   * existe y el modo tiene que funcionar igual. El fallo se avisa una vez.
   */
  function pedirPantallaCompleta() {
    if (!document.getElementById('enfoque-pantalla').checked) return;
    const raiz = document.documentElement;
    if (!raiz.requestFullscreen) {
      document.getElementById('enfoque-anuncio').textContent = textos.t('enfoque.pantallaNoDisponible');
      return;
    }
    try {
      // En un navegador real esto devuelve una promesa; en el arnés no existe.
      const promesa = raiz.requestFullscreen();
      if (promesa && promesa.catch) promesa.catch(avisarPantallaNoDisponible);
    } catch (error) {
      avisarPantallaNoDisponible();
    }
  }

  function avisarPantallaNoDisponible() {
    document.getElementById('enfoque-anuncio').textContent = textos.t('enfoque.pantallaNoDisponible');
  }

  function pausar() {
    if (!activo || pausaDesdeMs > 0) return;
    pausaDesdeMs = ahora();
    pararElReloj();
    pintar();
    document.getElementById('enfoque-anuncio').textContent = textos.t('enfoque.anuncioPausa');
  }

  function reanudar() {
    if (!activo || pausaDesdeMs === 0) return;
    pausadoMs += Math.max(0, ahora() - pausaDesdeMs);
    pausaDesdeMs = 0;
    ponerEnMarcha();
    pintar();
  }

  function alternar() {
    if (pausaDesdeMs > 0) reanudar();
    else pausar();
  }

  /*
   * Terminar es el camino bueno: anota el tiempo en el formulario y vuelve a la
   * app. Salir sin más es el camino malo, y por eso pregunta.
   */
  function terminar() {
    if (!activo) return;
    const minutos = minutosTranscurridos();
    salir();
    // interfaz.js se carga después: se pide dentro de la función.
    Diario.obtener('interfaz').prepararSesion(minutos, temaSesion);
  }

  function salirSinPreguntar() {
    if (!activo) return false;
    salir();
    return true;
  }

  function salir() {
    activo = false;
    inicioMs = 0;
    pausadoMs = 0;
    pausaDesdeMs = 0;
    objetivoCumplido = false;
    pararElReloj();
    document.body.classList.remove('en-foco');
    const boton = document.getElementById('empezar-estudio');
    if (boton) boton.focus();
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        document.exitFullscreen();
      } catch (error) {
        // Si el navegador no deja salir, al menos la app vuelve a verse.
      }
    }
  }

  /* Salir sin guardar. Pregunta antes, porque el rato se pierde. */
  function salirPreguntando() {
    if (!activo) return;
    if (!confirm(textos.t('enfoque.confirmarSalir'))) return;
    salirSinPreguntar();
  }

  function ponerEnMarcha() {
    pararElReloj();
    reloj = setInterval(pintar, 1000);
  }

  function pararElReloj() {
    if (reloj === null) return;
    clearInterval(reloj);
    reloj = null;
  }

  function pintar() {
    const pantalla = document.getElementById('enfoque-tiempo');
    if (!pantalla) return;
    const minutos = Math.floor(transcurrido() / 60000);

    pantalla.textContent = formatearTiempo(transcurrido());
    // El objetivo se pinta aquí y no al iniciar para que también salga en el
    // idioma nuevo si se cambia con la sesión abierta.
    document.getElementById('enfoque-objetivo-pantalla').textContent = textos.t(
      'enfoque.objetivoDe',
      { minutos: textos.formatearNumero(objetivoMinutos) }
    );

    // Al llegar al objetivo se avisa una sola vez, pero el reloj sigue corriendo:
    // el objetivo no corta el estudio.
    if (!objetivoCumplido && minutos >= objetivoMinutos) {
      objetivoCumplido = true;
      document.getElementById('enfoque-anuncio').textContent = textos.t('enfoque.objetivoCumplido');
    }

    document.getElementById('enfoque-alternar').textContent = textos.t(
      pausaDesdeMs > 0 ? 'enfoque.reanudar' : 'enfoque.pausar'
    );
  }

  /* ---------- Arranque ---------- */

  function arrancar() {
    document.getElementById('empezar-estudio').addEventListener('click', abrirDialogo);
    document.getElementById('formulario-enfoque').addEventListener('submit', (evento) => {
      evento.preventDefault();
      iniciar();
    });
    document.getElementById('enfoque-cancelar').addEventListener('click', () => {
      document.getElementById('dialogo-enfoque').close();
    });
    document.getElementById('enfoque-alternar').addEventListener('click', alternar);
    document.getElementById('enfoque-terminar').addEventListener('click', terminar);
    document.getElementById('enfoque-salir').addEventListener('click', salirPreguntando);

    // Igual que el cronómetro: sus textos dependen del estado y no salen de
    // data-i18n, así que se repintan al cambiar el idioma con la sesión abierta.
    textos.alCambiarIdioma(() => {
      if (activo) pintar();
    });

    /*
     * Escape en la pantalla de enfoque también pregunta. En el diálogo lo hace
     * el navegador, que ya cierra solo; aquí hay algo que perder.
     */
    document.addEventListener('keydown', (evento) => {
      if (evento.key !== 'Escape' || !activo) return;
      evento.preventDefault();
      salirPreguntando();
    });
  }

  return {
    arrancar: arrancar,
    abrirDialogo: abrirDialogo,
    iniciar: iniciar,
    terminar: terminar,
    salirPreguntando: salirPreguntando,
    salirSinPreguntar: salirSinPreguntar,
    pausar: pausar,
    reanudar: reanudar,
    alternar: alternar,
    pintar: pintar,
    validarDialogo: validarDialogo,
    validarObjetivo: validarObjetivo,
    leerPreferencia: leerPreferencia,
    transcurrido: transcurrido,
    minutosTranscurridos: minutosTranscurridos,
    formatearTiempo: formatearTiempo,
    activo: () => activo,
    pausaDesde: () => pausaDesdeMs,
    CLAVE: CLAVE,
  };
})());