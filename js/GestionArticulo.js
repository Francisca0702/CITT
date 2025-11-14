/* =========================================================
   DATOS EN LOCALSTORAGE
========================================================= */

// Lista de artículos
let articulos = JSON.parse(localStorage.getItem("articulosCITT")) || [];

// Solicitudes realizadas por usuarios (TARJETA nueva)
let solicitudes = JSON.parse(localStorage.getItem("solicitudesCITT")) || [];

// Historial de préstamos + devoluciones
let historial = JSON.parse(localStorage.getItem("historialCITT")) || [];


/* =========================================================
   GUARDAR LOCALSTORAGE
========================================================= */
function guardarDatos() {
    localStorage.setItem("articulosCITT", JSON.stringify(articulos));
    localStorage.setItem("solicitudesCITT", JSON.stringify(solicitudes));
    localStorage.setItem("historialCITT", JSON.stringify(historial));
}


/* =========================================================
   TABLA PRINCIPAL (solo información)
========================================================= */
function renderTabla() {
    const tabla = document.getElementById("tablaGestion");
    tabla.innerHTML = "";

    if (articulos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="4">No hay artículos registrados</td></tr>`;
        return;
    }

    articulos.forEach(a => {
        tabla.innerHTML += `
            <tr>
                <td>${a.codigo}</td>
                <td>${a.nombre}</td>
                <td>${a.categoria}</td>
                <td>
                    <span class="estado-${a.estado}">
                        ${a.estado.charAt(0).toUpperCase() + a.estado.slice(1)}
                    </span>
                </td>
            </tr>
        `;
    });
}


/* =========================================================
   MODAL — PRÉSTAMO DIRECTO (desde tabla)
========================================================= */

let indexPrestamo = null;

function abrirModalPrestamo(index) {
    indexPrestamo = index;
    const articulo = articulos[index];

    document.getElementById("nombrePrestamo").innerText =
        `Artículo: ${articulo.nombre}`;

    document.getElementById("modalPrestamo").style.display = "flex";
}

function cerrarModalPrestamo() {
    document.getElementById("modalPrestamo").style.display = "none";
}

document.getElementById("confirmarPrestamo").addEventListener("click", () => {
    const articulo = articulos[indexPrestamo];
    const solicitante = document.getElementById("solicitante").value.trim();
    const rut = document.getElementById("rutSolicitante").value.trim();
    const obs = document.getElementById("obsPrestamo").value.trim();

    if (!solicitante || !rut) {
        alert("Debe ingresar solicitante y RUT.");
        return;
    }

    articulo.estado = "prestado";

    solicitudes.push({
        codigo: articulo.codigo,
        articulo: articulo.nombre,
        solicitante,
        rut,
        fecha: new Date().toLocaleString("es-CL"),
        obs
    });

    historial.push({
        accion: "préstamo",
        articulo: articulo.nombre,
        solicitante,
        rut,
        fecha: new Date().toLocaleString("es-CL"),
        obs
    });

    guardarDatos();
    cerrarModalPrestamo();
    renderTabla();
    renderSolicitudes();
    renderSolicitudesUsuarios();
});


/* =========================================================
   MODAL — DEVOLUCIÓN
========================================================= */

let indexDevolucion = null;

function abrirModalDevolucion(index) {
    indexDevolucion = index;
    const articulo = articulos[index];

    document.getElementById("nombreDevolucion").innerText =
        `Artículo: ${articulo.nombre}`;

    document.getElementById("modalDevolucion").style.display = "flex";
}

function cerrarModalDevolucion() {
    document.getElementById("modalDevolucion").style.display = "none";
}

document.getElementById("confirmarDevolucion").addEventListener("click", () => {
    const nuevoEstado = document.getElementById("estadoDevolucion").value;
    const comentario = document.getElementById("descripcionDaño").value.trim();
    const articulo = articulos[indexDevolucion];

    articulo.estado = nuevoEstado;

    historial.push({
        accion: "devolución",
        articulo: articulo.nombre,
        estadoFinal: nuevoEstado,
        comentario,
        fecha: new Date().toLocaleString("es-CL")
    });

    solicitudes = solicitudes.filter(s => s.codigo !== articulo.codigo);

    guardarDatos();
    cerrarModalDevolucion();
    renderTabla();
    renderSolicitudes();
    renderSolicitudesUsuarios();
    renderDevoluciones();
});


/* =========================================================
   TARJETA — PRÉSTAMOS PENDIENTES
========================================================= */
function renderSolicitudes() {
    const cont = document.getElementById("listaSolicitudes");
    if (!cont) return;

    cont.innerHTML = "";

    if (solicitudes.length === 0) {
        cont.innerHTML = `<p class="vacio">No hay préstamos en curso.</p>`;
        return;
    }

    solicitudes.forEach(s => {
        cont.innerHTML += `
            <div class="item-solicitud">
                <div>
                    <span>${s.articulo}</span><br>
                    <small>Solicitado por: ${s.solicitante}</small>
                </div>

                <button class="btn-accion"
                    onclick="abrirModalDevolucion(${buscarArticuloPorCodigo(s.codigo)})">
                    Recibir devolución
                </button>
            </div>
        `;
    });
}


/* =========================================================
   TARJETA — SOLICITUDES DE USUARIOS
========================================================= */

function renderSolicitudesUsuarios() {
    const cont = document.getElementById("listaSolicitudesUsuarios");
    if (!cont) return;

    cont.innerHTML = "";

    if (solicitudes.length === 0) {
        cont.innerHTML = `<p class="vacio">No hay solicitudes realizadas por usuarios.</p>`;
        return;
    }

    solicitudes.forEach((s, i) => {
        cont.innerHTML += `
            <div class="item-solicitud">
                <div>
                    <span>${s.articulo}</span><br>
                    <small>Solicitante: ${s.solicitante}</small><br>
                    <small>RUT: ${s.rut}</small><br>
                    <small>Fecha: ${s.fecha}</small>
                </div>

                <button class="btn-accion" onclick="abrirModalSolicitudUsuario(${i})">
                    Registrar préstamo
                </button>
            </div>
        `;
    });
}


/* =========================================================
   MODAL — CONFIRMAR PRÉSTAMO DE USUARIO REAL
========================================================= */

let indexSolicitudUsuario = null;

function abrirModalSolicitudUsuario(index) {
    indexSolicitudUsuario = index;
    const s = solicitudes[index];

    // Rellenar spans
    document.getElementById("solUserArticulo").innerText = s.articulo;
    document.getElementById("solUserNombre").innerText = s.solicitante;
    document.getElementById("solUserRut").innerText = s.rut;
    document.getElementById("solUserFecha").innerText = s.fecha;
    document.getElementById("solUserObs").innerText = s.obs || "Sin observaciones";

    document.getElementById("modalPrestarSolicitudUsuario").style.display = "flex";
}

function cerrarModalSolicitudUsuario() {
    document.getElementById("modalPrestarSolicitudUsuario").style.display = "none";
}

document.getElementById("btnConfirmarPrestamoUsuario").addEventListener("click", () => {
    if (indexSolicitudUsuario === null) return;

    const s = solicitudes[indexSolicitudUsuario];

    const idxArt = articulos.findIndex(a => a.codigo === s.codigo);
    if (idxArt === -1) return;

    articulos[idxArt].estado = "prestado";

    historial.push({
        accion: "préstamo",
        articulo: s.articulo,
        solicitante: s.solicitante,
        rut: s.rut,
        fecha: new Date().toLocaleString("es-CL"),
        obs: s.obs || ""
    });

    solicitudes.splice(indexSolicitudUsuario, 1);

    guardarDatos();
    cerrarModalSolicitudUsuario();
    renderTabla();
    renderSolicitudes();
    renderSolicitudesUsuarios();
    renderDevoluciones();
});


/* =========================================================
   HISTORIAL - DEVOLUCIONES
========================================================= */
function renderDevoluciones() {
    const cont = document.getElementById("listaDevoluciones");
    if (!cont) return;

    cont.innerHTML = "";

    const ultimos = historial.filter(h => h.accion === "devolución").slice(-5);

    if (ultimos.length === 0) {
        cont.innerHTML = `<p class="vacio">No hay devoluciones registradas recientemente.</p>`;
        return;
    }

    ultimos.forEach(dev => {
        cont.innerHTML += `
            <div class="item-solicitud">
                <div>
                    <span>${dev.articulo}</span><br>
                    <small>Estado final: ${dev.estadoFinal}</small>
                </div>
            </div>
        `;
    });
}


/* =========================================================
   BUSCAR ARTÍCULO
========================================================= */
function buscarArticuloPorCodigo(codigo) {
    return articulos.findIndex(a => a.codigo === codigo);
}


/* =========================================================
   INICIALIZACIÓN
========================================================= */
renderTabla();
renderSolicitudes();
renderSolicitudesUsuarios();
renderDevoluciones();









































