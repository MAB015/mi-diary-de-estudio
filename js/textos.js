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
      'app.nombre': 'Ascua',
      'app.subtitulo': 'Apunta tus sesiones y mantén viva la racha.',
      'app.saltar': 'Saltar al contenido',

      'progreso.titulo': 'Tu progreso',
      'racha.etiqueta': 'Racha actual',
      'racha.mejor': 'Mejor racha: {dias}',
      'racha.dias': '{n} día',
      'racha.dias.otros': '{n} días',

      'meta.titulo': 'Meta diaria',
      'meta.etiqueta': 'Minutos al día',
      'meta.error': 'La meta debe ser un número entero mayor que 0.',
      'meta.texto': '{minutos} / {meta} min',
      'meta.cumplida': '¡Meta conseguida!',

      'semana.titulo': 'Esta semana',

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

      'enfoque.cta': 'Empezar a estudiar',
      'enfoque.titulo': 'Empezar a estudiar',
      'enfoque.temaEtiqueta': 'Qué vas a estudiar',
      'enfoque.temaEjemplo': 'Ej. Arrays y LinkedList',
      'enfoque.temaError': 'Escribe qué vas a estudiar.',
      'enfoque.objetivoEtiqueta': 'Objetivo en minutos',
      'enfoque.objetivoAyuda':
        'Es un objetivo, no un límite: puedes seguir estudiando cuando llegues.',
      'enfoque.objetivoError': 'El objetivo debe ser un número entero entre 1 y 480.',
      'enfoque.objetivoCumplido': '¡Objetivo cumplido! Puedes seguir o terminar.',
      'enfoque.pantallaCompleta': 'Intentar pantalla completa',
      'enfoque.pantallaNoDisponible':
        'Este navegador no deja usar la pantalla completa; el modo funciona igual.',
      'enfoque.empezar': 'Empezar',
      'enfoque.cancelar': 'Cancelar',
      'enfoque.sesion': 'Sesión de enfoque',
      'enfoque.objetivoDe': 'Objetivo: {minutos} min',
      'enfoque.pausar': 'Pausar',
      'enfoque.reanudar': 'Reanudar',
      'enfoque.terminar': 'Terminar',
      'enfoque.salir': 'Salir',
      'enfoque.anuncioInicio': 'Sesión de {tema} iniciada. Objetivo: {minutos} minutos.',
      'enfoque.anuncioPausa': 'Sesión en pausa.',
      'enfoque.confirmarSalir': '¿Salir de la sesión? El tiempo de hoy no se guardará.',

      'panel.titulo': 'Estadísticas',
      'panel.periodo': 'Periodo',
      'panel.ultimos7': '7 días',
      'panel.ultimos30': '30 días',
      'panel.todo': 'Todo',
      'panel.totalMinutos': 'Minutos',
      'panel.mediaDiaria': 'Media diaria',
      'panel.diasConSesion': 'Días con sesión',
      'panel.numSesiones': 'Sesiones',
'panel.minutosPorDia': 'Minutos por día',
    'panel.ayudaGrafico': 'Pasa el ratón por una barra para ver el día.',
    'panel.ultimos30Nota': 'El gráfico muestra siempre los últimos 30 días.',
      'panel.reparto': 'Reparto del tiempo',
      'panel.sinDatos': 'Todavía no hay sesiones en este periodo.',

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
      'ajustes.movimientoLeyenda': 'Movimiento',
      'ajustes.movimientoSistema': 'Sistema',
      'ajustes.movimientoReducido': 'Reducido',
      'ajustes.sonidoLeyenda': 'Sonido',
      'ajustes.sonidoActivar': 'Activar pitidos',
    },

    en: {
      'app.nombre': 'Ascua',
      'app.subtitulo': 'Log your sessions and keep the streak alive.',
      'app.saltar': 'Skip to content',

      'progreso.titulo': 'Your progress',
      'racha.etiqueta': 'Current streak',
      'racha.mejor': 'Best streak: {dias}',
      'racha.dias': '{n} day',
      'racha.dias.otros': '{n} days',

      'meta.titulo': 'Daily goal',
      'meta.etiqueta': 'Minutes per day',
      'meta.error': 'The goal must be a whole number greater than 0.',
      'meta.texto': '{minutos} / {meta} min',
      'meta.cumplida': 'Goal reached!',

      'semana.titulo': 'This week',

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

      'enfoque.cta': 'Start studying',
      'enfoque.titulo': 'Start studying',
      'enfoque.temaEtiqueta': 'What are you going to study?',
      'enfoque.temaEjemplo': 'e.g. Arrays and LinkedList',
      'enfoque.temaError': 'Write down what you are going to study.',
      'enfoque.objetivoEtiqueta': 'Goal in minutes',
      'enfoque.objetivoAyuda': 'It is a goal, not a limit: you can keep going when you get there.',
      'enfoque.objetivoError': 'The goal must be a whole number between 1 and 480.',
      'enfoque.objetivoCumplido': 'Goal reached! You can keep going or finish.',
      'enfoque.pantallaCompleta': 'Try full screen',
      'enfoque.pantallaNoDisponible':
        'This browser will not go full screen; the mode works the same.',
      'enfoque.empezar': 'Start',
      'enfoque.cancelar': 'Cancel',
      'enfoque.sesion': 'Focus session',
      'enfoque.objetivoDe': 'Goal: {minutos} min',
      'enfoque.pausar': 'Pause',
      'enfoque.reanudar': 'Resume',
      'enfoque.terminar': 'Finish',
      'enfoque.salir': 'Leave',
      'enfoque.anuncioInicio': 'Session for {tema} started. Goal: {minutos} minutes.',
      'enfoque.anuncioPausa': 'Session paused.',
      'enfoque.confirmarSalir': 'Leave the session? Today’s time will not be saved.',

      'panel.titulo': 'Statistics',
      'panel.periodo': 'Period',
      'panel.ultimos7': '7 days',
      'panel.ultimos30': '30 days',
      'panel.todo': 'All',
      'panel.totalMinutos': 'Minutes',
      'panel.mediaDiaria': 'Daily average',
      'panel.diasConSesion': 'Days studied',
      'panel.numSesiones': 'Sessions',
'panel.minutosPorDia': 'Minutes per day',
    'panel.ayudaGrafico': 'Hover over a bar to see the day.',
    'panel.ultimos30Nota': 'The chart always shows the last 30 days.',
      'panel.reparto': 'Where the time went',
      'panel.sinDatos': 'No sessions in this period yet.',

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
      'ajustes.movimientoLeyenda': 'Motion',
      'ajustes.movimientoSistema': 'System',
      'ajustes.movimientoReducido': 'Reduced',
      'ajustes.sonidoLeyenda': 'Sound',
      'ajustes.sonidoActivar': 'Enable beeps',
    },

    fr: {
      'app.nombre': "Ascua",
      'app.subtitulo': 'Notez vos sessions et gardez votre série.',
      'app.saltar': 'Aller au contenu',

      'progreso.titulo': 'Votre progression',
      'racha.etiqueta': 'Série actuelle',
      'racha.mejor': 'Meilleure série : {dias}',
      'racha.dias': '{n} jour',
      'racha.dias.otros': '{n} jours',

      'meta.titulo': 'Objectif quotidien',
      'meta.etiqueta': 'Minutes par jour',
      'meta.error': "L'objectif doit être un nombre entier supérieur à 0.",
      'meta.texto': '{minutos} / {meta} min',
      'meta.cumplida': 'Objectif atteint !',

      'semana.titulo': 'Cette semaine',

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

      'enfoque.cta': 'Commencer à étudier',
      'enfoque.titulo': 'Commencer à étudier',
      'enfoque.temaEtiqueta': 'Qu’allez-vous étudier ?',
      'enfoque.temaEjemplo': 'ex. Tableaux et listes chaînées',
      'enfoque.temaError': 'Indiquez ce que vous allez étudier.',
      'enfoque.objetivoEtiqueta': 'Objectif en minutes',
      'enfoque.objetivoAyuda':
        'C’est un objectif, pas une limite : vous pouvez continuer une fois arrivé.',
      'enfoque.objetivoError': 'L’objectif doit être un nombre entier entre 1 et 480.',
      'enfoque.objetivoCumplido': 'Objectif atteint ! Vous pouvez continuer ou terminer.',
      'enfoque.pantallaCompleta': 'Tenter le plein écran',
      'enfoque.pantallaNoDisponible':
        'Ce navigateur ne permet pas le plein écran ; le mode fonctionne pareil.',
      'enfoque.empezar': 'Commencer',
      'enfoque.cancelar': 'Annuler',
      'enfoque.sesion': 'Session de concentration',
      'enfoque.objetivoDe': 'Objectif : {minutos} min',
      'enfoque.pausar': 'Pause',
      'enfoque.reanudar': 'Reprendre',
      'enfoque.terminar': 'Terminer',
      'enfoque.salir': 'Quitter',
      'enfoque.anuncioInicio': 'Session « {tema} » démarrée. Objectif : {minutos} minutes.',
      'enfoque.anuncioPausa': 'Session en pause.',
      'enfoque.confirmarSalir': 'Quitter la session ? Le temps d’aujourd’hui ne sera pas enregistré.',

      'panel.titulo': 'Statistiques',
      'panel.periodo': 'Période',
      'panel.ultimos7': '7 jours',
      'panel.ultimos30': '30 jours',
      'panel.todo': 'Tout',
      'panel.totalMinutos': 'Minutes',
      'panel.mediaDiaria': 'Moyenne par jour',
      'panel.diasConSesion': 'Jours étudiés',
      'panel.numSesiones': 'Sessions',
'panel.minutosPorDia': 'Minutes par jour',
    'panel.ayudaGrafico': 'Passez la souris sur une barre pour voir le jour.',
    'panel.ultimos30Nota': 'Le graphique montre toujours les 30 derniers jours.',
      'panel.reparto': 'Répartition du temps',
      'panel.sinDatos': 'Aucune session sur cette période pour l’instant.',

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
      'ajustes.movimientoLeyenda': 'Mouvement',
      'ajustes.movimientoSistema': 'Système',
      'ajustes.movimientoReducido': 'Réduit',
      'ajustes.sonidoLeyenda': 'Son',
      'ajustes.sonidoActivar': 'Activer les bips',
    },
  };

  /*
   * El idioma que hay puesto ahora mismo. Se guarda aparte de la preferencia
   * guardada para no releer localStorage en cada texto que se pinta.
   */
  let idiomaActual = null;

  /* Quien pinte texto dinámico (interfaz.js) se apunta aquí para repintar al cambiar. */
  /*
   * Son varios los que pintan texto que depende del idioma (la app, el
   * cronometro, el modo enfoque), asi que la lista es una lista. Con un solo
   * hueco, el modulo que se apuntara el ultimo pisaba a los otros dos y la app
   * se quedaba en el idioma anterior al cambiarlo con la sesion abierta.
   */
  const alCambiarIdioma = [];

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
    for (const avisar of alCambiarIdioma) avisar();
    return elegido;
  }

  /* Desmarca los otros a mano por el mismo motivo que en el selector de tema. */
  function marcarEnElSelector(valor) {
    for (const idioma of IDIOMAS) {
      const radio = document.getElementById(`cabecera-idioma-${idioma}`);
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

  /*
   * La inicial del día de la semana, para las etiquetas del gráfico.
   * `weekday: 'short'` + corte a un carácter: en español sale "mar." y en
   * francés "mar.", pero "mié." y "mar." se pisan si no se acorta, y con
   * 30 días muchas iniciales a la vez ya son ruido.
   */
  function inicialDia(clave) {
    const corto = new Date(`${clave}T00:00:00`).toLocaleDateString(LOCALES[idiomaActual || POR_DEFECTO], {
      weekday: 'short',
    });
    return corto.slice(0, 1).toLocaleUpperCase(LOCALES[idiomaActual || POR_DEFECTO]);
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
      const radio = document.getElementById(`cabecera-idioma-${idioma}`);
      if (radio) radio.addEventListener('change', () => cambiarIdioma(idioma));
    }
  }

  return {
    arrancar: arrancar,
    alCambiarIdioma: (fn) => {
      alCambiarIdioma.push(fn);
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
    inicialDia: inicialDia,
    traducirPagina: traducirPagina,
    // Solo para las pruebas: el diccionario entero y las listas de apoyo.
    DICCIONARIO: DICCIONARIO,
    IDIOMAS: IDIOMAS,
    CLAVE_IDIOMA: CLAVE_IDIOMA,
  };
})());