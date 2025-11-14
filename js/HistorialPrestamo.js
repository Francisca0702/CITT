let historial = JSON.parse(localStorage.getItem("historialPrestamosCITT")) || [];

const tabla = document.getElementById("tablaHistorial");

function renderHistorial() {
    tabla.innerHTML = "";
    historial.forEach(h => {
        tabla.innerHTML += `
        <tr>
            <td>${h.codigo}</td>
            <td>${h.nombre}</td>
            <td>${h.solicitante}</td>
            <td>${h.rut}</td>
            <td>${h.fechaPrestamo}</td>
            <td>${h.fechaDevolucion || "-"}</td>
            <td>${h.estadoDevolucion || "En préstamo"}</td>
        </tr>`;
    });
}

renderHistorial();
