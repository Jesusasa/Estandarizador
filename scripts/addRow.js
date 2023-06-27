var counterR = 0;
var array = [];

function addRow(event) {
    
    var output = document.getElementById('outputROW');
    var button = document.getElementById('rightdiv');

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

function select(){
    var a = this.id.replace("rightdiv", "");
    if(array[a] == 0) array[a] = 1;
    else array[a] = 0;
}