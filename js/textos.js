/*
 * textos.js — todo lo que se escribe en pantalla.
 *
 * Ahora mismo solo hay el formato de fechas y de números, que es lo único
 * que el programa escribe por su cuenta. En la fase de idiomas crecerá aquí
 * el diccionario con las tres lenguas: es el fichero que más se toca cuando
 * se retoca una frase, por eso vive solo.
 */

Diario.registrar('textos', (function () {
  'use strict';

  /* "jueves, 1 de octubre de 2026". El T00:00:00 es a propósito: sin él se interpretaría como UTC. */
  function fechaLegible(clave) {
    return new Date(`${clave}T00:00:00`).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /* "1 día" o "N días": el singular y el plural en un único sitio. */
  function formatearDias(numero) {
    return `${numero} ${numero === 1 ? 'día' : 'días'}`;
  }

  return {
    fechaLegible: fechaLegible,
    formatearDias: formatearDias,
  };
})());