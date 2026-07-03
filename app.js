"use strict";

/* =====================================================================
   MODO DEMOSTRACIÓN
   Esta copia de app.js está pensada só para GitHub Pages: non hai
   backend real detrás, así que todas as chamadas á API se substitúen
   por datos de proba fixos definidos máis abaixo. A lóxica de
   renderizado (Kanban, Táboa, ficha de expediente) é idéntica á da
   aplicación real.
   ===================================================================== */

/* ---------- Constantes compartidas ---------- */

const FASES = [
  { valor: "Sin revisar", etiqueta: "Sen revisar" },
  { valor: "Revisado administrativamente", etiqueta: "Revisado administrativamente" },
  { valor: "Pendiente revision tecnica", etiqueta: "Pendente de revisión técnica" },
  { valor: "Revision tecnica favorable", etiqueta: "Revisión técnica favorable" },
  { valor: "Pendiente revision juridica", etiqueta: "Pendente de revisión xurídica" },
  { valor: "Revision juridica favorable", etiqueta: "Revisión xurídica favorable" },
  { valor: "Preparada resolucion", etiqueta: "Preparada resolución" },
  { valor: "Comunicada", etiqueta: "Comunicada" },
  { valor: "Expediente cerrado", etiqueta: "Expediente pechado" },
];

const DOCUMENTACION = [
  { valor: "No procede", etiqueta: "Non procede" },
  { valor: "Requerida documentacion administrativa", etiqueta: "Requirida documentación administrativa" },
  { valor: "Requerida documentacion tecnica", etiqueta: "Requirida documentación técnica" },
  { valor: "Requerida documentacion juridica", etiqueta: "Requirida documentación xurídica" },
  { valor: "Documentacion recibida pendiente revisar", etiqueta: "Documentación recibida, pendente de revisar" },
];

function etiquetaFase(valor) {
  const fase = FASES.find((f) => f.valor === valor);
  return fase ? fase.etiqueta : valor;
}

function etiquetaDocumentacion(valor) {
  const doc = DOCUMENTACION.find((d) => d.valor === valor);
  return doc ? doc.etiqueta : valor;
}

/* ---------- Datos de proba ---------- */

function dataDemo(diasDesdeHoxe) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diasDesdeHoxe);
  return d.toISOString().slice(0, 10);
}

function dataHoraDemo(diasDesdeHoxe) {
  const d = new Date();
  d.setDate(d.getDate() + diasDesdeHoxe);
  return d.toISOString();
}

const USUARIOS_DEMO = [
  { id: 1, nombre: "Ana Administrativa", email: "ana@vigo.gal", rol: "administrativo", juridico_defecto: false, activo: true },
  { id: 2, nombre: "Tomás Técnico", email: "tomas@vigo.gal", rol: "tecnico", juridico_defecto: false, activo: true },
  { id: 3, nombre: "Xela Louzao", email: "xela@vigo.gal", rol: "juridico", juridico_defecto: true, activo: true },
];

const EXPEDIENTES_DEMO = [
  {
    id: 1, numero_orden: 101, dias: 12, expediente: "EXP/2026/101",
    interesado: "Asociación Festas do Barrio", asunto: "Verbena popular con carpa e escenario musical",
    ubicacion: "Praza de España", situacion_abierto: true, fecha_expediente: dataDemo(-20),
    estado_origen: "En trámite", fase: "Sin revisar", documentacion_pendiente: "No procede",
    fecha_inicio_evento: null, fecha_fin_evento: null,
    tecnico_asignado_id: null, juridico_asignado_id: 3,
    fecha_creacion: dataHoraDemo(-6), fecha_actualizacion: dataHoraDemo(-6), incompleto: true,
  },
  {
    id: 2, numero_orden: 102, dias: 8, expediente: "EXP/2026/102",
    interesado: "Peña Recreativa O Castro", asunto: "Concerto de verán na alameda",
    ubicacion: "Alameda", situacion_abierto: true, fecha_expediente: dataDemo(-15),
    estado_origen: "En trámite", fase: "Sin revisar", documentacion_pendiente: "Requerida documentacion administrativa",
    fecha_inicio_evento: dataDemo(5), fecha_fin_evento: dataDemo(5),
    tecnico_asignado_id: 2, juridico_asignado_id: 3,
    fecha_creacion: dataHoraDemo(-4), fecha_actualizacion: dataHoraDemo(-1), incompleto: false,
  },
  {
    id: 3, numero_orden: 103, dias: 6, expediente: "EXP/2026/103",
    interesado: "Concello de Vigo — Cultura", asunto: "Feira medieval no centro histórico",
    ubicacion: "Casco Vello", situacion_abierto: true, fecha_expediente: dataDemo(-10),
    estado_origen: "Pendente", fase: "Revisado administrativamente", documentacion_pendiente: "No procede",
    fecha_inicio_evento: dataDemo(12), fecha_fin_evento: dataDemo(14),
    tecnico_asignado_id: 2, juridico_asignado_id: null,
    fecha_creacion: dataHoraDemo(-9), fecha_actualizacion: dataHoraDemo(-2), incompleto: false,
  },
  {
    id: 4, numero_orden: 104, dias: 3, expediente: "EXP/2026/104",
    interesado: "Comunidade de Montes de Bembrive", asunto: "Festa da malla con exhibición de gando",
    ubicacion: "Bembrive", situacion_abierto: true, fecha_expediente: dataDemo(-5),
    estado_origen: "En trámite", fase: "Pendiente revision tecnica", documentacion_pendiente: "Requerida documentacion tecnica",
    fecha_inicio_evento: dataDemo(25), fecha_fin_evento: dataDemo(26),
    tecnico_asignado_id: 2, juridico_asignado_id: 3,
    fecha_creacion: dataHoraDemo(-3), fecha_actualizacion: dataHoraDemo(-1), incompleto: false,
  },
  {
    id: 5, numero_orden: 105, dias: 15, expediente: "EXP/2026/105",
    interesado: "Hostalaría Vigo Centro", asunto: "Mercado gastronómico de rúa",
    ubicacion: "Rúa Príncipe", situacion_abierto: true, fecha_expediente: dataDemo(-25),
    estado_origen: "Favorable", fase: "Revision tecnica favorable", documentacion_pendiente: "No procede",
    fecha_inicio_evento: dataDemo(2), fecha_fin_evento: dataDemo(3),
    tecnico_asignado_id: 2, juridico_asignado_id: 3,
    fecha_creacion: dataHoraDemo(-15), fecha_actualizacion: dataHoraDemo(-1), incompleto: false,
  },
  {
    id: 6, numero_orden: 106, dias: 1, expediente: "EXP/2026/106",
    interesado: "Club Deportivo Coia", asunto: "Torneo popular de fútbol na rúa",
    ubicacion: "Coia", situacion_abierto: true, fecha_expediente: dataDemo(-2),
    estado_origen: "En trámite", fase: "Pendiente revision juridica", documentacion_pendiente: "Documentacion recibida pendiente revisar",
    fecha_inicio_evento: null, fecha_fin_evento: null,
    tecnico_asignado_id: 2, juridico_asignado_id: 3,
    fecha_creacion: dataHoraDemo(-1), fecha_actualizacion: dataHoraDemo(0), incompleto: false,
  },
  {
    id: 7, numero_orden: 107, dias: 30, expediente: "EXP/2026/107",
    interesado: "Fundación Vigo Cultural", asunto: "Ciclo de música tradicional galega",
    ubicacion: "Auditorio Municipal", situacion_abierto: true, fecha_expediente: dataDemo(-40),
    estado_origen: "Favorable", fase: "Revision juridica favorable", documentacion_pendiente: "No procede",
    fecha_inicio_evento: dataDemo(40), fecha_fin_evento: dataDemo(41),
    tecnico_asignado_id: 2, juridico_asignado_id: 3,
    fecha_creacion: dataHoraDemo(-30), fecha_actualizacion: dataHoraDemo(-3), incompleto: false,
  },
  {
    id: 8, numero_orden: 108, dias: 4, expediente: "EXP/2026/108",
    interesado: "Asociación Veciñal de Teis", asunto: "Festa de fin de curso con atraccións infantís",
    ubicacion: "Teis", situacion_abierto: true, fecha_expediente: dataDemo(-8),
    estado_origen: "Favorable", fase: "Preparada resolucion", documentacion_pendiente: "No procede",
    fecha_inicio_evento: dataDemo(8), fecha_fin_evento: dataDemo(8),
    tecnico_asignado_id: 2, juridico_asignado_id: 3,
    fecha_creacion: dataHoraDemo(-8), fecha_actualizacion: dataHoraDemo(-1), incompleto: false,
  },
  {
    id: 9, numero_orden: 109, dias: 45, expediente: "EXP/2026/109",
    interesado: "Concello de Vigo — Turismo", asunto: "Mostra de artesanía de Nadal",
    ubicacion: "Praza da Constitución", situacion_abierto: false, fecha_expediente: dataDemo(-60),
    estado_origen: "Resuelto", fase: "Comunicada", documentacion_pendiente: "No procede",
    fecha_inicio_evento: dataDemo(-3), fecha_fin_evento: dataDemo(-1),
    tecnico_asignado_id: 2, juridico_asignado_id: 3,
    fecha_creacion: dataHoraDemo(-45), fecha_actualizacion: dataHoraDemo(-4), incompleto: false,
  },
  {
    id: 10, numero_orden: 110, dias: 90, expediente: "EXP/2026/110",
    interesado: "Real Club Celta — Fundación", asunto: "Evento solidario previo ao partido",
    ubicacion: "Balaídos", situacion_abierto: false, fecha_expediente: dataDemo(-90),
    estado_origen: "Resuelto", fase: "Expediente cerrado", documentacion_pendiente: "No procede",
    fecha_inicio_evento: dataDemo(-30), fecha_fin_evento: dataDemo(-29),
    tecnico_asignado_id: 2, juridico_asignado_id: 3,
    fecha_creacion: dataHoraDemo(-90), fecha_actualizacion: dataHoraDemo(-28), incompleto: false,
  },
];

const HISTORICO_DEMO = {
  3: [
    {
      id: 1, expediente_id: 3, usuario_id: 1,
      fase_anterior: "Sin revisar", fase_nueva: "Revisado administrativamente",
      documentacion_anterior: null, documentacion_nueva: null,
      fecha_cambio: dataHoraDemo(-9), usuario: USUARIOS_DEMO[0],
    },
  ],
  4: [
    {
      id: 2, expediente_id: 4, usuario_id: 1,
      fase_anterior: "Sin revisar", fase_nueva: "Pendiente revision tecnica",
      documentacion_anterior: "No procede", documentacion_nueva: "Requerida documentacion tecnica",
      fecha_cambio: dataHoraDemo(-3), usuario: USUARIOS_DEMO[0],
    },
    {
      id: 3, expediente_id: 4, usuario_id: 2,
      fase_anterior: null, fase_nueva: null,
      documentacion_anterior: "Requerida documentacion tecnica", documentacion_nueva: "Documentacion recibida pendiente revisar",
      fecha_cambio: dataHoraDemo(-1), usuario: USUARIOS_DEMO[1],
    },
  ],
};

/* ---------- "API" simulada ---------- */

function agardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiFetch(ruta, opcions = {}) {
  await agardar(120);

  const metodo = (opcions.method || "GET").toUpperCase();
  const rutaBase = ruta.split("?")[0];

  if (rutaBase === "/auth/me") {
    return USUARIOS_DEMO[0];
  }

  if (rutaBase === "/usuarios") {
    return USUARIOS_DEMO;
  }

  if (rutaBase === "/expedientes") {
    return EXPEDIENTES_DEMO;
  }

  if (rutaBase === "/agenda") {
    const hoxe = new Date();
    hoxe.setHours(0, 0, 0, 0);
    return EXPEDIENTES_DEMO.filter((e) => {
      if (!e.fecha_inicio_evento) return false;
      return new Date(e.fecha_inicio_evento + "T00:00:00") >= hoxe;
    }).sort((a, b) => a.fecha_inicio_evento.localeCompare(b.fecha_inicio_evento));
  }

  const coincidenciaHistorico = rutaBase.match(/^\/expedientes\/(\d+)\/historico$/);
  if (coincidenciaHistorico) {
    const id = Number(coincidenciaHistorico[1]);
    return HISTORICO_DEMO[id] || [];
  }

  const coincidenciaDetalle = rutaBase.match(/^\/expedientes\/(\d+)$/);
  if (coincidenciaDetalle) {
    const id = Number(coincidenciaDetalle[1]);
    const exp = EXPEDIENTES_DEMO.find((e) => e.id === id);
    if (!exp) throw new Error("Expediente non atopado");

    if (metodo === "PATCH") {
      const cambios = JSON.parse(opcions.body || "{}");
      Object.assign(exp, cambios);
      exp.tecnico_asignado_id = cambios.tecnico_asignado_id ? Number(cambios.tecnico_asignado_id) : null;
      exp.juridico_asignado_id = cambios.juridico_asignado_id ? Number(cambios.juridico_asignado_id) : null;
      exp.incompleto = !(exp.fecha_inicio_evento && exp.fecha_fin_evento);
      exp.fecha_actualizacion = new Date().toISOString();
    }

    return exp;
  }

  throw new Error("Non dispoñible no modo demostración");
}

/* ---------- Utilidades ---------- */

function pad2(numero) {
  return String(numero).padStart(2, "0");
}

// Formatea unha data ISO (yyyy-mm-dd) como dd/mm/yyyy, sen depender do
// idioma configurado no navegador.
function formatFecha(valorIso) {
  if (!valorIso) return "—";
  const partes = valorIso.split("T")[0].split("-");
  if (partes.length !== 3) return valorIso;
  const [anio, mes, dia] = partes;
  return `${dia}/${mes}/${anio}`;
}

function formatFechaHora(valorIso) {
  if (!valorIso) return "—";
  const data = new Date(valorIso);
  if (Number.isNaN(data.getTime())) return valorIso;
  const dia = pad2(data.getDate());
  const mes = pad2(data.getMonth() + 1);
  const anio = data.getFullYear();
  const horas = pad2(data.getHours());
  const minutos = pad2(data.getMinutes());
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
}

// Convirte un texto "dd/mm/yyyy" introducido a man en "yyyy-mm-dd".
// Devolve null se o campo está baleiro, undefined se o formato non é válido.
function parseFechaInput(texto) {
  if (!texto || !texto.trim()) return null;
  const coincidencia = texto.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!coincidencia) return undefined;

  const [, diaTxt, mesTxt, anioTxt] = coincidencia;
  const dia = Number(diaTxt);
  const mes = Number(mesTxt);
  const anio = Number(anioTxt);
  const data = new Date(anio, mes - 1, dia);

  if (data.getFullYear() !== anio || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    return undefined;
  }

  return `${anioTxt}-${mesTxt}-${diaTxt}`;
}

// Insire as barras automaticamente mentres se escribe nun campo de data en
// formato dd/mm/yyyy.
function activarAutoFormatoData(input) {
  input.addEventListener("input", () => {
    const soDixitos = input.value.replace(/\D/g, "").slice(0, 8);
    let resultado = soDixitos;
    if (soDixitos.length > 4) {
      resultado = `${soDixitos.slice(0, 2)}/${soDixitos.slice(2, 4)}/${soDixitos.slice(4)}`;
    } else if (soDixitos.length > 2) {
      resultado = `${soDixitos.slice(0, 2)}/${soDixitos.slice(2)}`;
    }
    input.value = resultado;
  });
}

function escapeHtml(texto) {
  if (texto === null || texto === undefined) return "";
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function parametroUrl(nome) {
  return new URLSearchParams(window.location.search).get(nome);
}

function getToken() {
  return sessionStorage.getItem("token_demo");
}

function setToken(token) {
  sessionStorage.setItem("token_demo", token);
}

function clearToken() {
  sessionStorage.removeItem("token_demo");
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

/* ==================== Páxina: Login ==================== */

function initLogin() {
  if (getToken()) {
    window.location.href = "panel.html";
    return;
  }

  const form = document.getElementById("form-login");

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    // No modo demostración calquera credencial é válida: non hai backend
    // real que verificar.
    setToken("demo");
    window.location.href = "panel.html";
  });
}

/* ==================== Páxina: Panel ==================== */

const estadoPanel = {
  expedientes: [],
  agenda: [],
  usuarios: {},
  usuarioActual: null,
  vista: "kanban",
  filtroRapido: "todos",
  texto: "",
  ordeCol: "fecha_inicio_evento",
  ordeAsc: true,
};

function nomeUsuario(id) {
  const usuario = estadoPanel.usuarios[id];
  return usuario ? usuario.nombre : "—";
}

async function initPanel() {
  requireAuth();

  document.getElementById("btn-logout").addEventListener("click", () => {
    clearToken();
    window.location.href = "index.html";
  });

  estadoPanel.usuarioActual = await apiFetch("/auth/me");
  document.getElementById("usuario-actual").textContent = estadoPanel.usuarioActual.nombre;

  const usuarios = await apiFetch("/usuarios");
  usuarios.forEach((u) => {
    estadoPanel.usuarios[u.id] = u;
  });

  estadoPanel.vista = localStorage.getItem("vista_preferida") || "kanban";
  activarVista(estadoPanel.vista, false);

  configurarControis();
  await cargarExpedientes();
}

function configurarControis() {
  document.getElementById("btn-vista-kanban").addEventListener("click", () => activarVista("kanban"));
  document.getElementById("btn-vista-tabla").addEventListener("click", () => activarVista("tabla"));

  document.getElementById("filtro-rapido").addEventListener("change", (ev) => {
    estadoPanel.filtroRapido = ev.target.value;
    renderizarVista();
  });

  let temporizador;
  document.getElementById("buscador").addEventListener("input", (ev) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      estadoPanel.texto = ev.target.value.trim().toLowerCase();
      renderizarVista();
    }, 200);
  });

  document.querySelectorAll("#tabla-expedientes th[data-orden]").forEach((th) => {
    th.addEventListener("click", () => {
      const columna = th.dataset.orden;
      if (estadoPanel.ordeCol === columna) {
        estadoPanel.ordeAsc = !estadoPanel.ordeAsc;
      } else {
        estadoPanel.ordeCol = columna;
        estadoPanel.ordeAsc = true;
      }
      renderizarTabla();
    });
  });

  document.getElementById("btn-importar").addEventListener("click", abrirModalImportar);
  document.getElementById("btn-cancelar-importar").addEventListener("click", pecharModalImportar);
  document.getElementById("btn-confirmar-importar").addEventListener("click", confirmarImportacion);
}

function activarVista(vista, gardar = true) {
  estadoPanel.vista = vista;
  if (gardar) localStorage.setItem("vista_preferida", vista);

  document.getElementById("vista-kanban").hidden = vista !== "kanban";
  document.getElementById("vista-tabla").hidden = vista !== "tabla";
  document.getElementById("btn-vista-kanban").classList.toggle("activo", vista === "kanban");
  document.getElementById("btn-vista-tabla").classList.toggle("activo", vista === "tabla");

  renderizarVista();
}

async function cargarExpedientes() {
  estadoPanel.expedientes = await apiFetch("/expedientes?limit=500");
  renderizarVista();
  cargarAgenda();
}

async function cargarAgenda() {
  const eventos = await apiFetch("/agenda");
  estadoPanel.agenda = eventos;

  const banda = document.getElementById("banda-agenda");
  banda.innerHTML = "";

  if (eventos.length === 0) {
    banda.innerHTML = '<p class="sen-eventos">Non hai eventos programados nos vindeiros 90 días.</p>';
  } else {
    eventos.forEach((exp) => {
      const tarxeta = document.createElement("div");
      tarxeta.className = "tarxeta-axenda" + (exp.incompleto ? " incompleto" : "");
      tarxeta.innerHTML = `
        <div class="data">${formatFecha(exp.fecha_inicio_evento)}</div>
        <div class="numero">${escapeHtml(exp.expediente)}</div>
        <div class="asunto-corto">${escapeHtml((exp.asunto || "").slice(0, 40))}</div>
      `;
      tarxeta.addEventListener("click", () => {
        window.location.href = `expediente.html?id=${exp.id}`;
      });
      banda.appendChild(tarxeta);
    });
  }

  renderizarProximosKanban();
}

function eventosEnProximosDias(dias) {
  const hoxe = new Date();
  hoxe.setHours(0, 0, 0, 0);
  const limite = new Date(hoxe);
  limite.setDate(limite.getDate() + dias);

  return estadoPanel.agenda.filter((exp) => {
    if (!exp.fecha_inicio_evento) return false;
    const data = new Date(exp.fecha_inicio_evento + "T00:00:00");
    return data >= hoxe && data <= limite;
  });
}

function renderizarProximosKanban() {
  [7, 15, 30].forEach((dias) => {
    const lista = document.getElementById(`resumo-proximos-${dias}`);
    const titulo = document.getElementById(`titulo-proximos-${dias}`);
    if (!lista) return;

    const eventos = eventosEnProximosDias(dias);
    if (titulo) titulo.textContent = `Próximos ${dias} días (${eventos.length})`;

    lista.innerHTML = "";
    if (eventos.length === 0) {
      lista.innerHTML = `<li>Non hai eventos nos vindeiros ${dias} días</li>`;
      return;
    }

    eventos.forEach((exp) => {
      const item = document.createElement("li");
      item.innerHTML = `<span>${escapeHtml(exp.expediente)}</span><span>${formatFecha(exp.fecha_inicio_evento)}</span>`;
      item.addEventListener("click", () => {
        window.location.href = `expediente.html?id=${exp.id}`;
      });
      lista.appendChild(item);
    });
  });
}

function expedientesFiltrados() {
  let lista = estadoPanel.expedientes;

  if (estadoPanel.filtroRapido === "mios") {
    const id = estadoPanel.usuarioActual.id;
    lista = lista.filter((e) => e.tecnico_asignado_id === id || e.juridico_asignado_id === id);
  } else if (estadoPanel.filtroRapido === "incompletos") {
    lista = lista.filter((e) => e.incompleto);
  } else if (estadoPanel.filtroRapido === "doc-pendente") {
    lista = lista.filter((e) => e.documentacion_pendiente !== "No procede");
  }

  if (estadoPanel.texto) {
    lista = lista.filter(
      (e) =>
        e.expediente.toLowerCase().includes(estadoPanel.texto) ||
        (e.asunto || "").toLowerCase().includes(estadoPanel.texto)
    );
  }

  return lista;
}

function renderizarVista() {
  if (estadoPanel.vista === "kanban") {
    renderizarKanban();
  } else {
    renderizarTabla();
  }
}

function ordenarPorDataEvento(lista) {
  return [...lista].sort((a, b) => {
    if (!a.fecha_inicio_evento && !b.fecha_inicio_evento) return 0;
    if (!a.fecha_inicio_evento) return -1;
    if (!b.fecha_inicio_evento) return 1;
    return a.fecha_inicio_evento.localeCompare(b.fecha_inicio_evento);
  });
}

function renderizarKanban() {
  const taboleiro = document.getElementById("taboleiro-kanban");
  taboleiro.innerHTML = "";
  const lista = expedientesFiltrados();

  FASES.forEach((fase) => {
    const expedientesFase = ordenarPorDataEvento(lista.filter((e) => e.fase === fase.valor));

    const columna = document.createElement("div");
    columna.className = "columna-kanban";
    columna.innerHTML = `<h3>${fase.etiqueta} (${expedientesFase.length})</h3>`;

    expedientesFase.forEach((exp) => {
      columna.appendChild(tarxetaExpediente(exp));
    });

    taboleiro.appendChild(columna);
  });
}

function tarxetaExpediente(exp) {
  const tarxeta = document.createElement("div");
  tarxeta.className = "tarxeta-expediente" + (!exp.fecha_inicio_evento ? " sen-data" : "");
  tarxeta.innerHTML = `
    <div class="numero">${escapeHtml(exp.expediente)}</div>
    <div class="asunto">${escapeHtml(exp.asunto || "")}</div>
    <div>
      <span class="badge">${escapeHtml(etiquetaDocumentacion(exp.documentacion_pendiente))}</span>
      ${exp.incompleto ? '<span class="badge incompleto">Incompleto</span>' : ""}
    </div>
    <div class="asignados">
      Técnico: ${escapeHtml(nomeUsuario(exp.tecnico_asignado_id))} ·
      Xurídico: ${escapeHtml(nomeUsuario(exp.juridico_asignado_id))}
    </div>
  `;
  tarxeta.addEventListener("click", () => {
    window.location.href = `expediente.html?id=${exp.id}`;
  });
  return tarxeta;
}

function renderizarTabla() {
  const corpo = document.getElementById("corpo-tabla");
  corpo.innerHTML = "";
  let lista = expedientesFiltrados();

  const columna = estadoPanel.ordeCol;
  lista = [...lista].sort((a, b) => {
    let valorA = a[columna];
    let valorB = b[columna];

    if (columna === "tecnico") {
      valorA = nomeUsuario(a.tecnico_asignado_id);
      valorB = nomeUsuario(b.tecnico_asignado_id);
    } else if (columna === "juridico") {
      valorA = nomeUsuario(a.juridico_asignado_id);
      valorB = nomeUsuario(b.juridico_asignado_id);
    }

    if (!valorA && !valorB) return 0;
    if (!valorA) return -1;
    if (!valorB) return 1;

    const comparacion = String(valorA).localeCompare(String(valorB));
    return estadoPanel.ordeAsc ? comparacion : -comparacion;
  });

  lista.forEach((exp) => {
    const fila = document.createElement("tr");
    fila.className = !exp.fecha_inicio_evento ? "sen-data" : "";
    fila.innerHTML = `
      <td>${formatFecha(exp.fecha_inicio_evento)}</td>
      <td>${escapeHtml(exp.expediente)}</td>
      <td class="celda-asunto" title="${escapeHtml(exp.asunto || "")}">${escapeHtml(exp.asunto || "")}</td>
      <td>${escapeHtml(etiquetaFase(exp.fase))}</td>
      <td>${escapeHtml(etiquetaDocumentacion(exp.documentacion_pendiente))}</td>
      <td>${escapeHtml(nomeUsuario(exp.tecnico_asignado_id))}</td>
      <td>${escapeHtml(nomeUsuario(exp.juridico_asignado_id))}</td>
    `;
    fila.addEventListener("click", () => {
      window.location.href = `expediente.html?id=${exp.id}`;
    });
    corpo.appendChild(fila);
  });

  renderizarResumo(expedientesFiltrados());
}

function renderizarResumo(lista) {
  const resumoFases = document.getElementById("resumo-fases");
  resumoFases.innerHTML = "";
  FASES.forEach((fase) => {
    const total = lista.filter((e) => e.fase === fase.valor).length;
    const item = document.createElement("li");
    item.innerHTML = `<span>${fase.etiqueta}</span><strong>${total}</strong>`;
    resumoFases.appendChild(item);
  });

  const hoxe = new Date();
  hoxe.setHours(0, 0, 0, 0);
  const en7dias = new Date(hoxe);
  en7dias.setDate(en7dias.getDate() + 7);

  const proximos = lista.filter((e) => {
    if (!e.fecha_inicio_evento) return false;
    const data = new Date(e.fecha_inicio_evento + "T00:00:00");
    return data >= hoxe && data <= en7dias;
  });

  const resumoProximos = document.getElementById("resumo-proximos");
  resumoProximos.innerHTML = "";
  if (proximos.length === 0) {
    resumoProximos.innerHTML = "<li>Non hai eventos nos vindeiros 7 días</li>";
  } else {
    proximos.forEach((exp) => {
      const item = document.createElement("li");
      item.innerHTML = `<span>${escapeHtml(exp.expediente)}</span><span>${formatFecha(exp.fecha_inicio_evento)}</span>`;
      resumoProximos.appendChild(item);
    });
  }
}

/* ---------- Modal de importación ---------- */

function abrirModalImportar() {
  document.getElementById("modal-importar").hidden = false;
  document.getElementById("resultado-importacion").innerHTML = "";
  document.getElementById("ficheiro-csv").value = "";
}

function pecharModalImportar() {
  document.getElementById("modal-importar").hidden = true;
}

async function confirmarImportacion() {
  const resultado = document.getElementById("resultado-importacion");
  resultado.textContent = "A importación de CSV non está dispoñible no modo demostración (require backend real).";
}

/* ==================== Páxina: Ficha de expediente ==================== */

const estadoFicha = {
  id: null,
  expediente: null,
  usuarios: [],
};

async function initExpediente() {
  requireAuth();

  document.getElementById("btn-logout").addEventListener("click", () => {
    clearToken();
    window.location.href = "index.html";
  });

  estadoFicha.id = parametroUrl("id");
  if (!estadoFicha.id) {
    window.location.href = "panel.html";
    return;
  }

  const usuarioActual = await apiFetch("/auth/me");
  document.getElementById("usuario-actual").textContent = usuarioActual.nombre;

  estadoFicha.usuarios = await apiFetch("/usuarios");
  popularSelectorFases();
  popularSelectorDocumentacion();
  popularSelectorUsuarios("campo-tecnico", "tecnico");
  popularSelectorUsuarios("campo-juridico", "juridico");
  activarAutoFormatoData(document.getElementById("campo-fecha-inicio"));
  activarAutoFormatoData(document.getElementById("campo-fecha-fin"));

  await cargarExpediente();
  await cargarHistorico();

  document.getElementById("form-expediente").addEventListener("submit", gardarCambios);
}

function popularSelectorFases() {
  const select = document.getElementById("campo-fase");
  select.innerHTML = FASES.map((f) => `<option value="${f.valor}">${f.etiqueta}</option>`).join("");
}

function popularSelectorDocumentacion() {
  const select = document.getElementById("campo-documentacion");
  select.innerHTML = DOCUMENTACION.map((d) => `<option value="${d.valor}">${d.etiqueta}</option>`).join("");
}

function popularSelectorUsuarios(idSelector, rol) {
  const select = document.getElementById(idSelector);
  const usuariosRol = estadoFicha.usuarios.filter((u) => u.rol === rol);
  select.innerHTML =
    '<option value="">— Sen asignar —</option>' +
    usuariosRol.map((u) => `<option value="${u.id}">${escapeHtml(u.nombre)}</option>`).join("");
}

async function cargarExpediente() {
  const exp = await apiFetch(`/expedientes/${estadoFicha.id}`);
  estadoFicha.expediente = exp;

  document.getElementById("titulo-expediente").textContent = exp.expediente;
  document.title = `Expediente ${exp.expediente} — Control de expedientes`;
  document.getElementById("dato-interesado").textContent = exp.interesado || "—";
  document.getElementById("dato-asunto").textContent = exp.asunto || "—";
  document.getElementById("dato-ubicacion").textContent = exp.ubicacion || "—";
  document.getElementById("dato-fecha-expediente").textContent = formatFecha(exp.fecha_expediente);
  document.getElementById("dato-estado-origen").textContent = exp.estado_origen || "—";
  document.getElementById("dato-situacion").textContent = exp.situacion_abierto ? "Aberto" : "Pechado";
  document.getElementById("dato-fecha-creacion").textContent = formatFechaHora(exp.fecha_creacion);

  const alerta = document.getElementById("alerta-incompleto");
  if (exp.incompleto) {
    alerta.hidden = false;
    alerta.textContent =
      "Este expediente non ten datas de evento e leva máis de 3 días hábiles pendente. Revisa a documentación.";
  } else {
    alerta.hidden = true;
  }

  document.getElementById("campo-fase").value = exp.fase;
  document.getElementById("campo-documentacion").value = exp.documentacion_pendiente;
  document.getElementById("campo-fecha-inicio").value =
    exp.fecha_inicio_evento ? formatFecha(exp.fecha_inicio_evento) : "";
  document.getElementById("campo-fecha-fin").value =
    exp.fecha_fin_evento ? formatFecha(exp.fecha_fin_evento) : "";
  document.getElementById("campo-tecnico").value = exp.tecnico_asignado_id || "";
  document.getElementById("campo-juridico").value = exp.juridico_asignado_id || "";
}

async function cargarHistorico() {
  const historico = await apiFetch(`/expedientes/${estadoFicha.id}/historico`);
  const lista = document.getElementById("lista-historico");
  lista.innerHTML = "";

  if (historico.length === 0) {
    lista.innerHTML = "<li>Sen cambios rexistrados.</li>";
    return;
  }

  historico.forEach((cambio) => {
    const item = document.createElement("li");
    const partes = [];
    if (cambio.fase_nueva) {
      partes.push(`Fase: ${etiquetaFase(cambio.fase_anterior) || "—"} → ${etiquetaFase(cambio.fase_nueva)}`);
    }
    if (cambio.documentacion_nueva) {
      partes.push(
        `Documentación: ${etiquetaDocumentacion(cambio.documentacion_anterior) || "—"} → ${etiquetaDocumentacion(cambio.documentacion_nueva)}`
      );
    }
    const autor = cambio.usuario ? cambio.usuario.nombre : "—";
    item.innerHTML = `
      <div>${partes.join(" · ")}</div>
      <div class="fecha-cambio">${formatFechaHora(cambio.fecha_cambio)} · ${escapeHtml(autor)}</div>
    `;
    lista.appendChild(item);
  });
}

async function gardarCambios(ev) {
  ev.preventDefault();
  const mensaje = document.getElementById("mensaje-gardado");
  mensaje.hidden = true;

  const fechaInicio = parseFechaInput(document.getElementById("campo-fecha-inicio").value);
  const fechaFin = parseFechaInput(document.getElementById("campo-fecha-fin").value);

  if (fechaInicio === undefined || fechaFin === undefined) {
    mensaje.textContent = "Formato de data non válido. Usa dd/mm/aaaa.";
    mensaje.className = "mensaje-error";
    mensaje.hidden = false;
    return;
  }

  const corpo = {
    fase: document.getElementById("campo-fase").value,
    documentacion_pendiente: document.getElementById("campo-documentacion").value,
    fecha_inicio_evento: fechaInicio,
    fecha_fin_evento: fechaFin,
    tecnico_asignado_id: document.getElementById("campo-tecnico").value || null,
    juridico_asignado_id: document.getElementById("campo-juridico").value || null,
  };

  await apiFetch(`/expedientes/${estadoFicha.id}`, {
    method: "PATCH",
    body: JSON.stringify(corpo),
  });

  mensaje.textContent = "Cambios gardados correctamente (só nesta sesión de proba, non se conservan).";
  mensaje.className = "mensaje-ok";
  mensaje.hidden = false;

  await cargarExpediente();
  await cargarHistorico();
}

/* ==================== Arranque ==================== */

document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.body.dataset.page;
  if (pagina === "login") initLogin();
  else if (pagina === "panel") initPanel();
  else if (pagina === "expediente") initExpediente();
});
