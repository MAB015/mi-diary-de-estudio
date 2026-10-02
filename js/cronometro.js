/*
 * cronometro.js — el reloj de estudiar.
 *
 * Es una máquina de estados muy pequeña: parado, en marcha y en pausa. Lo que
 * importa es que el tiempo se guarde mientras corre, para que cerrar la
 * pestaña no tire el rato hecho: se guarda la marca de inicio, no un contador
 * que sube, y el tiempo transcurrido se calcula cuando se pinta.
 *
 * El módulo no guarda la sesión: al terminar solo rellena los minutos en el
 * formulario. Quien guarda es interfaz.js, y solo cuando se pulsa "Guardar
 * sesión". Así no hay dos caminos para escribir en localStorage.
 */

Diario.registrar('cronometro', (function () {
  'use strict';

  // Ya está cargado cuando este fichero se ejecuta: se puede coger arriba.
  const textos = Diario.obtener('textos');

  const CLAVE = 'diario-de-estudio.cronometro';

  /*
   * El estado en marcha. Se guarda aquí y en localStorage para que otro script
   * (y otro estado) no lo pisen por accidente, igual que idEnEdicion.
   */
  let estado = 'parado';
  let inicioMs = 0;
  let pausadoMs = 0;
  let pausaDesdeMs = 0;
  let reloj = null;

  const ahora = () => Date.now();

  /* ---------- Guardado y lectura del estado ---------- */

  /*
   * Se guarda solo mientras corre o está en pausa. Parado no se guarda nada:
   * así un cronómetro que se terminó hace un mes no revive al abrir la página.
   */
  function guardar() {
    if (estado === 'parado') {
      localStorage.removeItem(CLAVE);
      return;
    }
    localStorage.setItem(CLAVE, JSON.stringify({
      estado: estado,
      inicioMs: inicioMs,
      pausadoMs: pausadoMs,
      pausaDesdeMs: pausaDesdeMs,
    }));
  }

  /*
   * Lee el estado guardado. Si el dato está corrupto o no cuadra, se empieza
   * parado: es preferible perder un rato a mostrar un reloj que miente.
   */
  function cargar() {
    estado = 'parado';
    inicioMs = 0;
    pausadoMs = 0;
    pausaDesdeMs = 0;

    let dato = null;
    try {
      dato = JSON.parse(localStorage.getItem(CLAVE));
    } catch (error) {
      return false;
    }
    if (!dato || (dato.estado !== 'marcha' && dato.estado !== 'pausa')) return false;
    if (!Number.isFinite(dato.inicioMs) || !Number.isFinite(dato.pausadoMs)) return false;

    estado = dato.estado;
    inicioMs = dato.inicioMs;
    pausadoMs = dato.pausadoMs;
    pausaDesdeMs = dato.estado === 'pausa' ? dato.pausaDesdeMs : 0;
    if (!Number.isFinite(pausaDesdeMs)) return false;
    return true;
  }

  /* ---------- Cálculo ---------- */

  /*
   * Milisegundos que llevan descontadas las pausas.
   * El tramo en pausa se excluye mientras dura, y se suma a lo ya pausado al
   * reanudar. Es lo que hace falta para que pausar cinco minutos no regale
   * cinco minutos de estudio.
   */
  function transcurrido(fechaActual) {
    const momento = fechaActual === undefined ? ahora() : fechaActual;
    if (estado === 'parado') return pausadoMs;
    const enPausaAhora = estado === 'pausa' ? Math.max(0, momento - pausaDesdeMs) : 0;
    return Math.max(0, momento - inicioMs - pausadoMs - enPausaAhora);
  }

  /*
   * Minutos para la sesión. El mínimo de 1 es a propósito: un estudio de
   * veinte segundos también cuenta, y redondear a 0 dejaría un registro vacío
   * que parece un fallo de la app.
   */
  function minutosTranscurridos(fechaActual) {
    return Math.max(1, Math.round(transcurrido(fechaActual) / 60000));
  }

  /* "12:34", y con horas "1:02:03". Se tabla de dos digitos para que no baile. */
  function formatearTiempo(ms) {
    const total = Math.floor(Math.max(0, ms) / 1000);
    const dos = (n) => String(n).padStart(2, '0');
    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = total % 60;
    return horas > 0 ? `${dos(horas)}:${dos(minutos)}:${dos(segundos)}` : `${dos(minutos)}:${dos(segundos)}`;
  }

  /* ---------- Movimientos ---------- */

  function iniciar() {
    estado = 'marcha';
    inicioMs = ahora();
    pausadoMs = 0;
    pausaDesdeMs = 0;
    guardar();
    ponerEnMarcha();
    pintar();
  }

  function pausar() {
    if (estado !== 'marcha') return;
    estado = 'pausa';
    pausaDesdeMs = ahora();
    pararElReloj();
    guardar();
    pintar();
  }

  function reanudar() {
    if (estado !== 'pausa') return;
    // El tramo en pausa pasa a formar parte de lo pausado y deja de contar.
    pausadoMs += Math.max(0, ahora() - pausaDesdeMs);
    pausaDesdeMs = 0;
    estado = 'marcha';
    guardar();
    ponerEnMarcha();
    pintar();
  }

  /* Alterna pausa y reanudación: es el mismo botón con dos textos. */
  function alternar() {
    if (estado === 'marcha') pausar();
    else if (estado === 'pausa') reanudar();
  }

  /*
   * Terminar deja el tiempo a cero y pasa los minutos al formulario. No guarda
   * la sesión: eso lo hace el formulario cuando se pulse "Guardar sesión".
   */
  function terminar() {
    const minutos = minutosTranscurridos();
    estado = 'parado';
    inicioMs = 0;
    pausadoMs = 0;
    pausaDesdeMs = 0;
    pararElReloj();
    guardar();
    pintar();

    // interfaz.js se carga después: se pide dentro de la función.
    Diario.obtener('interfaz').prepararSesion(minutos);
  }

  function descartar() {
    if (estado === 'parado') return;
    if (!confirm(textos.t('cronometro.confirmarDescarte'))) return;
    estado = 'parado';
    inicioMs = 0;
    pausadoMs = 0;
    pausaDesdeMs = 0;
    pararElReloj();
    guardar();
    pintar();
  }

  /* ---------- El reloj que refresca la pantalla ---------- */

  function ponerEnMarcha() {
    pararElReloj();
    // Cada segundo solo para repintar el texto: el tiempo real se calcula al
    // pintar, así que un segundo de retraso no acumula error.
    reloj = setInterval(pintar, 1000);
  }

  function pararElReloj() {
    if (reloj === null) return;
    clearInterval(reloj);
    reloj = null;
  }

  /* ---------- Pintado ---------- */

/*
   * El aviso a lectores de pantalla solo se toca cuando cambia el estado, nunca
   * en cada tick. Se compara la descripción y no la frase entera porque la
   * frase lleva los segundos, y entonces cambiaría en cada tick igualmente.
   * El tiempo que se anuncia es el del momento del cambio.
   */
let ultimaDescripcion = null;
  function actualizarAnuncio(descripcion, tiempo) {
    const anuncio = document.getElementById('cronometro-anuncio');
    if (!anuncio) return;
    if (descripcion === ultimaDescripcion) return;
    ultimaDescripcion = descripcion;
    anuncio.textContent = estado === 'parado' ? '' : `${descripcion} · ${tiempo}`;
  }

  function pintar() {
    const pantalla = document.getElementById('cronometro-tiempo');
    const estadoTexto = document.getElementById('cronometro-estado');
    if (!pantalla || !estadoTexto) return;

const tiempo = formatearTiempo(transcurrido());
    pantalla.textContent = tiempo;
    const descripcion = textos.t(
      estado === 'marcha'
        ? 'cronometro.enMarcha'
        : estado === 'pausa'
          ? 'cronometro.enPausa'
          : 'cronometro.listo'
    );
    estadoTexto.textContent = descripcion;
    actualizarAnuncio(descripcion, tiempo);

    boton('cronometro-iniciar').hidden = estado !== 'parado';
    boton('cronometro-alternar').hidden = estado === 'parado';
    boton('cronometro-alternar').textContent = textos.t(
      estado === 'pausa' ? 'cronometro.reanudar' : 'cronometro.pausar'
    );
    boton('cronometro-terminar').hidden = estado === 'parado';
    boton('cronometro-descartar').hidden = estado === 'parado';

    // El título del navegador lleva el tiempo: con la pestaña en segundo plano
    // es lo único que se ve.
    document.title =
      estado === 'parado' ? textos.t('app.nombre') : `${tiempo} · ${textos.t('app.nombre')}`;
  }

  function boton(id) {
    return document.getElementById(id);
  }

  /* ---------- Arranque ---------- */

  function arrancar() {
    const habiaEstado = cargar();

    boton('cronometro-iniciar').addEventListener('click', iniciar);
    boton('cronometro-alternar').addEventListener('click', alternar);
    boton('cronometro-terminar').addEventListener('click', terminar);
    boton('cronometro-descartar').addEventListener('click', descartar);

    /*
     * Otra pestaña puede estar corriendo el mismo cronómetro y moverlo. Si
     * cambia la clave, se adopta su estado: si no, las dos pestañas seguirían
     * con relojes distintos a la vez.
     */
    window.addEventListener('storage', (evento) => {
      if (evento.key !== CLAVE) return;
      if (cargar()) {
        if (estado === 'marcha') ponerEnMarcha();
        else pararElReloj();
      } else {
        pararElReloj();
      }
      pintar();
    });

    pintar();
    // Si estaba corriendo al cerrar la página, sigue corriendo: es la gracia de
    // guardar la marca de inicio en vez de un contador.
    if (habiaEstado && estado === 'marcha') ponerEnMarcha();
  }

  return {
    arrancar: arrancar,
    iniciar: iniciar,
    pausar: pausar,
    reanudar: reanudar,
    alternar: alternar,
    terminar: terminar,
    descartar: descartar,
    pintar: pintar,
    transcurrido: transcurrido,
    minutosTranscurridos: minutosTranscurridos,
    formatearTiempo: formatearTiempo,
    cargar: cargar,
    guardar: guardar,
    estadoActual: () => estado,
    CLAVE: CLAVE,
  };
})());