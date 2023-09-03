var globalData;

// Función para llenar el select de nombres según el título seleccionado
function llenarNombres() {
    // Obtener los datos del archivo JSON

    // Obtener referencias a los select
    const tipoSelect = document.getElementById('tipoSelect');
    const medidaSelect = document.getElementById('medidaSelect');

    console.log(globalData);

    const selectedIndex = tipoSelect.selectedIndex;
    const filas = globalData[selectedIndex].filas;

    console.log(filas);
    console.log(selectedIndex);

    // Limpiar el select de nombres
    medidaSelect.innerHTML = '';

    // Llenar el select de nombres con las opciones correspondientes
    filas.forEach(fila => {
        const option = document.createElement('option');
        option.value = fila.medida;
        option.text = `${fila.medida}`;
        medidaeSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('metrics/medidas.txt')
    .then(response => response.text())
    .then(data => {
        globalData = JSON.parse(data);
    });
});