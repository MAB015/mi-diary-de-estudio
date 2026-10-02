/*
 * textos.js — todo lo que se escribe en pantalla, en los tres idiomas.
 *
 * Aquí viven el diccionario y las reglas de plural. El resto del programa no
 * escribe frases: pide una clave con t('sesiones.editar') y deja que este módulo
 * la traduzca. Así el idioma se cambia desde un solo sitio y no hay que buscar
 * cadenas sueltas por el HTML.
 *
 * Reparto de trabajo: no pinta nada, solo devuelve texto. Quien lo pinta
 * (interfaz.js) se avisa con alCambiarIdioma() y vuelve a pintar lo suyo.
 */

Diario.registrar('textos', (function () {
  'use strict';

  const CLAVE_IDIOMA = 'diario-de-estudio.idioma';
  const IDIOMAS = ['es', 'en', 'fr'];
  const POR_DEFECTO = 'es';

  /*
   * Cada idioma con su configuración regional. No es lo mismo "en" que "en-US":
   * la fecha y el separador de miles cambian, y con ellos el texto que sale.
   */
  const LOCALES = { es: 'es-ES', en: 'en-GB', fr: 'fr-FR' };

  /*
   * Cuándo se usa la forma singular. En inglés y español solo con 1, pero en
   * francés el 0 también va en singular ("0 jour"), así que la regla no puede
   * ser un "n === 1" escrito en todas partes.
   */
  const USA_SINGULAR = {
    es: (n) => n === 1,
    en: (n) => n === 1,
    fr: (n) => n < 2,
  };

  /*
   * El diccionario. Tres idiomas con las mismas claves: si falta una, la prueba
   * de integridad de claves (ver test-diario) lo avisa. Escribir primero en
   * español y luego traducir evita que se pierda texto por el camino.
   */
  const DICCIONARIO = {
    es: {
      'app.nombre': 'Diario de Estudio',
      'app.subtitulo': 'Apunta tus sesiones y mantén viva la racha.',

      'racha.etiqueta': 'Racha actual',
      'racha.mejor': 'Mejor racha: {dias}',
      'racha.dias': '{n} día',
      'racha.dias.otros': '{n} días',

      'meta.titulo': 'Meta diaria',
      'meta.etiqueta': 'Minutos al día',
      'meta.error': 'La meta debe ser un número entero mayor que 0.',
      'meta.texto': '{minutos} / {meta} min',
      'meta.cumplida': '¡Meta conseguida!',

      'cronometro.titulo': 'Cronómetro',
      'cronometro.enMarcha': 'Estudiando',
      'cronometro.enPausa': 'En pausa',
      'cronometro.listo': 'Listo para empezar',
      'cronometro.iniciar': 'Iniciar',
      'cronometro.pausar': 'Pausar',
      'cronometro.reanudar': 'Reanudar',
      'cronometro.terminar': 'Terminar',
      'cronometro.descartar': 'Descartar',
      'cronometro.ayuda':
        'Al terminar se rellenan los minutos en el formulario: tú solo tienes que escribir el tema.',
      'cronometro.confirmarDescarte': '¿Descartar el tiempo acumulado?',

      'calendario.titulo': 'Últimos 28 días',
      'calendario.sinSesion': 'Sin sesión',
      'calendario.hasta': 'Hasta {meta} min',
      'calendario.masDe': 'Más de {meta} min',
      'calendario.sinSesiones': '{fecha} · sin sesiones',

      'formulario.titulo': 'Nueva sesión',
      'formulario.fecha': 'Fecha',
      'formulario.tema': 'Tema',
      'formulario.minutos': 'Minutos',
      'formulario.ejemploTema': 'Ej. Arrays y LinkedList',
      'formulario.ejemploMinutos': 'Ej. 45',
      'formulario.guardar': 'Guardar sesión',
      'formulario.guardarCambios': 'Guardar cambios',
      'formulario.cancelar': 'Cancelar',

      'sesiones.titulo': 'Sesiones',
      'sesiones.vacio': 'Todavía no has registrado ninguna sesión.',
      'sesiones.editar': 'Editar',
      'sesiones.eliminar': 'Eliminar',
      'sesiones.minutos': '{minutos} min',
      'sesiones.confirmar': '¿Eliminar la sesión de «{tema}»?',

      'error.temaVacio': 'Escribe el tema que estudiaste.',
      'error.minutosVacio': 'Indica cuántos minutos estudiaste.',
      'error.minutosNumero': 'Los minutos deben ser un número.',
      'error.minutosPositivos': 'Los minutos deben ser mayores que 0.',
      'error.fechaVacia': 'Indica la fecha de la sesión.',

      'ajustes.temaLeyenda': 'Tema',
      'ajustes.temaSistema': 'Sistema',
      'ajustes.temaClaro': 'Claro',
      'ajustes.temaOscuro': 'Oscuro',
      'ajustes.idiomaLeyenda': 'Idioma',
      'ajustes.idiomaEs': 'Español',
      'ajustes.idiomaEn': 'English',
      'ajustes.idiomaFr': 'Français',
    },

    en: {
      'app.nombre': 'Study Diary',
      'app.subtitulo': 'Log your sessions and keep the streak alive.',

      'racha.etiqueta': 'Current streak',
      'racha.mejor': 'Best streak: {dias}',
      'racha.dias': '{n} day',
      'racha.dias.otros': '{n} days',

      'meta.titulo': 'Daily goal',
      'meta.etiqueta': 'Minutes per day',
      'meta.error': 'The goal must be a whole number greater than 0.',
      'meta.texto': '{minutos} / {meta} min',
      'meta.cumplida': 'Goal reached!',

      'cronometro.titulo': 'Timer',
      'cronometro.enMarcha': 'Studying',
      'cronometro.enPausa': 'Paused',
      'cronometro.listo': 'Ready to start',
      'cronometro.iniciar': 'Start',
      'cronometro.pausar': 'Pause',
      'cronometro.reanudar': 'Resume',
      'cronometro.terminar': 'Finish',
      'cronometro.descartar': 'Discard',
      'cronometro.ayuda': 'When you finish, the minutes go into the form: you only write the topic.',
      'cronometro.confirmarDescarte': 'Discard the accumulated time?',

      'calendario.titulo': 'Last 28 days',
      'calendario.sinSesion': 'No session',
      'calendario.hasta': 'Up to {meta} min',
      'calendario.masDe': 'More than {meta} min',
      'calendario.sinSesiones': '{fecha} · no sessions',

      'formulario.titulo': 'New session',
      'formulario.fecha': 'Date',
      'formulario.tema': 'Topic',
      'formulario.minutos': 'Minutes',
      'formulario.ejemploTema': 'e.g. Arrays and LinkedList',
      'formulario.ejemploMinutos': 'e.g. 45',
      'formulario.guardar': 'Save session',
      'formulario.guardarCambios': 'Save changes',
      'formulario.cancelar': 'Cancel',

      'sesiones.titulo': 'Sessions',
      'sesiones.vacio': 'You have not logged a session yet.',
      'sesiones.editar': 'Edit',
      'sesiones.eliminar': 'Delete',
      'sesiones.minutos': '{minutos} min',
      'sesiones.confirmar': 'Delete the "{tema}" session?',

      'error.temaVacio': 'Write down what you studied.',
      'error.minutosVacio': 'Enter how many minutes you studied.',
      'error.minutosNumero': 'Minutes must be a number.',
      'error.minutosPositivos': 'Minutes must be greater than 0.',
      'error.fechaVacia': 'Enter the date of the session.',

      'ajustes.temaLeyenda': 'Theme',
      'ajustes.temaSistema': 'System',
      'ajustes.temaClaro': 'Light',
      'ajustes.temaOscuro': 'Dark',
      'ajustes.idiomaLeyenda': 'Language',
      'ajustes.idiomaEs': 'Español',
      'ajustes.idiomaEn': 'English',
      'ajustes.idiomaFr': 'Français',
    },

    fr: {
      'app.nombre': "Journal d'étude",
      'app.subtitulo': 'Notez vos sessions et gardez votre série.',

      'racha.etiqueta': 'Série actuelle',
      'racha.mejor': 'Meilleure série : {dias}',
      'racha.dias': '{n} jour',
      'racha.dias.otros': '{n} jours',

      'meta.titulo': 'Objectif quotidien',
      'meta.etiqueta': 'Minutes par jour',
      'meta.error': "L'objectif doit être un nombre entier supérieur à 0.",
      'meta.texto': '{minutos} / {meta} min',
      'meta.cumplida': 'Objectif atteint !',

      'cronometro.titulo': 'Minuteur',
      'cronometro.enMarcha': 'En étude',
      'cronometro.enPausa': 'En pause',
      'cronometro.listo': 'Prêt à commencer',
      'cronometro.iniciar': 'Démarrer',
      'cronometro.pausar': 'Pause',
      'cronometro.reanudar': 'Reprendre',
      'cronometro.terminar': 'Terminer',
      'cronometro.descartar': 'Abandonner',
      'cronometro.ayuda':
        'En terminant, les minutes vont dans le formulaire : il ne reste qu’à écrire le thème.',
      'cronometro.confirmarDescarte': 'Abandonner le temps accumulé ?',

      'calendario.titulo': '28 derniers jours',
      'calendario.sinSesion': 'Aucune session',
      'calendario.hasta': "Jusqu'à {meta} min",
      'calendario.masDe': 'Plus de {meta} min',
      'calendario.sinSesiones': '{fecha} · aucune session',

      'formulario.titulo': 'Nouvelle session',
      'formulario.fecha': 'Date',
      'formulario.tema': 'Thème',
      'formulario.minutos': 'Minutes',
      'formulario.ejemploTema': 'ex. Tableaux et listes chaînées',
      'formulario.ejemploMinutos': 'ex. 45',
      'formulario.guardar': 'Enregistrer la session',
      'formulario.guardarCambios': 'Enregistrer les modifications',
      'formulario.cancelar': 'Annuler',

      'sesiones.titulo': 'Sessions',
      'sesiones.vacio': "Vous n'avez encore enregistré aucune session.",
      'sesiones.editar': 'Modifier',
      'sesiones.eliminar': 'Supprimer',
      'sesiones.minutos': '{minutos} min',
      'sesiones.confirmar': 'Supprimer la session « {tema} » ?',

      'error.temaVacio': 'Indiquez ce que vous avez étudié.',
      'error.minutosVacio': 'Indiquez le nombre de minutes étudiées.',
      'error.minutosNumero': 'Les minutes doivent être un nombre.',
      'error.minutosPositivos': 'Les minutes doivent être supérieures à 0.',
      'error.fechaVacia': 'Indiquez la date de la session.',

      'ajustes.temaLeyenda': 'Thème',
      'ajustes.temaSistema': 'Système',
      'ajustes.temaClaro': 'Clair',
      'ajustes.temaOscuro': 'Sombre',
      'ajustes.idiomaLeyenda': 'Langue',
      'ajustes.idiomaEs': 'Español',
      'ajustes.idiomaEn': 'English',
      'ajustes.idiomaFr': 'Français',
    },
  };

  /*
   * El idioma que hay puesto ahora mismo. Se guarda aparte de la preferencia
   * guardada para no releer localStorage en cada texto que se pinta.
   */
  let idiomaActual = null;

  /* Quien pinte texto dinámico (interfaz.js) se apunta aquí para repintar al cambiar. */
  let avisarAlCambiar = function () {};

  /* ---------- Lectura y elección de idioma ---------- */

  /* Sin preferencia guardada se sigue al idioma del navegador; si no es de los tres, español. */
  function idiomaDelNavegador() {
    const lengua = String((navigator && navigator.language) || POR_DEFECTO).slice(0, 2).toLowerCase();
    return IDIOMAS.indexOf(lengua) === -1 ? POR_DEFECTO : lengua;
  }

  function preferenciaGuardada() {
    let guardada = null;
    try {
      guardada = localStorage.getItem(CLAVE_IDIOMA);
    } catch (error) {
      guardada = null;
    }
    return IDIOMAS.indexOf(guardada) === -1 ? idiomaDelNavegador() : guardada;
  }

  /*
   * Guarda el idioma y lo aplica. Se guarda el idioma elegido y no el detectado:
   * si alguien elige inglés en un móvil en español, se le respeta la elección.
   */
  function cambiarIdioma(valor) {
    const elegido = IDIOMAS.indexOf(valor) === -1 ? POR_DEFECTO : valor;
    try {
      localStorage.setItem(CLAVE_IDIOMA, elegido);
    } catch (error) {
      // Si no se puede guardar (modo privado), el idioma igualmente cambia en esta carga.
    }
    idiomaActual = elegido;
    marcarEnElSelector(elegido);
    traducirPagina();
    avisarAlCambiar();
    return elegido;
  }

  /* Desmarca los otros a mano por el mismo motivo que en el selector de tema. */
  function marcarEnElSelector(valor) {
    for (const idioma of IDIOMAS) {
      const radio = document.getElementById(`idioma-${idioma}`);
      if (radio) radio.checked = idioma === valor;
    }
  }

  /* ---------- Traducir ---------- */

  /* Sustituye los {marcadores} por sus valores. Los que no llegan se quedan como están. */
  function reemplazar(texto, valores) {
    if (!valores) return texto;
    return texto.replace(/\{(\w+)\}/g, (marca, nombre) =>
      valores[nombre] === undefined ? marca : String(valores[nombre])
    );
  }

  /*
   * Devuelve el texto de una clave en el idioma puesto. Si la clave no existe,
   * cae en el español y, si tampoco, devuelve la propia clave: que se lea
   * "sesiones.editar" en pantalla avisa de un fallo mejor que un texto vacío.
   */
  function t(clave, valores) {
    const idioma = idiomaActual || POR_DEFECTO;
    const propio = DICCIONARIO[idioma][clave];
    const texto = propio !== undefined ? propio : DICCIONARIO[POR_DEFECTO][clave];
    return reemplazar(texto === undefined ? clave : texto, valores);
  }

  /* Igual que t(), pero elige entre la forma singular y la plural según el idioma. */
  function enPlural(clave, numero, valores) {
    const valoresJuntos = Object.assign({ n: formatearNumero(numero) }, valores);
    const idioma = idiomaActual || POR_DEFECTO;
    const enSingular = USA_SINGULAR[idioma](numero);
    return t(enSingular ? clave : `${clave}.otros`, valoresJuntos);
  }

  /*
   * Números con el separador del idioma: 1234 sale "1.234" en español y "1,234"
   * en inglés. Sin esto el panel mixuraría formatos.
   */
  function formatearNumero(numero) {
    return new Intl.NumberFormat(LOCALES[idiomaActual || POR_DEFECTO]).format(numero);
  }

  /* "1 día" o "N días", con la regla de plural del idioma. */
  function formatearDias(numero) {
    return enPlural('racha.dias', numero);
  }

  /* "jueves, 1 de octubre de 2026". El T00:00:00 es a propósito: sin él se interpretaría como UTC. */
  function fechaLegible(clave) {
    return new Date(`${clave}T00:00:00`).toLocaleDateString(LOCALES[idiomaActual || POR_DEFECTO], {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /* ---------- Pintar el texto fijo de la página ---------- */

  /*
   * Traduce lo que hay escrito en el HTML. Los atributos se tratan aparte del
   * texto porque van en otro sitio: el placeholder, el title y el aria-label.
   */
  function traducirPagina() {
    document.documentElement.lang = idiomaActual || POR_DEFECTO;
    document.title = t('app.nombre');

    for (const nodo of nodosCon('data-i18n')) {
      nodo.textContent = t(nodo.getAttribute('data-i18n'));
    }
    for (const nodo of nodosCon('data-i18n-placeholder')) {
      nodo.setAttribute('placeholder', t(nodo.getAttribute('data-i18n-placeholder')));
    }
    for (const nodo of nodosCon('data-i18n-titulo')) {
      nodo.setAttribute('title', t(nodo.getAttribute('data-i18n-titulo')));
    }
    for (const nodo of nodosCon('data-i18n-aria')) {
      nodo.setAttribute('aria-label', t(nodo.getAttribute('data-i18n-aria')));
    }
  }

  function nodosCon(atributo) {
    if (!document.querySelectorAll) return [];
    return Array.from(document.querySelectorAll(`[${atributo}]`));
  }

  /* ---------- Arranque ---------- */

  /* Se llama desde interfaz.js, antes del primer pintado: si no, se vería un instante en español. */
  function arrancar() {
    idiomaActual = preferenciaGuardada();
    marcarEnElSelector(idiomaActual);
    traducirPagina();

    for (const idioma of IDIOMAS) {
      const radio = document.getElementById(`idioma-${idioma}`);
      if (radio) radio.addEventListener('change', () => cambiarIdioma(idioma));
    }
  }

  return {
    arrancar: arrancar,
    alCambiarIdioma: (fn) => {
      avisarAlCambiar = fn;
    },
    cambiarIdioma: cambiarIdioma,
    preferenciaGuardada: preferenciaGuardada,
    idiomaActual: () => idiomaActual,
    idiomaDelNavegador: idiomaDelNavegador,
    t: t,
    enPlural: enPlural,
    formatearNumero: formatearNumero,
    formatearDias: formatearDias,
    fechaLegible: fechaLegible,
    traducirPagina: traducirPagina,
    // Solo para las pruebas: el diccionario entero y las listas de apoyo.
    DICCIONARIO: DICCIONARIO,
    IDIOMAS: IDIOMAS,
    CLAVE_IDIOMA: CLAVE_IDIOMA,
  };
})());