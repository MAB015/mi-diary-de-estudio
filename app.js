'use strict';

/* Claves con las que guardamos los datos en el navegador. */
const CLAVE_ALMACEN = 'diario-de-estudio.sesiones';
const CLAVE_META = 'diario-de-estudio.meta';
const META_POR_DEFECTO = 30;
const DIAS_CALENDARIO = 28;

const formulario = document.getElementById('formulario');
const campoFecha = document.getElementById('fecha');
const campoTema = document.getElementById('tema');
const campoMinutos = document.getElementById('minutos');
const campoMeta = document.getElementById('meta');
const listaSesiones = document.getElementById('sesiones');
const mensajeVacio = document.getElementById('sin-sesiones');
const textoRacha = document.getElementById('racha');
const textoMejorRacha = document.getElementById('mejor-racha');
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

/* ---------- Fechas en hora local ---------- */

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

/* "jueves, 1 de octubre de 2026". El T00:00:00 es a propósito: sin él se interpretaría como UTC. */
function fechaLegible(clave) {
  return new Date(`${clave}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* ---------- Pintado en pantalla ---------- */

/* "1 día" o "N días": el singular y el plural en un único sitio. */
function formatearDias(numero) {
  return `${numero} ${numero === 1 ? 'día' : 'días'}`;
}

function pintarRacha(sesiones) {
  textoRacha.textContent = `🔥 ${formatearDias(calcularRacha(sesiones))}`;

  const mejor = calcularMejorRacha(sesiones);
  textoMejorRacha.textContent = `🏆 Mejor racha: ${formatearDias(mejor)}`;
  // Un récord de 0 no es un récord, así que la línea se esconde hasta que haya uno.
  textoMejorRacha.hidden = mejor === 0;
}

function pintarMeta(sesiones) {
  const meta = leerMeta();
  const minutos = minutosDeHoy(sesiones);
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
}

function pintarSesiones(sesiones) {
  listaSesiones.textContent = '';
  mensajeVacio.hidden = sesiones.length > 0;

  // La más reciente primero; si dos sesiones comparten fecha, gana la más reciente guardada.
  const ordenadas = [...sesiones].sort((a, b) => (a.fecha === b.fecha ? b.id - a.id : b.fecha.localeCompare(a.fecha)));

  for (const sesion of ordenadas) {
    const item = document.createElement('li');
    item.className = 'sesion';

    const datos = document.createElement('div');

    const tema = document.createElement('p');
    tema.className = 'sesion__tema';
    tema.textContent = sesion.tema;

    const fecha = document.createElement('p');
    fecha.className = 'sesion__fecha';
    fecha.textContent = fechaLegible(sesion.fecha);

    const minutos = document.createElement('p');
    minutos.className = 'sesion__minutos';
    minutos.textContent = `${sesion.minutos} min`;

    datos.append(tema, fecha);

    // Cada sesión lleva sus dos botones. Se crean con createElement porque un botón
    // escrito dentro de un string no se podría enlazar con su función al pulsarlo.
    const acciones = document.createElement('div');
    acciones.className = 'sesion__acciones';

    const botonEditar = document.createElement('button');
    botonEditar.type = 'button';
    botonEditar.className = 'boton boton--pequeno boton--secundario';
    botonEditar.textContent = 'Editar';
    botonEditar.addEventListener('click', () => empezarEdicion(sesion));

    const botonEliminar = document.createElement('button');
    botonEliminar.type = 'button';
    botonEliminar.className = 'boton boton--pequeno boton--peligro';
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.addEventListener('click', () => confirmarBorrado(sesion));

    acciones.append(botonEditar, botonEliminar);

    // Los botones van dentro de la columna de texto: en 375 px, como terceros hijos
    // de la fila se salían de la tarjeta.
    datos.append(acciones);
    item.append(datos, minutos);
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
  botonGuardar.textContent = 'Guardar sesión';
  botonCancelar.hidden = true;
  limpiarErrores();
}

/* Pasa el formulario a modo edición: rellena los campos con la sesión elegida. */
function empezarEdicion(sesion) {
  idEnEdicion = sesion.id;
  campoFecha.value = sesion.fecha;
  campoTema.value = sesion.tema;
  campoMinutos.value = String(sesion.minutos);
  botonGuardar.textContent = 'Guardar cambios';
  botonCancelar.hidden = false;
  limpiarErrores();
  // Se sube al formulario porque la lista está debajo y en móvil no caben los dos sitios juntos.
  formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
  campoTema.focus();
}

/* Pregunta antes de borrar. Si se cancela, no se toca nada. */
function confirmarBorrado(sesion) {
  if (!confirm(`¿Eliminar la sesión de "${sesion.tema}"?`)) return;

  const sesiones = leerSesiones();
  const quedan = sesiones.filter((otra) => otra.id !== sesion.id);
  escribirSesiones(quedan);

  // Si justo se estaba editando, el formulario apuntaría a una sesión que ya no existe.
  if (idEnEdicion === sesion.id) {
    limpiarFormulario();
    salirDeEdicion();
  }

  pintarTodo(quedan);
}

/* ---------- Calendario de actividad ---------- */

/* Devuelve un Map con clave "AAAA-MM-DD" y los minutos sumados de ese día. */
function minutosPorDia(sesiones) {
  const porDia = new Map();
  for (const sesion of sesiones) {
    porDia.set(sesion.fecha, (porDia.get(sesion.fecha) || 0) + sesion.minutos);
  }
  return porDia;
}

/* La leyenda se construye con la meta actual para que nunca contradiga el color. */
function pintarLeyenda(meta) {
  const niveles = [
    ['dia--vacio', 'Sin sesión'],
    ['dia--bajo', `Hasta ${meta} min`],
    ['dia--intenso', `Más de ${meta} min`],
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
  const meta = leerMeta();
  const porDia = minutosPorDia(sesiones);
  const hoy = claveDeFecha(new Date());

  calendario.textContent = '';
  // Las 28 claves salen de moverClave, que ya respeta meses, años y cambios de hora.
  for (let posicion = 0; posicion < DIAS_CALENDARIO; posicion += 1) {
    const clave = moverClave(hoy, posicion - (DIAS_CALENDARIO - 1));
    const minutos = porDia.get(clave) || 0;

    const casilla = document.createElement('div');
    casilla.className = 'dia';
    if (minutos === 0) casilla.classList.add('dia--vacio');
    else if (minutos > meta) casilla.classList.add('dia--intenso');
    else casilla.classList.add('dia--bajo');
    if (clave === hoy) casilla.classList.add('dia--hoy');

    // El número del día hace que se entienda sin depender solo del color.
    casilla.textContent = clave.slice(-2);
    casilla.title = `${fechaLegible(clave)} · ${minutos === 0 ? 'sin sesiones' : `${minutos} min`}`;

    calendario.append(casilla);
  }

  pintarLeyenda(meta);
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
    return { campo: campoTema, mensaje: 'Escribe el tema que estudiaste.' };
  }

  const minutos = campoMinutos.value;
  if (minutos === '') {
    return { campo: campoMinutos, mensaje: 'Indica cuántos minutos estudiaste.' };
  }
  if (!Number.isFinite(Number(minutos))) {
    return { campo: campoMinutos, mensaje: 'Los minutos deben ser un número.' };
  }
  if (Number(minutos) <= 0) {
    return { campo: campoMinutos, mensaje: 'Los minutos deben ser mayores que 0.' };
  }

  if (campoFecha.value === '') {
    return { campo: campoFecha, mensaje: 'Indica la fecha de la sesión.' };
  }

  return null;
}

/* ---------- Arranque ---------- */

// La meta se guarda al salir del campo o al pulsar Enter, sin botón de guardar.
campoMeta.addEventListener('change', () => {
  const numero = Number(campoMeta.value);
  if (campoMeta.value === '' || !Number.isInteger(numero) || numero <= 0) {
    mostrarError(campoMeta, 'La meta debe ser un número entero mayor que 0.');
    // Volvemos al último valor válido: una meta no cambia sin que nos demos cuenta.
    campoMeta.value = String(leerMeta());
    return;
  }

ocultarError(campoMeta);
escribirMeta(numero);
// La meta también cambia el color de las casillas y la leyenda del calendario.
const sesionesConMetaNueva = leerSesiones();
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

  const sesiones = leerSesiones();

  if (idEnEdicion === null) {
    // El id solo ordena las sesiones del mismo día, de la más nueva a la más antigua.
    sesiones.push({
      id: idLibre(sesiones),
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

  escribirSesiones(sesiones);

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
campoMeta.value = leerMeta();

pintarTodo(leerSesiones());
