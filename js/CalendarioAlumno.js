document.addEventListener("DOMContentLoaded", () => {

  const fechaInput = document.getElementById("fechaCalendario");
  const tablaDia = document.getElementById("tablaDia");
  const tablaSemana = document.getElementById("tablaSemana");
  const tituloDia = document.getElementById("tituloDia");
  const btnDiario = document.getElementById("btnDiario");
  const btnSemanal = document.getElementById("btnSemanal");

  /* ===============================
     FECHAS (sin UTC)
  =============================== */
  function parseLocalDate(yyyy_mm_dd) {
    const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  function formatYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const fmtDiaLargo = new Intl.DateTimeFormat("es-CL", {
    weekday: "long", day: "numeric", month: "long"
  });
  const fmtFechaCorta = new Intl.DateTimeFormat("es-CL", {
    day: "numeric", month: "long"
  });

  if (!fechaInput.value) {
    fechaInput.value = formatYYYYMMDD(new Date());
  }

  /* ===============================
     HORARIOS
     - Lun–Vie: 08–23 (22–23 último bloque)
     - Sáb:     08–18 (17–18 último bloque)
     - Dom:     sin clases
  =============================== */
  function buildHourBlocks(startHour, endHourExclusive) {
    const blocks = [];
    for (let h = startHour; h < endHourExclusive; h++) {
      const h1 = String(h).padStart(2, "0");
      const h2 = String((h + 1)).padStart(2, "0");
      blocks.push(`${h1}:00 - ${h2}:00`);
    }
    return blocks;
  }
  const HOURS_WEEKDAY = buildHourBlocks(8, 23); // 08-09 ... 22-23  (15 bloques)
  const HOURS_SAT     = buildHourBlocks(8, 18); // 08-09 ... 17-18  (10 bloques)

  function hoursForDay(dow) {
    // dow: 0=Dom, 1=Lun ... 6=Sáb
    if (dow === 0) return [];           // Domingo
    if (dow === 6) return HOURS_SAT;    // Sábado
    return HOURS_WEEKDAY;               // Lun–Vie
  }

  /* ===============================
     VISTA DIARIA
  =============================== */
  function renderDia(fecha) {
    tablaDia.innerHTML = "";
    const dow = fecha.getDay();
    const hours = hoursForDay(dow);

    if (dow === 0 || hours.length === 0) {
      tituloDia.textContent = fmtDiaLargo.format(fecha);
      const aviso = document.createElement("div");
      aviso.className = "aviso-no-clases";
      aviso.textContent = "No hay clases este día.";
      tablaDia.appendChild(aviso);
      return;
    }

    tituloDia.textContent = fmtDiaLargo.format(fecha);

    hours.forEach(h => {
      const div = document.createElement("div");
      div.className = "bloque-hora libre";
      div.textContent = h;
      // Simulación de ocupado/libre
      if (Math.random() > 0.7) div.classList.replace("libre", "ocupado");
      tablaDia.appendChild(div);
    });
  }

  function renderDiaDesdeInput() {
    if (!fechaInput.value) return;
    renderDia(parseLocalDate(fechaInput.value));
  }

  /* ===============================
     VISTA SEMANAL (Lun–Sáb, sin Domingo)
  =============================== */
  function mondayOf(fecha) {
    const f = new Date(fecha);
    const dow = f.getDay(); // 0=Dom, 1=Lun ... 6=Sáb
    const offset = dow === 0 ? 1 : 1 - dow; // si es domingo, ir a lunes siguiente
    f.setDate(f.getDate() + offset);
    return f;
  }

  function renderSemana(fechaBase) {
    tablaSemana.innerHTML = "";

    const lunes = mondayOf(fechaBase);
    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5);

    // Título con rango Lun–Sáb
    const tituloSemana = document.createElement("h2");
    tituloSemana.classList.add("titulo-semana");
    tituloSemana.textContent = `Semana del ${fmtFechaCorta.format(lunes)} al ${fmtFechaCorta.format(sabado)}`;
    tablaSemana.appendChild(tituloSemana);

    // Cabeceras
    const dias = ["Hora", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const grid = document.createElement("div");
    grid.classList.add("tabla-semana-grid");

    dias.forEach(dia => {
      const div = document.createElement("div");
      div.classList.add("celda", "encabezado");
      div.textContent = dia;
      grid.appendChild(div);
    });

    // Número de filas = máximo de bloques (Lun–Vie = 15)
    const maxRows = HOURS_WEEKDAY.length;

    for (let r = 0; r < maxRows; r++) {
      // Columna hora (usar la referencia de Lun–Vie)
      const divHora = document.createElement("div");
      divHora.classList.add("celda", "hora");
      divHora.textContent = HOURS_WEEKDAY[r];
      grid.appendChild(divHora);

      // Columnas Lunes(1) a Sábado(6)
      for (let dow = 1; dow <= 6; dow++) {
        const list = hoursForDay(dow);
        const cell = document.createElement("div");
        cell.classList.add("celda");

        if (r < list.length) {
          // Hora válida de ese día (dentro de horario)
          cell.classList.add(Math.random() > 0.7 ? "ocupado" : "libre");
          // Opcional: cell.textContent = list[r]; // si quieres mostrar el rango en cada celda
        } else {
          // Fuera de horario (solo pasará en sábado de 18:00 en adelante)
          cell.classList.add("no-clases");
          cell.textContent = "—";
        }

        grid.appendChild(cell);
      }
    }

    tablaSemana.appendChild(grid);
  }

  /* ===============================
     BOTONES / EVENTOS
  =============================== */
  btnDiario.addEventListener("click", () => {
    btnDiario.classList.add("activo");
    btnSemanal.classList.remove("activo");
    document.getElementById("vistaDiaria").classList.add("visible");
    document.getElementById("vistaSemanal").classList.remove("visible");
    renderDiaDesdeInput();
  });

  btnSemanal.addEventListener("click", () => {
    btnSemanal.classList.add("activo");
    btnDiario.classList.remove("activo");
    document.getElementById("vistaSemanal").classList.add("visible");
    document.getElementById("vistaDiaria").classList.remove("visible");
    const fecha = parseLocalDate(fechaInput.value);
    renderSemana(fecha);
  });

  // Actualizar automáticamente según la vista activa
  fechaInput.addEventListener("change", () => {
    const fecha = parseLocalDate(fechaInput.value);
    if (btnSemanal.classList.contains("activo")) {
      renderSemana(fecha);
    } else {
      renderDia(fecha);
    }
  });

  // Inicialización
  renderDiaDesdeInput();
});
