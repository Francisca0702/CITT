// Colores por espacio / exclusividad (mismo mapa que GestionReservas)
const COLOR_EVENTOS = {
  "Sala de reuniones": "#10b981", // verde
  "Cápsula A": "#3b82f6", // azul
  "Sala CIIT completa": "#f97316", // naranjo
  _default: "#307FE2",
  _exclusivo: "#e11d48", // rojo fuerte
};

// Eventos aprobados guardados por GestionReservasCoordinador
const EVENTS_LS_KEY = "citt_eventos_aprobados";
const eventosAprobados = JSON.parse(
  localStorage.getItem(EVENTS_LS_KEY) || "{}"
);

// Eventos "base" de este calendario (mock visibles siempre)
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
  {
    id: "e3",
    title: "Cápsula B - Edición",
    start: "2025-11-15T14:00:00",
    end: "2025-11-15T15:00:00",
    espacio: "Cápsula A",
    exclusivo: false,
    solicitante: "demo2@duocuc.cl",
    personas: 3,
    articulos: ["Micrófono", "Cámara"],
    detalle: "Prueba de edición en cápsula",
  },
  {
    id: "e4",
    title: "Cápsula A - Edición",
    start: "2025-11-19T14:00:00",
    end: "2025-11-19T15:00:00",
    espacio: "Cápsula A",
    exclusivo: false,
    solicitante: "demo2@duocuc.cl",
    personas: 3,
    articulos: ["Micrófono", "Cámara"],
    detalle: "Prueba de edición en cápsula",
  },
];

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: window.innerWidth < 800 ? "timeGridDay" : "timeGridWeek",
    locale: "es",
    buttonText: {
      today: "Hoy",
      timeGridWeek: "Semana",
      timeGridDay: "Día",
    },
    expandRows: true,
    height: "auto",
    nowIndicator: true,
    slotDuration: "00:30:00",
    slotMinTime: "08:00:00",
    slotMaxTime: "23:00:00",
    allDaySlot: false,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "timeGridWeek,timeGridDay",
    },

    // Eventos base (mock)
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

      const el = info.el;
      el.style.backgroundColor = color;
      el.style.borderColor = color;
      el.style.color = "#ffffff";
    },

    eventClick: (info) => {
      const ev = info.event;
      const ext = ev.extendedProps || {};

      // Si vino desde GestionReservas, ya trae la solicitud completa
      if (ext.solicitud) {
        abrirDetalle(ext.solicitud);
        return;
      }

      // Si es un evento mock "sueltito", armamos un objeto tipo solicitud
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

    windowResize: () => {
      calendar.changeView(
        window.innerWidth < 800 ? "timeGridDay" : "timeGridWeek"
      );
    },
  });

  calendar.render();

  // Agregar también los eventos aprobados de GestionReservasCoordinador
  Object.values(eventosAprobados).forEach((evt) => calendar.addEvent(evt));

  // ----- Modal detalle (solo lectura) -----
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

  if (btnCerrarDetalle) {
    btnCerrarDetalle.addEventListener("click", cerrarDetalle);
  }

  overlayDetalle.addEventListener("click", (e) => {
    if (e.target === overlayDetalle) cerrarDetalle();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarDetalle();
  });
});
