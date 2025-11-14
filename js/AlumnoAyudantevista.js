

/* ============================================
   SCRIPT 2: LÓGICA DEL CALENDARIO
 ============================================
*/
// Esperar a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Seleccionar elementos del DOM ---
    const btnDiario = document.getElementById("btnDiario");
    const btnSemanal = document.getElementById("btnSemanal");
    const vistaDiaria = document.getElementById("vistaDiaria");
    const vistaSemanal = document.getElementById("vistaSemanal");
    const fechaInput = document.getElementById("fechaCalendario");
    const tablaDia = document.getElementById("tablaDia");
    const tituloDia = document.getElementById("tituloDia");

    // --- Datos de ejemplo (Mock) ---
    const horasDelDia = [
        { hora: "08:00 - 09:00", estado: "libre" },
        { hora: "09:00 - 10:00", estado: "libre" },
        { hora: "10:00 - 11:00", estado: "ocupado" },
        { hora: "11:00 - 12:00", estado: "ocupado" },
        { hora: "12:00 - 13:00", estado: "libre" },
        { hora: "13:00 - 14:00", estado: "ocupado" },
        { hora: "14:00 - 15:00", estado: "libre" },
        { hora: "15:00 - 16:00", estado: "libre" },
        { hora: "16:00 - 17:00", estado: "ocupado" },
        { hora: "17:00 - 18:00", estado: "libre" },
        { hora: "18:00 - 19:00", estado: "libre" },
        { hora: "19:00 - 20:00", estado: "libre" },
        { hora: "20:00 - 21:00", estado: "ocupado" },
        { hora: "21:00 - 22:00", estado: "libre" },
        { hora: "22:00 - 23:00", estado: "libre" }
    ];
    const interruptorTema = document.getElementById("interruptorTema");

    // 1. Aplicar tema guardado al cargar la página
    if (localStorage.getItem("tema") === "oscuro") {
        document.body.classList.add("tema-oscuro");
        if (interruptorTema) interruptorTema.checked = true;
    }
    
    // 2. Escuchar cambios en el interruptor
    if (interruptorTema) {
        interruptorTema.addEventListener("change", () => {
            if (interruptorTema.checked) {
                document.body.classList.add("tema-oscuro");
                localStorage.setItem("tema", "oscuro");
            } else {
                document.body.classList.remove("tema-oscuro");
                localStorage.setItem("tema", "claro");
            }
        });
    }
    // --- 2. Función para renderizar los bloques del día ---
    function renderizarDia() {
        tablaDia.innerHTML = ""; // Limpiar vista anterior
        
        horasDelDia.forEach(bloque => {
            const div = document.createElement("div");
            div.className = `bloque-hora ${bloque.estado}`;
            div.textContent = bloque.hora;
            
            // Si la página es para reservar, se agrega el clic
            if (bloque.estado === 'libre') {
                div.addEventListener('click', () => {
                    console.log(`Abriendo modal para reservar: ${bloque.hora}`);
                    // (Aquí iría la lógica del modal)
                    alert("Abriendo modal para reservar: " + bloque.hora);
                });
            }

            tablaDia.appendChild(div);
        });
    }

    // --- 3. Función para actualizar el título (ej: "jueves, 13 de noviembre") ---
    function actualizarTituloDia(fechaString) {
        if (!fechaString) {
            tituloDia.textContent = "Selecciona una fecha";
            return;
        }
        
        // Convertir 'YYYY-MM-DD' a un objeto Fecha
        const partes = fechaString.split('-');
        const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
        
        const opciones = { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' };
        let fechaFormateada = fecha.toLocaleDateString("es-ES", opciones);
        
        fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
        tituloDia.textContent = fechaFormateada;
    }

    // --- 4. Asignar Eventos a los botones de vista ---
    btnDiario.addEventListener("click", () => {
        vistaDiaria.classList.add("visible");
        vistaSemanal.classList.remove("visible");
        btnDiario.classList.add("activo");
        btnSemanal.classList.remove("activo");
    });

    btnSemanal.addEventListener("click", () => {
        vistaDiaria.classList.remove("visible");
        vistaSemanal.classList.add("visible");
        btnDiario.classList.remove("activo");
        btnSemanal.classList.add("activo");
        
        document.getElementById("tablaSemana").innerHTML = "<p>Vista semanal en construcción.</p>";
    });

    // --- 5. Asignar Evento al selector de fecha ---
    fechaInput.addEventListener("change", () => {
        const fechaSeleccionada = fechaInput.value;
        if (fechaSeleccionada) {
            actualizarTituloDia(fechaSeleccionada);
            renderizarDia(); // Renderiza los bloques para la nueva fecha
        } else {
            tituloDia.textContent = "Selecciona una fecha";
            tablaDia.innerHTML = ""; // Limpia los bloques si no hay fecha
        }
    });

    // --- 6. Inicialización al cargar la página ---
    
    // Establecer la fecha de la imagen (13/11/2025) por defecto
    const fechaSimulada = "2025-11-13"; 
    fechaInput.value = fechaSimulada;
    
    // Disparar el evento 'change' manualmente para cargar los datos
    fechaInput.dispatchEvent(new Event('change'));

});