/*
 * nucleo.js — el registro de módulos y las primitivas de fecha.
 *
 * Este es el PRIMER fichero que se carga: todos los demás dependen de él.
 *
 * OJO: nada de "import" ni de "type=module". Los módulos ES se cargan por CORS
 * y desde un archivo abierto con doble clic el navegador los bloquea.
 * Solo scripts clásicos, y siempre en el orden que pone index.html.
 */

var Diario = (function () {
  const modulos = {};

  /* Cada módulo se registra aquí al cargarse y expone su API en este objeto. */
  function registrar(nombre, modulo) {
    modulos[nombre] = modulo;
    return modulo;
  }

  /*
   * Pide el módulo de otro fichero. Se llama DENTRO de una función, nunca al
   * cargar el fichero, porque los módulos que se cargan después todavía no existen.
   * Si el orden de index.html está mal, el error dice exactamente cuál falta.
   */
  function obtener(nombre) {
    if (!modulos[nombre]) {
      throw new Error(
        'Falta el módulo "' + nombre + '". Revisa el orden de los <script> de index.html.'
      );
    }
    return modulos[nombre];
  }

  /* ---------- Fechas en hora local ---------- */
  /*
   * Viven aquí y no en "datos" porque no dependen del idioma y hacen falta
   * desde varios módulos a la vez. Están disponibles nada más cargar este fichero.
   */

  /* Rellena con ceros a la izquierda: 5 -> "05". */
  function rellenar(numero) {
    return String(numero).padStart(2, '0');
  }

  /* Convierte un Date local en el texto "AAAA-MM-DD" que usamos como identificador de día. */
  function claveDeFecha(fecha) {
    return `${fecha.getFullYear()}-${rellenar(fecha.getMonth() + 1)}-${rellenar(fecha.getDate())}`;
  }

  /*
   * Suma o resta días a una clave "AAAA-MM-DD".
   * El cálculo se hace en UTC a propósito: así el cambio de hora de verano
   * nunca hace que nos saltemos un día al contar la racha.
   * La clave de "hoy" sí sale de la hora local del usuario.
   */
  function moverClave(clave, dias) {
    const [anio, mes, dia] = clave.split('-').map(Number);
    const fecha = new Date(Date.UTC(anio, mes - 1, dia + dias));
    return `${fecha.getUTCFullYear()}-${rellenar(fecha.getUTCMonth() + 1)}-${rellenar(fecha.getUTCDate())}`;
  }

  return {
    registrar: registrar,
    obtener: obtener,
    fechas: {
      rellenar: rellenar,
      claveDeFecha: claveDeFecha,
      moverClave: moverClave,
    },
  };
})();