/*
 * datos.js — todo lo que vive en localStorage y los cálculos que salen de ahí.
 *
 * No pinta nada: solo guarda, lee y cuenta. Aquí van las sesiones, la meta,
 * la racha y la mejor racha. Nada aquí depende del idioma ni del DOM.
 */

Diario.registrar('datos', (function () {
  'use strict';

  const claveDeFecha = Diario.fechas.claveDeFecha;
  const moverClave = Diario.fechas.moverClave;

  const CLAVE_ALMACEN = 'diario-de-estudio.sesiones';
  const CLAVE_META = 'diario-de-estudio.meta';
  const META_POR_DEFECTO = 30;
  const DIAS_CALENDARIO = 28;

  /* ---------- Guardado en localStorage ---------- */

  /* Lee las sesiones guardadas. Si el dato está corrupto, se empieza de cero en vez de romper la página. */
  function leerSesiones() {
    try {
      const guardado = localStorage.getItem(CLAVE_ALMACEN);
      if (!guardado) return [];
      const datos = JSON.parse(guardado);
      if (!Array.isArray(datos)) return [];
      return normalizar(datos);
    } catch (error) {
      return [];
    }
  }

  function escribirSesiones(sesiones) {
    localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(sesiones));
  }

  /*
   * Un id libre para una sesión nueva: uno más alto que todos los que ya hay.
   * Tiene que ser mayor que todos porque el id ordena las sesiones del mismo día.
   */
  function idLibre(sesiones) {
    return sesiones.reduce((maximo, sesion) => Math.max(maximo, sesion.id || 0), 0) + 1;
  }

  /*
   * Normaliza lo que viene de localStorage.
   * Hace falta porque los datos pueden venir de una versión antigua o editados a mano:
   * si una sesión no tuviera id no se podría editar ni ordenar, así que se le da uno.
   */
  function normalizar(datos) {
    let siguiente = 0;
    return datos.map((dato) => {
      const id = typeof dato.id === 'number' && dato.id > siguiente ? dato.id : siguiente + 1;
      siguiente = id;
      return {
        id,
        fecha: dato.fecha,
        tema: dato.tema,
        minutos: dato.minutos,
      };
    });
  }

  /* ---------- Meta diaria ---------- */

  /* Lee la meta guardada. Si no hay, o si está corrupta, se usa la de por defecto. */
  function leerMeta() {
    try {
      const guardado = localStorage.getItem(CLAVE_META);
      if (!guardado) return META_POR_DEFECTO;
      const numero = Number(JSON.parse(guardado));
      if (Number.isInteger(numero) && numero > 0) return numero;
      return META_POR_DEFECTO;
    } catch (error) {
      return META_POR_DEFECTO;
    }
  }

  function escribirMeta(minutos) {
    localStorage.setItem(CLAVE_META, JSON.stringify(minutos));
  }

  /* Suma los minutos de las sesiones de HOY, en hora local. Nada más cuenta. */
  function minutosDeHoy(sesiones) {
    const hoy = claveDeFecha(new Date());
    return sesiones.filter((sesion) => sesion.fecha === hoy).reduce((total, sesion) => total + sesion.minutos, 0);
  }

  /*
   * Minutos de la semana que termina hoy: de lunes a domingo, en hora local.
   * getDay() cuenta desde el domingo (0), por eso se desplaza un día para
   * empezar la semana en lunes, que es como se cuenta en español, inglés y
   * francés. La ventana se recorre con moverClave, así que cruza meses y
   * años sin código extra, y las fechas futuras no cuentan: igual que en la
   * racha, la mejor racha, la meta y el calendario.
   */
  function minutosDeSemana(sesiones) {
    const hoy = claveDeFecha(new Date());
    const diaDeLaSemana = (new Date().getDay() + 6) % 7;
    const lunes = moverClave(hoy, -diaDeLaSemana);
    return sesiones
      .filter((sesion) => sesion.fecha >= lunes && sesion.fecha <= hoy)
      .reduce((total, sesion) => total + sesion.minutos, 0);
  }

  /* ---------- Racha ---------- */

  /*
   * Días consecutivos con sesión que terminan hoy.
   * Si hoy todavía no hay sesión pero ayer sí, la racha sigue viva y se cuenta hasta ayer.
   */
  function calcularRacha(sesiones) {
    const diasConSesion = new Set(sesiones.map((sesion) => sesion.fecha));
    const hoy = claveDeFecha(new Date());

    let dia = hoy;
    if (!diasConSesion.has(dia)) {
      dia = moverClave(hoy, -1);
      if (!diasConSesion.has(dia)) return 0;
    }

    let cuenta = 0;
    while (diasConSesion.has(dia)) {
      cuenta += 1;
      dia = moverClave(dia, -1);
    }
    return cuenta;
  }

  /*
   * El récord: la racha más larga de toda la historia, sin mirar si sigue viva.
   * Se recalcula desde las sesiones cada vez que se abre la página, no se guarda,
   * para que no pueda quedarse desactualizado.
   */
  function calcularMejorRacha(sesiones) {
    const hoy = claveDeFecha(new Date());
    // Los días que todavía no llegan se descartan: si no, el récord sería mentira.
    // El Set evita que varias sesiones del mismo día cuenten como días distintos.
    const dias = [...new Set(sesiones.filter((sesion) => sesion.fecha <= hoy).map((sesion) => sesion.fecha))].sort();
    // sort() ordena bien porque "AAAA-MM-DD" tiene siempre los mismos caracteres.
    let mejor = 0;
    let cuenta = 0;
    let diaAnterior = '';
    for (const dia of dias) {
      cuenta = diaAnterior && dia === moverClave(diaAnterior, 1) ? cuenta + 1 : 1;
      if (cuenta > mejor) mejor = cuenta;
      diaAnterior = dia;
    }
    return mejor;
  }

  /* ---------- Agregados ---------- */

  /* Devuelve un Map con clave "AAAA-MM-DD" y los minutos sumados de ese día. */
  function minutosPorDia(sesiones) {
    const porDia = new Map();
    for (const sesion of sesiones) {
      porDia.set(sesion.fecha, (porDia.get(sesion.fecha) || 0) + sesion.minutos);
    }
    return porDia;
  }

  return {
    leerSesiones: leerSesiones,
    escribirSesiones: escribirSesiones,
    idLibre: idLibre,
    normalizar: normalizar,
    leerMeta: leerMeta,
    escribirMeta: escribirMeta,
    minutosDeHoy: minutosDeHoy,
    minutosDeSemana: minutosDeSemana,
    calcularRacha: calcularRacha,
    calcularMejorRacha: calcularMejorRacha,
    minutosPorDia: minutosPorDia,
    META_POR_DEFECTO: META_POR_DEFECTO,
    DIAS_CALENDARIO: DIAS_CALENDARIO,
  };
})());