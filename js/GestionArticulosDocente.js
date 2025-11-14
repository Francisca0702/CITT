// ==== CARGAR ARTÍCULOS DEL LOCALSTORAGE ====
let articulos = JSON.parse(localStorage.getItem("articulosCITT")) || [];

// ==== REFERENCIA A LA TABLA DOCENTE ====
const tabla = document.getElementById("tablaGestion");

// ==== RENDERIZAR TABLA ====
function renderArticulosDocente() {
    tabla.innerHTML = "";

    if (articulos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:20px;">
                    No hay artículos registrados.
                </td>
            </tr>`;
        return;
    }

    articulos.forEach(a => {
        tabla.innerHTML += `
            <tr>
                <td>${a.codigo}</td>
                <td>${a.nombre}</td>
                <td>${a.categoria}</td>
                <td>
                    <span class="estado ${a.estado}">
                        ${a.estado.charAt(0).toUpperCase() + a.estado.slice(1)}
                    </span>
                </td>
            </tr>
        `;
    });
}

renderArticulosDocente();
