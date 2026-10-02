/*
 * panel.js — las estadísticas: cuatro números, un gráfico de barras y el reparto
 * del tiempo por tema.
 *
 * Tres reglas que explican todo lo que hay aquí:
 *
 * 1. El periodo se elige con el filtro y solo hay tres: 7 días, 30 días o todo.
 *    No hay fechas custom a propósito: es el filtro que se usa y el que se
 *    entiende, y uno con dos campos de fecha en móvil es una molestia.
 * 2. El filtro **no se guarda**: en memoria vale igual y es una decisión, no un
 *    dato. Guardarlo en localStorage añadiría una clave y una regla para algo
 *    que se repon solo.
 * 3. El gráfico no depende del color: cada barra lleva su número de minutos y
 *    las barras con más estudio se marcan aparte. El color solo ordena.
 */

Diario.registrar('panel', (function () {
  'use strict';

  const datos = Diario.obtener('datos');
  const textos = Diario.obtener('textos');
  const claveDeFecha = Diario.fechas.claveDeFecha;
  const moverClave = Diario.fechas.moverClave;

  /* Días que se muestran en el gráfico. 30 es el tope: con más, las barras
     dejan de ser legibles en 320 px y el nombre del día desaparece. */
  const DIAS_GRAFICO = 30;

  /* Geometría del SVG en unidades del viewBox (no en píxeles: el viewBox escala
     solo). */
  const ANCHO = 280;
  const ALTO = 108;
  const BASE = 86;
  const ALTO_MAXIMO = 64;

  /* El periodo elegido. Vive aquí y no en el DOM porque es estado de la app. */
  let diasPeriodo = 7;

  /* ---------- Datos ---------- */

  /* Las sesiones del periodo elegido, sin las futuras (que no son estudio). */
  function sesionesDelPeriodo(sesiones) {
    const hoy = claveDeFecha(new Date());
    if (diasPeriodo === 0) {
      return sesiones.filter((sesion) => sesion.fecha <= hoy);
    }
    const desde = moverClave(hoy, -(diasPeriodo - 1));
    return sesiones.filter((sesion) => sesion.fecha >= desde && sesion.fecha <= hoy);
  }

  /*
   * Los últimos `n` días con su minutero, incluidos los que no tienen sesión
   * (con 0). El gráfico necesita los huecos: sin ellos, una semana floja
   * parecería igual que una semana llena.
   */
  function minutero(n) {
    const hoy = claveDeFecha(new Date());
    const porDia = datos.minutosPorDia(sesionesDelPeriodo(datos.leerSesiones()));
    const dias = [];
    for (let posicion = n - 1; posicion >= 0; posicion--) {
      const clave = moverClave(hoy, -posicion);
      dias.push({ clave: clave, minutos: porDia.get(clave) || 0 });
    }
    return dias;
  }

  /*
   * Los números de arriba: total, media por día estudiado, días con sesión y
   * sesiones. Los días salen de las fechas únicas de las sesiones, no de las
   * barras: con el periodo "todo" el gráfico solo enseña 30 días y el KPI tiene
   * que contar la historia entera.
   */
  function resumen(sesiones) {
    const minutos = sesiones.reduce((suma, sesion) => suma + sesion.minutos, 0);
    const conSesion = new Set(sesiones.map((sesion) => sesion.fecha));
    return {
      minutos: minutos,
      media: conSesion.size === 0 ? 0 : Math.round(minutos / conSesion.size),
      dias: conSesion.size,
      sesiones: sesiones.length,
    };
  }

  /*
   * El reparto por tema. Ordena por minutos y se queda con los cinco primeros:
   * una lista de veinte temas no es un resumen y ocupa media pantalla.
   */
  function repartoPorTema(sesiones) {
    const porTema = new Map();
    for (const sesion of sesiones) {
      porTema.set(sesion.tema, (porTema.get(sesion.tema) || 0) + sesion.minutos);
    }
    const lista = [...porTema.entries()]
      .map(([tema, minutos]) => ({ tema: tema, minutos: minutos }))
      .sort((a, b) => b.minutos - a.minutos || a.tema.localeCompare(b.tema));
    return lista.slice(0, 5);
  }

  /* ---------- Pintado ---------- */

  function pintar() {
    const sesiones = sesionesDelPeriodo(datos.leerSesiones());
    const dias = minutero(diasPeriodo === 0 ? DIAS_GRAFICO : diasPeriodo);
    const numeros = resumen(sesiones);

    pintarKpis(numeros);
    pintarGrafico(dias);
    pintarReparto(sesiones);

    // El gráfico tiene tope de 30 días aunque el periodo sea todo: hay que
    // decirlo, o los KPI de toda la vida y el gráfico parecen medir lo mismo.
    document.getElementById('grafico-nota').hidden = diasPeriodo !== 0;
  }

  function pintarKpis(numeros) {
    document.getElementById('kpi-total').textContent = textos.formatearNumero(numeros.minutos);
    document.getElementById('kpi-media').textContent = textos.formatearNumero(numeros.media);
    document.getElementById('kpi-dias').textContent = textos.formatearNumero(numeros.dias);
    document.getElementById('kpi-sesiones').textContent = textos.formatearNumero(numeros.sesiones);
  }

  /*
   * El gráfico se construye con createElement y nodos SVG: un <rect> dentro de
   * un innerHTML no es un elemento y no lleva <title>. Cada barra lleva su
   * fecha larga y sus minutos en el <title>, que es el tooltip y también lo
   * que lee el teclado al saltar por el SVG.
   */
  function pintarGrafico(dias) {
    const svg = document.getElementById('grafico-dias');
    svg.textContent = '';

    const ESPACIO_SVG = 'http://www.w3.org/2000/svg';
    const maximo = Math.max(...dias.map((dia) => dia.minutos), 1);
    const paso = ANCHO / dias.length;
    const ancho = Math.max(3, paso * 0.62);
    const altoDelDia = (minutos) => (minutos === 0 ? 0 : Math.max(3, (minutos / maximo) * ALTO_MAXIMO));

    dias.forEach((dia, indice) => {
      const grupo = document.createElementNS(ESPACIO_SVG, 'g');
      const x = indice * paso + (paso - ancho) / 2;

      const barra = document.createElementNS(ESPACIO_SVG, 'rect');
      barra.setAttribute('x', String(Math.round(x * 100) / 100));
      barra.setAttribute('y', String(BASE - altoDelDia(dia.minutos)));
      barra.setAttribute('width', String(Math.round(ancho * 100) / 100));
      barra.setAttribute('height', String(altoDelDia(dia.minutos)));
      barra.setAttribute('class', dia.minutos === maximo && dia.minutos > 0 ? 'barra barra--maxima' : 'barra');
      grupo.append(barra);

      const titulo = document.createElementNS(ESPACIO_SVG, 'title');
      titulo.textContent = `${textos.fechaLegible(dia.clave)}: ${textos.formatearNumero(dia.minutos)} min`;
      grupo.append(titulo);

      svg.append(grupo);

      // Con 30 días no caben todas las etiquetas: una de cada cinco, y con
      // texto al 200 % menos todavía.
      const cabeLaEtiqueta = dias.length <= 7 || indice % 5 === 0;
      if (!cabeLaEtiqueta) return;
      const etiqueta = document.createElementNS(ESPACIO_SVG, 'text');
      etiqueta.setAttribute('x', String(Math.round((indice * paso + paso / 2) * 100) / 100));
      etiqueta.setAttribute('y', String(BASE + 14));
      etiqueta.setAttribute('class', 'eje');
      etiqueta.textContent = dias.length <= 7 ? textos.inicialDia(dia.clave) : dia.clave.slice(-2);
      svg.append(etiqueta);
    });

    // El resumen para quien no ve el gráfico: qué mide y cuánto se hizo en total.
    svg.setAttribute(
      'aria-label',
      `${textos.t('panel.minutosPorDia')}: ${textos.formatearNumero(dias.reduce((suma, dia) => suma + dia.minutos, 0))} min`
    );
  }

  function pintarReparto(sesiones) {
    const lista = document.getElementById('reparto');
    const vacio = document.getElementById('reparto-vacio');
    const temas = repartoPorTema(sesiones);
    const minutos = sesiones.reduce((suma, sesion) => suma + sesion.minutos, 0);

    lista.textContent = '';
    vacio.hidden = temas.length > 0;

    for (const entrada of temas) {
      const porcentaje = minutos === 0 ? 0 : Math.round((entrada.minutos / minutos) * 100);
      const item = document.createElement('li');
      item.className = 'reparto__fila';

      const nombre = document.createElement('span');
      nombre.className = 'reparto__tema';
      nombre.textContent = entrada.tema;
      item.append(nombre);

      const cifra = document.createElement('span');
      cifra.className = 'reparto__cifra';
      cifra.textContent = `${textos.formatearNumero(entrada.minutos)} min · ${textos.formatearNumero(porcentaje)} %`;
      item.append(cifra);

      const carril = document.createElement('span');
      carril.className = 'reparto__riel';
      const relleno = document.createElement('span');
      relleno.className = 'reparto__relleno';
      // El ancho va en estilo y no en una clase: son datos, no estados.
      relleno.style.width = `${porcentaje}%`;
      carril.append(relleno);
      item.append(carril);

      lista.append(item);
    }
  }

  /* ---------- Arranque ---------- */

  /*
   * Los tres periodos se listan uno a uno en vez de usar querySelectorAll: así
   * el arnés, que no tiene esa función, puede engancharlos y probar el filtro.
   */
  const PERIODOS = [
    { id: 'periodo-7', dias: 7 },
    { id: 'periodo-30', dias: 30 },
    { id: 'periodo-todo', dias: 0 },
  ];

  function arrancar() {
    for (const periodo of PERIODOS) {
      document.getElementById(periodo.id).addEventListener('change', () => {
        diasPeriodo = periodo.dias;
        pintar();
      });
    }

    // No se pinta aquí: el primer pintado lo hace interfaz.pintarTodo(), que es
    // el único sitio desde el que se repinta la pantalla entera.
    // El idioma cambia las etiquetas del gráfico y del reparto, así que hay que
    // repintar: nada de eso sale de data-i18n porque depende de los datos.
    textos.alCambiarIdioma(() => pintar());
  }

  return {
    arrancar: arrancar,
    pintar: pintar,
    sesionesDelPeriodo: sesionesDelPeriodo,
    minutero: minutero,
    resumen: resumen,
    repartoPorTema: repartoPorTema,
    periodoActual: () => diasPeriodo,
    DIAS_GRAFICO: DIAS_GRAFICO,
  };
})());