/* =======================
   MODO OSCURO
======================= */
const interruptorTema = document.getElementById("interruptorTema");
if(localStorage.getItem("tema")==="oscuro"){
    document.body.classList.add("tema-oscuro");
    interruptorTema.checked = true;
}
interruptorTema.addEventListener("change",()=> {
    document.body.classList.toggle("tema-oscuro");
    localStorage.setItem("tema", interruptorTema.checked ? "oscuro" : "claro");
});


/* =======================
   HORAS DISPONIBLES
======================= */
const horas = [
  "08:00 - 09:00","09:00 - 10:00","10:00 - 11:00","11:00 - 12:00",
  "12:00 - 13:00","13:00 - 14:00","14:00 - 15:00","15:00 - 16:00",
  "16:00 - 17:00","17:00 - 18:00"
];

function renderDia() {
  const fecha = document.getElementById("fechaSeleccionada").value;
  const tabla = document.getElementById("tablaDia");

  if(!fecha){
    tabla.innerHTML = "<p style='margin-top:1rem;'>Seleccione una fecha.</p>";
    return;
  }

  tabla.innerHTML = "";
  horas.forEach(h => {
    tabla.innerHTML += `<div class="bloque-hora libre">${h}</div>`;
  });

  activarBloques();
}
document.getElementById("fechaSeleccionada").addEventListener("change", renderDia);


/* =======================
   MODAL
======================= */
const modal = document.getElementById("modalReserva");
const cerrarModal = document.getElementById("cerrarModal");

function abrirModal(hora) {
  modal.style.display = "block";
  document.body.classList.add("modal-abierto"); // bloquea scroll
  modal.setAttribute("data-hora", hora);
}

function activarBloques(){
  document.querySelectorAll(".bloque-hora").forEach(bloque => {
    bloque.onclick = () => abrirModal(bloque.innerText.trim());
  });
}

cerrarModal.onclick = () => {
  modal.style.display = "none";
  document.body.classList.remove("modal-abierto");
  limpiarFormularioReserva();
};


/* =======================
   CAMPOS CONDICIONALES
======================= */

// Mostrar sección "Reservar todo el CITT"
document.getElementById("reservarTodo").addEventListener("change", (e) => {
  document.getElementById("sectionTodoCITT").classList.toggle("oculto", !e.target.checked);
});

// Mostrar sección listado de artículos
document.getElementById("necesitaArticulos").addEventListener("change", (e) => {
  document.getElementById("sectionArticulos").classList.toggle("oculto", !e.target.checked);
});


/* =======================
   ARTÍCULOS
======================= */
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

document.getElementById("agregarArticulo").addEventListener("click", () => {
  const articulo = document.getElementById("selectArticulo").value;
  const cantidad = document.getElementById("cantidadArticulo").value;

  if (!articulo || cantidad < 1) return;

  listaArticulos.push({ articulo, cantidad });

  renderizarLista();
});

function eliminarArticulo(index) {
  listaArticulos.splice(index, 1);
  renderizarLista();
}


/* =======================
   POPUP + ENVIAR FORMULARIO
======================= */
document.getElementById("formReserva").addEventListener("submit", (e) => {
  e.preventDefault();

  // Ocultar modal + desbloquear scroll
  modal.style.display = "none";
  document.body.classList.remove("modal-abierto");

  // Limpiar formulario
  limpiarFormularioReserva();

  // Mostrar popup de éxito
  document.getElementById("popupExito").classList.remove("popup-oculto");
});

// Botón cerrar popup
document.getElementById("cerrarPopup").addEventListener("click", () => {
  document.getElementById("popupExito").classList.add("popup-oculto");
  document.body.classList.remove("modal-abierto");
});


/* =======================
   LIMPIAR FORMULARIO
======================= */
function limpiarFormularioReserva() {

  // Limpia todos los inputs y textareas
  document.querySelectorAll("#modalReserva input, #modalReserva textarea").forEach(campo => {
    if (campo.type === "checkbox") {
      campo.checked = false;
    } else {
      campo.value = "";
    }
  });

  // Vaciar lista interna y visual
  listaArticulos = [];
  renderizarLista();

  // Ocultar secciones opcionales
  document.getElementById("sectionTodoCITT").classList.add("oculto");
  document.getElementById("sectionArticulos").classList.add("oculto");
}
