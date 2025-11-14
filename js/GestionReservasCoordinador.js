// Colores por espacio / exclusividad
const COLOR_EVENTOS = {
  // por espacio
  "Sala de reuniones": "#10b981", // verde
  "Cápsula A": "#3b82f6", // azul
  "Sala CIIT completa": "#f97316", // naranjo

  // fallback
  _default: "#307FE2",

  // si es exclusivo, este manda
  _exclusivo: "#e11d48", // rojo fuerte
};


// ---------- Datos mock de calendario y solicitudes ----------
const EVENTS_LS_KEY = "citt_eventos_aprobados";
const eventosAprobados = JSON.parse(
  localStorage.getItem(EVENTS_LS_KEY) || "{}"
);

const eventosMock = [
  {
    id: "e1",
    title: "Reserva Sala 1 - Taller",
    start: "2025-11-06T10:00:00",
    end: "2025-11-06T12:00:00",
    espacio: "Sala de reuniones",
    exclusivo: false,
    solicitante: "demo@duocuc.cl",
    personas: 10,
    articulos: ["Proyector"],
    detalle: "Actividad demo cargada por defecto",
  },
  {
    id: "e2",
    title: "Cápsula A - Edición",
    start: "2025-11-07T14:00:00",
    end: "2025-11-07T15:00:00",
    espacio: "Cápsula A",
    exclusivo: false,
    solicitante: "demo2@duocuc.cl",
    personas: 3,
    articulos: ["Micrófono", "Cámara"],
    detalle: "Prueba de edición en cápsula",
  },
];

// Persistencia simple para estado de solicitudes en mock
const ESTADOS_LS_KEY = "citt_estados_solicitudes";
const estadosPersistidos = JSON.parse(
  localStorage.getItem(ESTADOS_LS_KEY) || "{}"
);

const solicitudesMock = [
  {
    id: "s1",
    titulo: "Sala de reuniones",
    solicitante: "jperez@duocuc.cl",
    fecha: "2025-11-08",
    inicio: "09:30",
    fin: "11:00",
    espacio: "Sala de reuniones",
    detalle: "Reunión proyecto IoT",
    personas: 8,
    exclusivo: false, // solo una sección
    articulos: ["Proyector", "Notebook (2)"],
    eventoRef: null,
  },
  {
    id: "s2",
    titulo: "Cápsula A (streaming)",
    solicitante: "mrojas@duocuc.cl",
    fecha: "2025-11-08",
    inicio: "12:00",
    fin: "13:00",
    espacio: "Cápsula A",
    detalle: "Grabación cápsula Clase 6",
    personas: 3,
    exclusivo: false,
    articulos: ["Micrófonos inalámbricos (2)"],
    eventoRef: null,
  },
  {
    id: "s3",
    titulo: "Sitio personal 3",
    solicitante: "florente@duocuc.cl",
    fecha: "2025-11-09",
    inicio: "15:00",
    fin: "17:30",
    espacio: "Sala CIIT completa",
    detalle: "Prototipo impresión 3D",
    personas: 15,
    exclusivo: true, // pide exclusividad
    articulos: ["Impresora 3D", "Notebook", "Cámara"],
    eventoRef: null,
  },
].map((s) => ({ ...s, estado: estadosPersistidos[s.id] || "pendiente" }));

// ---------- Calendario ----------
document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: window.innerWidth < 800 ? "timeGridDay" : "timeGridWeek",
    locale: "es",
    buttonText: {
      today: "Hoy",
      timeGridWeek: "Semana", // o "semana"
      timeGridDay: "Día", // o "día"
    },
    expandRows: true,
    height: "auto", // <– clave: sin altura fija
    contentHeight: "auto", // opcional, ayuda a que crezca
    nowIndicator: true,
    slotDuration: "00:30:00",
    snapDuration: "00:15:00",
    slotMinTime: "08:00:00",
    slotMaxTime: "23:00:00",
    allDaySlot: false,
    selectable: true,
    selectMirror: true,
    dayMaxEventRows: 3,
    eventOverlap: false,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "timeGridWeek,timeGridDay",
    },
    events: eventosMock,
    eventDidMount: (info) => {
      const { espacio, exclusivo } = info.event.extendedProps || {};

      let color;

      if (exclusivo) {
        color = COLOR_EVENTOS["_exclusivo"];
      } else if (espacio && COLOR_EVENTOS[espacio]) {
        color = COLOR_EVENTOS[espacio];
      } else {
        color = COLOR_EVENTOS["_default"];
      }

      // Pintar el bloque entero
      const el = info.el;
      el.style.backgroundColor = color;
      el.style.borderColor = color;
      el.style.color = "#ffffff"; // texto blanco para contraste
    },
    eventClick: (info) => {
      const ev = info.event;
      const ext = ev.extendedProps || {};

      // Si viene de una solicitud aprobada, usamos la solicitud original
      if (ext.solicitud) {
        abrirDetalle(ext.solicitud);
        return;
      }

      // Si es un evento "sueltito" (eventosMock, etc.), armamos un objeto tipo solicitud
      const start = ev.start;
      const end = ev.end || ev.start;

      const pad = (n) => String(n).padStart(2, "0");

      const fecha = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(
        start.getDate()
      )}`;
      const inicio = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
      const fin = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

      const solFake = {
        titulo: ev.title,
        espacio: ext.espacio || ev.title,
        fecha,
        inicio,
        fin,
        solicitante: ext.solicitante || "No indicado",
        personas: ext.personas != null ? ext.personas : "No indicado",
        exclusivo: ext.exclusivo || false,
        articulos: ext.articulos || [],
        detalle: ext.detalle || "",
      };

      abrirDetalle(solFake);
    },

    // solo cambiamos la vista según ancho, ya NO tocamos height
    windowResize: () => {
      calendar.changeView(
        window.innerWidth < 800 ? "timeGridDay" : "timeGridWeek"
      );
    },
  });

  calendar.render();

  // ----- Modal detalle -----
  const overlayDetalle = document.getElementById("overlayDetalle");
  const detalleContenido = document.getElementById("detalleContenido");
  const btnCerrarDetalle = document.getElementById("btnCerrarDetalle");

  const abrirDetalle = (sol) => {
    const exclusividadTexto = sol.exclusivo
      ? "Sí, uso exclusivo de la sala CIIT"
      : "No, solo una sección / espacio específico";

    const articulosTexto =
      sol.articulos && sol.articulos.length
        ? sol.articulos.join(", ")
        : "Sin artículos asociados";

    detalleContenido.innerHTML = `
            <div class="detalle-grid">
              <div>
                <strong>Espacio</strong>
                <span>${sol.espacio || sol.titulo}</span>
              </div>
              <div>
                <strong>Fecha</strong>
                <span>${sol.fecha}</span>
              </div>
              <div>
                <strong>Horario</strong>
                <span>${sol.inicio} - ${sol.fin}</span>
              </div>
              <div>
                <strong>Solicitante</strong>
                <span>${sol.solicitante}</span>
              </div>
              <div>
                <strong>N° de personas</strong>
                <span>${sol.personas || "No indicado"}</span>
              </div>
              <div>
                <strong>Exclusividad</strong>
                <span>${exclusividadTexto}</span>
              </div>
            </div>
            <div class="detalle-nota">
              <strong>Artículos solicitados:</strong><br/>
              <span>${articulosTexto}</span>
            </div>
            <div class="detalle-nota">
              <strong>Detalle adicional:</strong><br/>
              <span>${sol.detalle || "Sin detalle adicional"}</span>
            </div>
          `;

    overlayDetalle.classList.add("activo");
    overlayDetalle.setAttribute("aria-hidden", "false");
  };

  const cerrarDetalle = () => {
    overlayDetalle.classList.remove("activo");
    overlayDetalle.setAttribute("aria-hidden", "true");
  };

  btnCerrarDetalle.addEventListener("click", cerrarDetalle);

  // Cerrar al hacer click fuera de la tarjeta
  overlayDetalle.addEventListener("click", (e) => {
    if (e.target === overlayDetalle) cerrarDetalle();
  });

  // Cerrar con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarDetalle();
  });

  Object.values(eventosAprobados).forEach((evt) => calendar.addEvent(evt));

  // ---------- Renderizar solicitudes debajo (en tabla) ----------
  const cont = document.getElementById("listaSolicitudes"); // <tbody>

  const renderChip = (estado) => {
    const span = document.createElement("span");
    span.className = `chip ${estado}`;
    span.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
    return span;
  };

  const guardarEstado = (id, estado) => {
    estadosPersistidos[id] = estado;
    localStorage.setItem(ESTADOS_LS_KEY, JSON.stringify(estadosPersistidos));
  };

  const manejarAccion = (sol, accion, chip, btnAceptar, btnRechazar) => {
    const startISO = `${sol.fecha}T${sol.inicio}:00`;
    const endISO = `${sol.fecha}T${sol.fin}:00`;

    const haySolape = () => {
      const s = new Date(startISO).getTime();
      const e = new Date(endISO).getTime();
      return calendar.getEvents().some((ev) => {
        const es = ev.start?.getTime() ?? 0;
        const ee = ev.end?.getTime() ?? es;
        return Math.max(s, es) < Math.min(e, ee);
      });
    };

    if (accion === "aceptar") {
      if (
        haySolape() &&
        !confirm("Conflicto con otra reserva. ¿Forzar aceptación igualmente?")
      ) {
        return;
      }
      sol.estado = "aceptada";

      const evt = {
        id: `aprob-${sol.id}`,
        title: `${sol.espacio} - ${sol.solicitante.split("@")[0]}`,
        start: startISO,
        end: endISO,
        espacio: sol.espacio,
        exclusivo: sol.exclusivo,
        // guardamos la solicitud completa para el modal
        solicitud: { ...sol },
      };

      calendar.addEvent(evt);
      eventosAprobados[sol.id] = evt;
      localStorage.setItem(EVENTS_LS_KEY, JSON.stringify(eventosAprobados));
    } else {
      sol.estado = "rechazada";
      const ev = calendar.getEventById(`aprob-${sol.id}`);
      if (ev) ev.remove();
      delete eventosAprobados[sol.id];
      localStorage.setItem(EVENTS_LS_KEY, JSON.stringify(eventosAprobados));
    }

    // UI
    chip.className = `chip ${sol.estado}`;
    chip.textContent = sol.estado.charAt(0).toUpperCase() + sol.estado.slice(1);
    btnAceptar.disabled = true;
    btnRechazar.disabled = true;
    guardarEstado(sol.id, sol.estado);
  };

  solicitudesMock.forEach((sol) => {
    const tr = document.createElement("tr");

    const tdEspacio = document.createElement("td");
    tdEspacio.textContent = sol.espacio || sol.titulo;

    const tdFecha = document.createElement("td");
    tdFecha.textContent = sol.fecha;

    const tdHorario = document.createElement("td");
    tdHorario.textContent = `${sol.inicio} - ${sol.fin}`;

    const tdSolicitante = document.createElement("td");
    tdSolicitante.textContent = sol.solicitante;

    const tdDetalle = document.createElement("td");
    tdDetalle.textContent = sol.detalle;

    const tdEstado = document.createElement("td");
    const chip = renderChip(sol.estado);
    tdEstado.appendChild(chip);

    const tdAcciones = document.createElement("td");
    tdAcciones.className = "acciones-solicitud";

    const btnAceptar = document.createElement("button");
    btnAceptar.className = "btn btn-aceptar";
    btnAceptar.textContent = "Aceptar";

    const btnRechazar = document.createElement("button");
    btnRechazar.className = "btn btn-rechazar";
    btnRechazar.textContent = "Rechazar";

    if (sol.estado !== "pendiente") {
      btnAceptar.disabled = true;
      btnRechazar.disabled = true;
    }

    tr.addEventListener("click", () => {
      abrirDetalle(sol);
    });

    // Evitar que los botones disparen también el click de la fila
    btnAceptar.addEventListener("click", (e) => {
      e.stopPropagation();
      manejarAccion(sol, "aceptar", chip, btnAceptar, btnRechazar);
    });

    btnRechazar.addEventListener("click", (e) => {
      e.stopPropagation();
      manejarAccion(sol, "rechazar", chip, btnAceptar, btnRechazar);
    });

    tdAcciones.appendChild(btnAceptar);
    tdAcciones.appendChild(btnRechazar);

    tr.appendChild(tdEspacio);
    tr.appendChild(tdFecha);
    tr.appendChild(tdHorario);
    tr.appendChild(tdSolicitante);
    tr.appendChild(tdDetalle);
    tr.appendChild(tdEstado);
    tr.appendChild(tdAcciones);

    cont.appendChild(tr);
  });
});
