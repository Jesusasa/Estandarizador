document.addEventListener("DOMContentLoaded", readyOptions);

var options = []; //contains the contents of options.txt, divided in its different blocks
var quantities = []; //contains the title of each block, aka the quantities metrics measure

function readyOptions(){
    fetch("metrics/medidas.txt")
    .then(response => response.text())
    .then(data => {
        //separate the options in an array
        var textfile = data.split('--');
        console.log(textfile);
        for(var i = 0; i < textfile.length; i++){
            options[i] = textfile[i].split('\n').filter(line => line.trim() !== '');
        }
        options.length -= 1;
        //save the quantity of each block in quanitities
        for(var i = 0; i<options.length; i++){
            quantities[i] = options[i][0];
        }
    })
}

function addOptions(element){
    for(var i = 0; i < options.length;i++){
        var option = document.createElement("option");
        option.value = quantities[i];
        option.text = quantities[i];
        element.appendChild(option);
    }
}

function defaultSelect(element1, element2){
    var pos = quantities.indexOf(element1.value);
    //create an array with only the metrics of the selected quantity of the first select
    var metrics = options[pos];
    //ignoring the index 0, create an option for each index and equate the value and text to the text, splitting the number
    for(var i = 1; i<metrics.length;i++){
        var option = document.createElement("option");
        option.value = metrics[i].split(',')[0];
        option.text = metrics[i].split(',')[0];
        element2.appendChild(option);
    }
    element1.addEventListener("change", updateSelect);
}

function updateSelect(element){
    var pos = quantities.indexOf(element.target.value);
    var m = element.target.nextSibling;
    m.innerHTML = '';
    var metrics = options[pos];
    for(var i = 1; i<metrics.length;i++){
        var option = document.createElement("option");
        option.value = metrics[i].split(',')[0];
        option.text = metrics[i].split(',')[0];
        m.appendChild(option);
    }
}

function startingOption(element, pos){
    result = options.findIndex(x => x.val === pos.trim());
    element.selectedIndex = result;
}