// ===== LISTA INICIAL (si es primera vez) =====
let articulos = JSON.parse(localStorage.getItem("articulosCITT")) || [
  // Electrónica
  { codigo: "A-001", nombre: "Arduino UNO R3", categoria: "Electrónica", cantidad: 4, valor: 18000, estado: "disponible" },
  { codigo: "A-002", nombre: "Arduino Nano", categoria: "Electrónica", cantidad: 6, valor: 15000, estado: "disponible" },
  { codigo: "S-010", nombre: "Kit Sensores IoT", categoria: "Electrónica", cantidad: 10, valor: 12000, estado: "disponible" },
  { codigo: "R-021", nombre: "Raspberry Pi 4 (4GB)", categoria: "Electrónica", cantidad: 3, valor: 70000, estado: "prestado" },
  // Computación
  { codigo: "NB-550", nombre: "Notebook Dell 5490", categoria: "Computación", cantidad: 3, valor: 280000, estado: "prestado" }
];

// ===== GUARDAR EN LOCALSTORAGE =====
function guardar() {
    localStorage.setItem("articulosCITT", JSON.stringify(articulos));
}

const lista = document.getElementById("listaArticulos");
const form = document.getElementById("formInventario");

// ===== REGISTRAR ARTÍCULO =====
form.addEventListener("submit", (e) => {
    e.preventDefault();

    let articulo = {
        codigo: codigoArticulo.value.trim(),
        nombre: nombreArticulo.value.trim(),
        categoria: categoriaArticulo.value,
        cantidad: parseInt(cantidadArticulo.value),
        valor: valorArticulo.value ? parseInt(valorArticulo.value) : null,
        estado: "disponible"
    };

    articulos.push(articulo);
    guardar(); // <<< IMPORTANTE !!!

    form.reset();
    codigoArticulo.focus();
    mostrarMensaje();
    render();
});

// ===== RENDER TABLA =====
function render() {
    lista.innerHTML = "";
    articulos.forEach(a => {
        lista.innerHTML += `
        <tr>
            <td>${a.codigo}</td>
            <td>${a.nombre}</td>
            <td>${a.categoria}</td>
            <td>${a.cantidad}</td>
            <td>${a.valor ? "$" + a.valor.toLocaleString("es-CL") : "-"}</td>
            <td><span class="estado ${a.estado}">${a.estado}</span></td>
        </tr>`;
    });
}

render();

// ===== TOAST MENSAJE =====
function mostrarMensaje() {
    const toast = document.getElementById("toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}
