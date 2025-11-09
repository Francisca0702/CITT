// ===== CARGAR ARTÍCULOS DESDE LOCALSTORAGE =====
let articulos = JSON.parse(localStorage.getItem("articulosCITT")) || [];

function guardar() {
    localStorage.setItem("articulosCITT", JSON.stringify(articulos));
}

const tabla = document.getElementById("tablaGestion");

// ===== RENDER TABLA =====
function renderGestion() {
    tabla.innerHTML = "";

    if (articulos.length === 0) {
        tabla.innerHTML = `<tr><td colspan="5">No hay artículos registrados</td></tr>`;
        return;
    }

    articulos.forEach((a, i) => {
        tabla.innerHTML += `
        <tr>
            <td>${a.codigo}</td>
            <td>${a.nombre}</td>
            <td>${a.categoria}</td>
            <td><span class="estado ${a.estado}">${a.estado}</span></td>
            <td>
                ${a.estado === "disponible" 
                    ? `<button class="btn btn-prestar" onclick="abrirPrestamo(${i})">Prestar</button>`
                    : a.estado === "prestado"
                        ? `<button class="btn btn-devolver" onclick="abrirDevolucion(${i})">Registrar devolución</button>`
                        : `<span style="color:#a00; font-weight:600;">Dañado</span>`
                }
            </td>
        </tr>`;
    });
}

// ===== HISTORIAL DE PRÉSTAMOS =====
let historial = JSON.parse(localStorage.getItem("historialPrestamosCITT")) || [];

function guardarHistorial() {
    localStorage.setItem("historialPrestamosCITT", JSON.stringify(historial));
}

// ===== MOSTRAR TABLA AL CARGAR =====
document.addEventListener("DOMContentLoaded", renderGestion);

// ===== MODAL PRÉSTAMO =====
let actual = -1;

function abrirPrestamo(i) {
    actual = i;
    document.getElementById("nombrePrestamo").textContent = articulos[i].nombre;
    document.getElementById("modalPrestamo").style.display = "flex";
}

function cerrarModalPrestamo() {
    document.getElementById("modalPrestamo").style.display = "none";
}

document.getElementById("confirmarPrestamo").addEventListener("click", () => {
    const solicitante = document.getElementById("solicitante").value.trim();
    const rut = document.getElementById("rutSolicitante").value.trim();
    const obs = document.getElementById("obsPrestamo").value.trim();

    if (!solicitante || !rut) {
        alert("Debe ingresar nombre y RUT del solicitante.");
        return;
    }

    historial.push({
        codigo: articulos[actual].codigo,
        nombre: articulos[actual].nombre,
        solicitante,
        rut,
        observacionPrestamo: obs || null,
        fechaPrestamo: new Date().toLocaleString("es-CL"),
        fechaDevolucion: null,
        estadoDevolucion: null,
        observacionDevolucion: null
    });

    articulos[actual].estado = "prestado";

    guardar();
    guardarHistorial();

    cerrarModalPrestamo();
    renderGestion();
});

// ===== MODAL DEVOLUCIÓN =====
function abrirDevolucion(i) {
    actual = i;
    document.getElementById("nombreDevolucion").textContent = articulos[i].nombre;
    document.getElementById("modalDevolucion").style.display = "flex";
}

function cerrarModalDevolucion() {
    document.getElementById("modalDevolucion").style.display = "none";
}

document.getElementById("estadoDevolucion").addEventListener("change", (e) => {
    document.getElementById("detalleDaño").style.display =
        e.target.value === "dañado" ? "block" : "none";
});

document.getElementById("confirmarDevolucion").addEventListener("click", () => {
    const nuevoEstado = document.getElementById("estadoDevolucion").value;
    const descDaño = document.getElementById("descripcionDaño").value.trim();

    articulos[actual].estado = nuevoEstado;

    const registro = [...historial].reverse().find(h => h.codigo === articulos[actual].codigo && h.fechaDevolucion === null);
    if (registro) {
        registro.fechaDevolucion = new Date().toLocaleString("es-CL");
        registro.estadoDevolucion = nuevoEstado;
        registro.observacionDevolucion = descDaño || null;
    }

    guardar();
    guardarHistorial();

    cerrarModalDevolucion();
    renderGestion();
});
