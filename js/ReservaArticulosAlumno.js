document.addEventListener("DOMContentLoaded", () => {

  const tablaStock = document.querySelector("#tablaStock tbody");
  const selectArticulo = document.getElementById("articulo");
  const form = document.getElementById("formReservaArticulos");
  const popup = document.getElementById("popupExito");
  const cerrarPopup = document.getElementById("cerrarPopup");
  const mensaje = document.getElementById("mensajeError"); // 📢 Nuevo contenedor para errores

  // 🔒 Ocultar popup al iniciar
  popup.classList.add("popup-oculto");

  // Simulación de stock
  const articulos = [
    { nombre: "Notebook", descripcion: "Portátil HP con Office instalado", disponible: 7 },
    { nombre: "Proyector", descripcion: "Proyector Epson 1080p", disponible: 3 },
    { nombre: "Cámara", descripcion: "Cámara Canon EOS", disponible: 2 },
    { nombre: "Micrófono", descripcion: "Micrófono condensador USB", disponible: 6 },
    { nombre: "Tablet", descripcion: "Tablet Samsung Galaxy Tab A", disponible: 4 }
  ];

  // ================================
  // 📦 Renderizar stock
  // ================================
  function renderizarStock() {
    tablaStock.innerHTML = "";
    articulos.forEach(a => {
      tablaStock.innerHTML += `
        <tr>
          <td>${a.nombre}</td>
          <td>${a.descripcion}</td>
          <td>${a.disponible}</td>
        </tr>`;
    });

    // llenar select
    selectArticulo.innerHTML = `<option value="">Seleccione...</option>`;
    articulos.forEach(a => {
      selectArticulo.innerHTML += `<option value="${a.nombre}">${a.nombre} (Disp: ${a.disponible})</option>`;
    });
  }

  renderizarStock();

  // ================================
  // 🔢 Validación RUT Chileno
  // ================================
  function validarRut(rut) {
    rut = rut.replace(/[.\-]/g, "").toUpperCase();
    if (rut.length < 8 || rut.length > 9) return false;

    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplo;
      multiplo = multiplo === 7 ? 2 : multiplo + 1;
    }

    const resto = 11 - (suma % 11);
    const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);

    return dv === dvEsperado;
  }

  // ================================
  // 📋 Enviar reserva
  // ================================
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    mensaje.textContent = ""; // limpiar mensaje anterior
    mensaje.classList.remove("visible");

    const articulo = selectArticulo.value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const motivo = document.getElementById("motivo").value;
    const rut = document.getElementById("rut").value.trim();

    if (!articulo || !cantidad || !fecha || !hora || !motivo || !rut) {
      mostrarMensaje("Por favor, completa todos los campos.", "error");
      return;
    }

    // ✅ Validar RUT antes de guardar
    if (!validarRut(rut)) {
      mostrarMensaje("El RUT ingresado no es válido. Ejemplo: 12345678-9", "error");
      return;
    }

    // Validar stock
    const articuloObj = articulos.find(a => a.nombre === articulo);
    if (!articuloObj || cantidad > articuloObj.disponible) {
      mostrarMensaje(`No hay suficiente stock disponible para "${articulo}".`, "error");
      return;
    }

    // Guardar reserva en localStorage
    const reservas = JSON.parse(localStorage.getItem("reservasCITT")) || [];
    reservas.push({ rut, articulo, cantidad, fecha, hora, motivo });
    localStorage.setItem("reservasCITT", JSON.stringify(reservas));

    // Actualizar stock
    articuloObj.disponible -= cantidad;
    renderizarStock();

    // Mostrar popup
    form.reset();
    popup.classList.remove("popup-oculto");
  });

  // ================================
  // 🧾 Mostrar mensaje de error
  // ================================
  function mostrarMensaje(texto, tipo = "error") {
    mensaje.textContent = texto;
    mensaje.className = tipo === "error" ? "mensaje-error visible" : "mensaje-ok visible";
  }

  // ================================
  // 🔙 Cerrar popup
  // ================================
  cerrarPopup.addEventListener("click", () => {
    popup.classList.add("popup-oculto");
  });
});
