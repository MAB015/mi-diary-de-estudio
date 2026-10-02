/*
 * interfaz.js — todo lo que pinta en pantalla y responde a lo que se pulsa.
 *
 * Aquí viven el formulario, la lista de sesiones, el calendario, la validación
 * y los botones. No guarda datos: para eso está "datos.js". Solo pinta y escucha.
 *
 * Este fichero se carga después de "datos.js" y "textos.js", así que puede
 * coger sus módulos directamente al empezar. Lo que se cargue después
 * (cronometro, panel) se pide con Diario.obtener() dentro de la función.
 */

Diario.registrar('interfaz', (function () {
  'use strict';

  const datos = Diario.obtener('datos');
  const textos = Diario.obtener('textos');
  const claveDeFecha = Diario.fechas.claveDeFecha;

  const formulario = document.getElementById('formulario');
  const campoFecha = document.getElementById('fecha');
  const campoTema = document.getElementById('tema');
  const campoMinutos = document.getElementById('minutos');
  const campoMeta = document.getElementById('meta');
  const listaSesiones = document.getElementById('sesiones');
  const mensajeVacio = document.getElementById('sin-sesiones');
  const textoRacha = document.getElementById('racha');
  const textoMejorRacha = document.getElementById('mejor-racha');
  const tarjetaRacha = document.getElementById('racha-tarjeta');
  const textoMeta = document.getElementById('meta-texto');
  const barra = document.getElementById('barra');
  const rellenoBarra = document.getElementById('barra-relleno');
  const textoMetaCumplida = document.getElementById('meta-cumplida');
  const calendario = document.getElementById('calendario');
  const leyenda = document.getElementById('leyenda');
  const botonGuardar = document.getElementById('guardar');
  const botonCancelar = document.getElementById('cancelar-edicion');

  /*
   * Id de la sesión que se está editando ahora mismo, o null si estamos registrando una nueva.
   * Vive aquí y no en el DOM porque es estado de la app, no algo que se pinte.
   */
  let idEnEdicion = null;

  /* ---------- Racha y meta ---------- */

  function pintarRacha(sesiones) {
    const dias = datos.calcularRacha(sesiones);
    // Sin emoji delante: la llama de al lado ya dice "esto está encendido".
    // El numero va solo, y el CSS lo pone enorme con cifras tabulares.
    textoRacha.textContent = textos.formatearDias(dias);

    const mejor = datos.calcularMejorRacha(sesiones);
    textoMejorRacha.textContent = textos.t('racha.mejor', { dias: textos.formatearDias(mejor) });
    // Un récord de 0 no es un récord, así que la línea se esconde hasta que haya uno.
    textoMejorRacha.hidden = mejor === 0;

    // La llama crece por tramos y no por cada día: a partir de 30 días ya
    // no cabe más, y un número que sube cada vez daría la sensación de que
    // el esfuerzo diario no cuenta. El color y el tamaño van en el CSS.
    tarjetaRacha.className = `tarjeta racha racha--${tramoDeLlama(dias)}`;
  }

  /* 1-2, 3-6, 7-29 y 30 o más. */
  function tramoDeLlama(dias) {
    if (dias >= 30) return 4;
    if (dias >= 7) return 3;
    if (dias >= 3) return 2;
    return 1;
  }

  function pintarMeta(sesiones) {
    const meta = datos.leerMeta();
    const minutos = datos.minutosDeHoy(sesiones);
    const cumplida = minutos >= meta;

    textoMeta.textContent = `${minutos} / ${meta} min`;
    // El tope al 100% es lo que impide que la barra desborde si te pasas de la meta.
    rellenoBarra.style.width = `${Math.min(100, (minutos / meta) * 100)}%`;
    barra.classList.toggle('barra--cumplida', cumplida);
    textoMetaCumplida.hidden = !cumplida;
  }

  /* Repinta todo lo que depende de las sesiones desde un único sitio. */
  function pintarTodo(sesiones) {
    pintarRacha(sesiones);
    pintarMeta(sesiones);
    pintarCalendario(sesiones);
    pintarSesiones(sesiones);
    // El panel lee las sesiones por su cuenta (filtra por periodo), así que no
    // se le pasan: se le pide que se repinte y ya está.
    Diario.obtener('panel').pintar();
  }

  /* ---------- Lista de sesiones ---------- */

  function pintarSesiones(sesiones) {
    listaSesiones.textContent = '';
    mensajeVacio.hidden = sesiones.length > 0;

    // La más reciente primero; si dos sesiones comparten fecha, gana la más reciente guardada.
    const ordenadas = [...sesiones].sort((a, b) => (a.fecha === b.fecha ? b.id - a.id : b.fecha.localeCompare(a.fecha)));

    for (const sesion of ordenadas) {
      const item = document.createElement('li');
      item.className = 'sesion';

      const datosFila = document.createElement('div');

      const tema = document.createElement('p');
      tema.className = 'sesion__tema';
      tema.textContent = sesion.tema;

      const fecha = document.createElement('p');
      fecha.className = 'sesion__fecha';
      fecha.textContent = textos.fechaLegible(sesion.fecha);

      const minutos = document.createElement('p');
      minutos.className = 'sesion__minutos';
      minutos.textContent = textos.t('sesiones.minutos', {
        minutos: textos.formatearNumero(sesion.minutos),
      });

      datosFila.append(tema, fecha);

      // Cada sesión lleva sus dos botones. Se crean con createElement porque un botón
      // escrito dentro de un string no se podría enlazar con su función al pulsarlo.
      const acciones = document.createElement('div');
      acciones.className = 'sesion__acciones';

      const botonEditar = document.createElement('button');
      botonEditar.type = 'button';
      botonEditar.className = 'boton boton--pequeno boton--secundario';
      botonEditar.textContent = textos.t('sesiones.editar');
      botonEditar.addEventListener('click', () => empezarEdicion(sesion));

      const botonEliminar = document.createElement('button');
      botonEliminar.type = 'button';
      botonEliminar.className = 'boton boton--pequeno boton--peligro';
      botonEliminar.textContent = textos.t('sesiones.eliminar');
      botonEliminar.addEventListener('click', () => confirmarBorrado(sesion));

      acciones.append(botonEditar, botonEliminar);

      // Los botones van dentro de la columna de texto: en 375 px, como terceros hijos
      // de la fila se salían de la tarjeta.
      datosFila.append(acciones);
      item.append(datosFila, minutos);
      listaSesiones.append(item);
    }
  }

  /* ---------- Editar y eliminar ---------- */

  /* Deja el formulario como está al abrir la página: tema y minutos vacíos, fecha hoy. */
  function limpiarFormulario() {
    campoTema.value = '';
    campoMinutos.value = '';
    campoFecha.value = claveDeFecha(new Date());
  }

  /*
   * Vuelve al modo "guardar nueva sesión": es lo que se ve al abrir la página.
   * Se llama al terminar de editar, al cancelar y al borrar lo que se estaba editando.
   */
  function salirDeEdicion() {
    idEnEdicion = null;
    botonGuardar.textContent = textos.t('formulario.guardar');
    botonCancelar.hidden = true;
    limpiarErrores();
  }

  /* Pasa el formulario a modo edición: rellena los campos con la sesión elegida. */
  function empezarEdicion(sesion) {
    idEnEdicion = sesion.id;
    campoFecha.value = sesion.fecha;
    campoTema.value = sesion.tema;
    campoMinutos.value = String(sesion.minutos);
    botonGuardar.textContent = textos.t('formulario.guardarCambios');
    botonCancelar.hidden = false;
    limpiarErrores();
    // Se sube al formulario porque la lista está debajo y en móvil no caben los dos sitios juntos.
    formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    campoTema.focus();
  }

  /* Pregunta antes de borrar. Si se cancela, no se toca nada. */
  function confirmarBorrado(sesion) {
    if (!confirm(textos.t('sesiones.confirmar', { tema: sesion.tema }))) return;

    const sesiones = datos.leerSesiones();
    const quedan = sesiones.filter((otra) => otra.id !== sesion.id);
    datos.escribirSesiones(quedan);

    // Si justo se estaba editando, el formulario apuntaría a una sesión que ya no existe.
    if (idEnEdicion === sesion.id) {
      limpiarFormulario();
      salirDeEdicion();
    }

    pintarTodo(quedan);
  }

  /* ---------- Calendario de actividad ---------- */

  /* La leyenda se construye con la meta actual para que nunca contradiga el color. */
  function pintarLeyenda(meta) {
    const niveles = [
      ['dia--vacio', textos.t('calendario.sinSesion')],
      ['dia--bajo', textos.t('calendario.hasta', { meta: textos.formatearNumero(meta) })],
      ['dia--intenso', textos.t('calendario.masDe', { meta: textos.formatearNumero(meta) })],
    ];

    leyenda.textContent = '';
    for (const [clase, texto] of niveles) {
      const item = document.createElement('span');
      item.className = 'leyenda__item';

      const muestra = document.createElement('span');
      muestra.className = `leyenda__muestra ${clase}`;

      item.append(muestra, texto);
      leyenda.append(item);
    }
  }

  function pintarCalendario(sesiones) {
    const meta = datos.leerMeta();
    const porDia = datos.minutosPorDia(sesiones);
    const hoy = claveDeFecha(new Date());

    calendario.textContent = '';
    // Las 28 claves salen de moverClave, que ya respeta meses, años y cambios de hora.
    for (let posicion = 0; posicion < datos.DIAS_CALENDARIO; posicion += 1) {
      const clave = Diario.fechas.moverClave(hoy, posicion - (datos.DIAS_CALENDARIO - 1));
      const minutos = porDia.get(clave) || 0;

      const casilla = document.createElement('div');
      casilla.className = 'dia';
      if (minutos === 0) casilla.classList.add('dia--vacio');
      else if (minutos > meta) casilla.classList.add('dia--intenso');
      else casilla.classList.add('dia--bajo');
      if (clave === hoy) casilla.classList.add('dia--hoy');

      // El número del día hace que se entienda sin depender solo del color.
      casilla.textContent = clave.slice(-2);
      // El title lleva la fecha y los minutos, que es lo que no cabe en la casilla.
      casilla.title = minutos === 0
        ? textos.t('calendario.sinSesiones', { fecha: textos.fechaLegible(clave) })
        : `${textos.fechaLegible(clave)} · ${textos.t('sesiones.minutos', {
            minutos: textos.formatearNumero(minutos),
          })}`;

      calendario.append(casilla);
    }

    pintarLeyenda(meta);
  }

  /*
   * El cronómetro y el modo enfoque terminan y pasan aquí los minutos que han
   * medido. No se guarda nada todavía: solo se rellena el formulario para que
   * quien estudia sea quien confirme. Así sigue habiendo un único camino para
   * escribir en localStorage.
   *
   * El tema llega vacío si quien termina no lo sabe (el cronómetro no lo sabe):
   * el modo enfoque lo escribe y así quien vuelve solo tiene que darle a Guardar.
   */
  function prepararSesion(minutos, tema) {
    salirDeEdicion();
    campoFecha.value = claveDeFecha(new Date());
    campoMinutos.value = String(minutos);
    campoTema.value = tema ?? '';
    formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    campoTema.focus();
  }

  /* ---------- Validación ---------- */

  function mostrarError(campo, mensaje) {
    const aviso = document.getElementById(`error-${campo.id}`);
    aviso.textContent = mensaje;
    aviso.hidden = false;
    campo.setAttribute('aria-invalid', 'true');
  }

  function ocultarError(campo) {
    document.getElementById(`error-${campo.id}`).hidden = true;
    campo.removeAttribute('aria-invalid');
  }

  function limpiarErrores() {
    for (const campo of [campoFecha, campoTema, campoMinutos]) ocultarError(campo);
  }

  /* Revisa los tres campos y devuelve el primer error encontrado, o null si todo está bien. */
  function validar() {
    const tema = campoTema.value.trim();
    if (tema === '') {
      return { campo: campoTema, mensaje: textos.t('error.temaVacio') };
    }

    const minutos = campoMinutos.value;
    if (minutos === '') {
      return { campo: campoMinutos, mensaje: textos.t('error.minutosVacio') };
    }
    if (!Number.isFinite(Number(minutos))) {
      return { campo: campoMinutos, mensaje: textos.t('error.minutosNumero') };
    }
    if (Number(minutos) <= 0) {
      return { campo: campoMinutos, mensaje: textos.t('error.minutosPositivos') };
    }

    if (campoFecha.value === '') {
      return { campo: campoFecha, mensaje: textos.t('error.fechaVacia') };
    }

    return null;
  }

  /* ---------- Arranque ---------- */

  function arrancar() {
    // La meta se guarda al salir del campo o al pulsar Enter, sin botón de guardar.
    campoMeta.addEventListener('change', () => {
      const numero = Number(campoMeta.value);
      if (campoMeta.value === '' || !Number.isInteger(numero) || numero <= 0) {
        mostrarError(campoMeta, textos.t('meta.error'));
        // Volvemos al último valor válido: una meta no cambia sin que nos demos cuenta.
        campoMeta.value = String(datos.leerMeta());
        return;
      }

      ocultarError(campoMeta);
      datos.escribirMeta(numero);
      // La meta también cambia el color de las casillas y la leyenda del calendario.
      const sesionesConMetaNueva = datos.leerSesiones();
      pintarMeta(sesionesConMetaNueva);
      pintarCalendario(sesionesConMetaNueva);
    });

    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      limpiarErrores();

      const error = validar();
      if (error) {
        mostrarError(error.campo, error.mensaje);
        error.campo.focus();
        return;
      }

      const sesiones = datos.leerSesiones();

      if (idEnEdicion === null) {
        // El id solo ordena las sesiones del mismo día, de la más nueva a la más antigua.
        sesiones.push({
          id: datos.idLibre(sesiones),
          fecha: campoFecha.value,
          tema: campoTema.value.trim(),
          minutos: Number(campoMinutos.value),
        });
      } else {
        // Editar no crea nada nuevo: cambia la sesión que ya estaba guardada y conserva su id.
        const editada = sesiones.find((sesion) => sesion.id === idEnEdicion);
        if (editada) {
          editada.fecha = campoFecha.value;
          editada.tema = campoTema.value.trim();
          editada.minutos = Number(campoMinutos.value);
        }
      }

      datos.escribirSesiones(sesiones);

      limpiarFormulario();
      salirDeEdicion();

      pintarTodo(sesiones);
      campoTema.focus();
    });

    botonCancelar.addEventListener('click', () => {
      limpiarFormulario();
      salirDeEdicion();
      campoTema.focus();
    });

    // La fecha por defecto es hoy, en hora local.
    campoFecha.value = claveDeFecha(new Date());
    campoMeta.value = datos.leerMeta();

    // El idioma va primero: traduce el texto fijo del HTML y fija el idioma
    // con el que se pinta todo lo demás. Al revés se vería un instante en español.
    textos.arrancar();
    textos.alCambiarIdioma(() => pintarTodo(datos.leerSesiones()));

    // El tema ya está puesto por el script de la cabecera; aquí solo se
    // refleja la preferencia guardada en el selector y se le escucha.
    Diario.obtener('preferencias').arrancar();

    // El cronómetro va después porque al arrancar llama a pintar(), y pintar()
    // necesita el idioma ya puesto.
    Diario.obtener('cronometro').arrancar();

    // El modo enfoque solo engancha botones al arrancar; su diálogo se abre
    // cuando se pulsa la llamada a la acción.
    Diario.obtener('enfoque').arrancar();

    // El panel se engancha al arrancar para ouvir el filtro, pero se pinta desde
    // pintarTodo(), que es el único sitio desde el que se repinta la pantalla.
    Diario.obtener('panel').arrancar();

    pintarTodo(datos.leerSesiones());
  }

  return {
    arrancar: arrancar,
    pintarTodo: pintarTodo,
    pintarRacha: pintarRacha,
    pintarMeta: pintarMeta,
    pintarSesiones: pintarSesiones,
    pintarCalendario: pintarCalendario,
    pintarLeyenda: pintarLeyenda,
    validar: validar,
    mostrarError: mostrarError,
    ocultarError: ocultarError,
    limpiarErrores: limpiarErrores,
    limpiarFormulario: limpiarFormulario,
    prepararSesion: prepararSesion,
    salirDeEdicion: salirDeEdicion,
    empezarEdicion: empezarEdicion,
    confirmarBorrado: confirmarBorrado,
    // Lectura del estado de edición. El arnés de pruebas lo necesita para no
    // tener que abrir el fichero entero desde fuera.
    estadoEdicion: () => idEnEdicion,
  };
})());

// Último: solo pone en marcha lo anterior.
Diario.obtener('interfaz').arrancar();