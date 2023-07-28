var counterR = 0;
var array = [];
var campos = 1;
var anterior = -1;

function addRow(event) {
    
    var output = document.getElementsByClassName('campo');
    var button = document.getElementsByClassName('newRow');

    var content = document.createElement('div');
    content.className = "content";
    content.id = "rightdiv" + counterR;
    content.onclick = select;
    
    var val = document.createElement('input');
    val.className = "value";
    var metric = document.createElement('div');
    metric.className = "metric";

    var a = button.previousSibling;
    
    content.appendChild(metric); 
    content.appendChild(val); 
    output.appendChild(content);
    
    array[counterR] = 0;
    counterR++;
}
/*
$(document).ready(function() {
  $('#nuevoCampo').click(function() {
    const campo = document.getElementsByClassName('campo');
    const campoNuevo = campo.cloneNode(true);

    const cl = 'campo';
    campoNuevo.setAttribute('class', cl);

    campo.parentNode.insertBefore(campoNuevo, campo.nextSibling);
  });
});
*/
function newRow(event) {
  const campo = document.getElementById('campo');
  const campoNuevo = campo.cloneNode(true);
  const a = campoNuevo.querySelector("input[name=campo]");
  a.value ="";

  const cl = 'campos';
  const id = 'campo' + campos;
  campoNuevo.setAttribute('class', cl);
  campoNuevo.setAttribute('id', id);

  campos=campos+1;
  event.target.parentElement.insertBefore(campoNuevo, event.target);
}

function measure(event) {
  const value = event.target.value;
  const id = event.target.id;

  var activo = event.target.parentElement.children;
  if(anterior !== -1) {
    event.target.parentElement.children[anterior].style.display = 'none';
  }

  if(value == 'long') {
    const selectLong = event.target.parentElement.children[3];
    selectLong.style.display = 'inline';
    anterior = 3;
  } else if(value == 'peso') {
    const selectPeso = event.target.parentElement.children[4];
    selectPeso.style.display = 'inline';
    anterior = 4;
  } else if(value == 'cant') {
    const selectCant = event.target.parentElement.children[5];
    selectCant.style.display = 'inline';
    anterior = 5;
  } else if(value == 'vol') {
    const selectVol = event.target.parentElement.children[6];
    selectVol.style.display = 'inline';
    anterior = 6;
  } else if(value == 'temp') {
    const selectTemp = event.target.parentElement.children[7];
    selectTemp.style.display = 'inline';
    anterior = 7;
  } else if(value == 'otros') {
    const selectOtros = event.target.parentElement.children[8];
    selectOtros.style.display = 'inline';
    anterior = 8;
  } else {
    anterior = -1;
  }
}

function select(){
    var a = this.id.replace("rightdiv", "");
    if(array[a] == 0) array[a] = 1;
    else array[a] = 0;
}