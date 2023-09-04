var globalData = [];
var options = []; //contains the contents of options.txt, divided in its different blocks
var quantities = []; //contains the title of each block, aka the quantities metrics measure

// Función para llenar el select de nombres según el título seleccionado
function llenarNombres(element) {
    // Obtener los datos del archivo JSON

    // Obtener referencias a los select
    /*const tipoSelect = document.getElementById('tipoSelect');
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
    });*/
    var pos = quantities.indexOf(element.target.value);
    console.log(pos);
    console.log(element);
    var m = element.target.nextSibling.nextSibling.nextSibling.nextSibling;
    m.innerHTML = '';
    var metrics = options[pos];
    for(var i = 1; i<metrics.length;i++){
        var option = document.createElement("option");
        option.value = metrics[i].split(',')[0];
        option.text = metrics[i].split(',')[0];
        m.appendChild(option);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('metrics/medidas.txt')
    .then(response => response.text())
    .then(data => {
        console.log(data);
        globalData = data.split('--');
        globalData.length -= 1;
        console.log(globalData);
        for(var i = 0; i < globalData.length; i++){
            options[i] = globalData[i].split('\n').filter(line => line.trim() !== '');
        }
        //save the quantity of each block in quanitities
        for(var i = 0; i<options.length; i++){
            quantities[i] = options[i][0];
        }
        addOptions(document.getElementById('tipoSelect'));
    });
});

function addOptions(element){
    
    for(var i = 0; i < options.length;i++){
        var option = document.createElement("option");
        option.value = quantities[i];
        option.text = quantities[i];
        element.appendChild(option);
    }
    //defaultSelect(element, element.nextSibling.nextSibling.nextSibling.nextSibling);
}

function defaultSelect(element1, element2){
    //create an array with only the metrics of the selected quantity of the first select
    var metrics = options[element1.selectedIndex];
    //ignoring the index 0, create an option for each index and equate the value and text to the text, splitting the number
    for(var i = 1; i<metrics.length;i++){
        var option = document.createElement("option");
        option.value = metrics[i].split(',')[0];
        option.text = metrics[i].split(',')[0];
        element2.appendChild(option);
    }
    element1.addEventListener("change", updateSelect);
}