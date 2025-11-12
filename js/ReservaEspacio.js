/* =======================
   RESERVA ESPACIO - VERSIÓN FINAL
   (con espera del DOM y logs de depuración)
======================= */

document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ ReservaEspacio.js cargado correctamente");

  /* =======================
     MODO OSCURO
  ======================== */
  const interruptorTema = document.getElementById("interruptorTema");
  if (interruptorTema) {
    if (localStorage.getItem("tema") === "oscuro") {
      document.body.classList.add("tema-oscuro");
      interruptorTema.checked = true;
    }
    interruptorTema.addEventListener("change", () => {
      document.body.classList.toggle("tema-oscuro");
      localStorage.setItem("tema", interruptorTema.checked ? "oscuro" : "claro");
    });
  }

  /* =======================
     HORAS DISPONIBLES
  ======================== */
  const horas = [
    "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
    "16:00 - 17:00", "17:00 - 18:00"
  ];

  const fechaInput = document.getElementById("fechaSeleccionada");
  const tablaDia = document.getElementById("tablaDia");

  function renderDia() {
    console.log("📅 renderDia() ejecutado");
    const fecha = fechaInput.value;
    if (!fecha) {
      tablaDia.innerHTML = "<p style='margin-top:1rem;'>Seleccione una fecha.</p>";
      return;
    }

    tablaDia.innerHTML = "";
    horas.forEach(h => {
      tablaDia.innerHTML += `<div class="bloque-hora libre">${h}</div>`;
    });
    activarBloques();
  }

  if (fechaInput) {
    fechaInput.addEventListener("change", renderDia);
    console.log("✅ Evento change conectado correctamente");
  }

  /* =======================
     MODAL
  ======================== */
  const modal = document.getElementById("modalReserva");
  const cerrarModal = document.getElementById("cerrarModal");

  function abrirModal(hora) {
    modal.style.display = "block";
    document.body.classList.add("modal-abierto");
    modal.setAttribute("data-hora", hora);
  }

  function activarBloques() {
    document.querySelectorAll(".bloque-hora").forEach(bloque => {
      bloque.onclick = () => abrirModal(bloque.innerText.trim());
    });
  }

  if (cerrarModal) {
    cerrarModal.onclick = () => {
      modal.style.display = "none";
      document.body.classList.remove("modal-abierto");
      limpiarFormularioReserva();
    };
  }

  /* =======================
     CAMPOS CONDICIONALES
  ======================== */
  const chkTodo = document.getElementById("reservarTodo");
  if (chkTodo) {
    chkTodo.addEventListener("change", (e) => {
      document.getElementById("sectionTodoCITT").classList.toggle("oculto", !e.target.checked);
    });
  }

  const chkArticulos = document.getElementById("necesitaArticulos");
  if (chkArticulos) {
    chkArticulos.addEventListener("change", (e) => {
      document.getElementById("sectionArticulos").classList.toggle("oculto", !e.target.checked);
    });
  }

  /* =======================
     ARTÍCULOS
  ======================== */
  let listaArticulos = [];

  function renderizarLista() {
    const listaUI = document.getElementById("listaSeleccionArticulos");
    listaUI.innerHTML = "";

    listaArticulos.forEach((item, index) => {
      listaUI.innerHTML += `
        <li>
          ${item.articulo} — <strong>${item.cantidad} u.</strong>
          <button onclick="eliminarArticulo(${index})">✕</button>
        </li>`;
    });
  }

  const btnAgregar = document.getElementById("agregarArticulo");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      const articulo = document.getElementById("selectArticulo").value;
      const cantidad = document.getElementById("cantidadArticulo").value;

      if (!articulo || cantidad < 1) return;

      listaArticulos.push({ articulo, cantidad });
      renderizarLista();
    });
  }

  window.eliminarArticulo = function (index) {
    listaArticulos.splice(index, 1);
    renderizarLista();
  };

  /* =======================
     POPUP + ENVIAR FORMULARIO
  ======================== */
  const form = document.getElementById("formReserva");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      modal.style.display = "none";
      document.body.classList.remove("modal-abierto");

      limpiarFormularioReserva();

      document.getElementById("popupExito").classList.remove("popup-oculto");
    });
  }

  const cerrarPopup = document.getElementById("cerrarPopup");
  if (cerrarPopup) {
    cerrarPopup.addEventListener("click", () => {
      document.getElementById("popupExito").classList.add("popup-oculto");
      document.body.classList.remove("modal-abierto");
    });
  }

  /* =======================
     LIMPIAR FORMULARIO
  ======================== */
  function limpiarFormularioReserva() {
    document.querySelectorAll("#modalReserva input, #modalReserva textarea").forEach(campo => {
      if (campo.type === "checkbox") {
        campo.checked = false;
      } else {
        campo.value = "";
      }
    });

    listaArticulos = [];
    renderizarLista();

    document.getElementById("sectionTodoCITT").classList.add("oculto");
    document.getElementById("sectionArticulos").classList.add("oculto");
  }

});
