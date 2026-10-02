/*
 * sonido.js - seis tonos cortos generados con la Web Audio API.
 *
 * Decisiones que explican todo lo que hay aquí:
 *
 * 1. **Apagado por defecto.** Nadie quiere una app que suena sola. Se enciende
 *    con el interruptor de la pantalla y la preferencia se guarda en
 *    `diario-de-estudio.sonido`.
 * 2. **Los tonos se generan, no se cargan.** Con osciladores de la Web Audio no
 *    hay ficheros de audio ni carpeta `vendor/`: nada que se rompa al abrirlo
 *    con doble clic y nada binario en el repo. Además el tono es exactamente la
 *    misma frecuencia cada vez.
 * 3. **Son cortos y flojos.** Nada de tonos largos, agudos o que iteren: un
 *    pitido de aviso que se puede oír por el móvil en la calle.
 * 4. **Un sonido nunca rompe nada.** Todo va dentro de un `try`: si el navegador
 *    no tiene Web Audio (o no deja reproducir), se sigue sin sonido y la sesión
 *    se guarda igual.
 * 5. **Nada suena con la pestaña en segundo plano.** Un cronómetro sonando en
 *    una pestaña que no estás mirando es una molestia, no un aviso.
 */

Diario.registrar('sonido', (function () {
  'use strict';

  const CLAVE = 'diario-de-estudio.sonido';
  const VALORES = ['no', 'si'];

  /* Los seis tonos: nombre -> frecuencia en hercios y duración en segundos.
     Guardar usa un tono medio y corto; el error uno grave; el logro el más
     agudo y el más largo; el reloj uno neutro; la pausa uno bajo y el fin uno
     medio que baja un poco. Ninguno pasa de 0,25 s. */
  const TONOS = {
    guardado: [660, 0.12],
    error: [180, 0.18],
    logro: [880, 0.25],
    reloj: [520, 0.1],
    pausa: [300, 0.1],
    fin: [440, 0.2],
  };

  /* Volumen bajo a propósito: los tonos de interfaz se oyen por encima de lo
     demás, así que si suben molestan. */
  const VOLUMEN = 0.06;
  const ATAQUE = 0.01;

  /* El contexto se crea la primera vez que suena algo, no al cargar la página:
     un AudioContext sin gesto del usuario se queda en pausa y además consumes
     recursos aunque no suene nunca. */
  let contexto = null;
  let habilitado = false;

  /* ---------- Preferencia ---------- */

  function preferenciaGuardada() {
    const guardada = localStorage.getItem(CLAVE);
    return VALORES.indexOf(guardada) === -1 ? 'no' : guardada;
  }

  /*
   * Guarda la preferencia y la aplica al momento. Se guarda "si" o "no", no el
   * sonido que ha salido: el sonido no es un dato que se pueda calcular.
   */
  function elegir(valor) {
    const elegido = VALORES.indexOf(valor) === -1 ? 'no' : valor;
    localStorage.setItem(CLAVE, elegido);
    aplicar(elegido);
    marcarEnElSelector(elegido);
    return elegido;
  }

  function aplicar(valor) {
    habilitado = valor === 'si';
    if (!habilitado && contexto) {
      // Apagado con la pestaña abierta: el contexto se cierra para no gastar.
      if (contexto.close) contexto.close();
      contexto = null;
    }
  }

  function marcarEnElSelector(valor) {
    const interruptor = document.getElementById('sonido-activo');
    if (interruptor) interruptor.checked = valor === 'si';
  }

  function habilitadoActual() {
    return habilitado;
  }

  /* ---------- Reproducción ---------- */

  /* Safari y iPhone todavía usan el prefijo; si no hay ninguno, no hay sonido. */
  function crearContexto() {
    if (window.AudioContext) return new window.AudioContext();
    if (window.webkitAudioContext) return new window.webkitAudioContext();
    return null;
  }

  /*
   * Toca un tono por su nombre. Devuelve si ha sonado, que es lo que usan las
   * pruebas: así se comprueba la decisión (apagado, pestaña oculta, tono que no
   * existe) sin necesitar un altavoz.
   */
  function tocar(nombre) {
    if (!habilitado) return false;
    if (document.hidden) return false;
    const tono = TONOS[nombre];
    if (!tono) return false;

    try {
      if (!contexto) contexto = crearContexto();
      if (!contexto) return false;

      // El navegador deja el audio en pausa hasta que hay un gesto: sin este
      // `resume()` el primer sonido se pierde justo en el guardado de la
      // primera sesión, que es cuando más se nota.
      if (contexto.state === 'suspended' && contexto.resume) contexto.resume();

      const frecuencia = tono[0];
      const duracion = tono[1];
      const oscilador = contexto.createOscillator();
      const volumen = contexto.createGain();

      oscilador.type = 'sine';
      oscilador.frequency.value = frecuencia;

      // Rampa de entrada y salida: sin esto el tono empieza y acaba de golpe y
      // se oye un chasquido en vez de un pitido.
      volumen.gain.setValueAtTime(0, contexto.currentTime);
      volumen.gain.linearRampToValueAtTime(VOLUMEN, contexto.currentTime + ATAQUE);
      volumen.gain.linearRampToValueAtTime(0, contexto.currentTime + duracion);

      oscilador.connect(volumen);
      volumen.connect(contexto.destination);
      oscilador.start();
      oscilador.stop(contexto.currentTime + duracion);
      return true;
    } catch (error) {
      // Un navegador sin audio no es un fallo de la app: ni se rompe el
      // guardado ni se avisa de nada.
      return false;
    }
  }

  /* ---------- Arranque ---------- */

  function arrancar() {
    const guardada = preferenciaGuardada();
    aplicar(guardada);
    marcarEnElSelector(guardada);

    const interruptor = document.getElementById('sonido-activo');
    if (interruptor) interruptor.addEventListener('change', () => elegir(interruptor.checked ? 'si' : 'no'));
  }

  return {
    arrancar: arrancar,
    tocar: tocar,
    elegir: elegir,
    aplicar: aplicar,
    preferenciaGuardada: preferenciaGuardada,
    habilitadoActual: habilitadoActual,
    TONOS: TONOS,
  };
})());