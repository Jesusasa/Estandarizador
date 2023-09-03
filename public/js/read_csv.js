

function readCSVFile(event) {
  var input = event.target;
  var reader = new FileReader();

  reader.onload = function() {
    var counterL = 0;
    var text = reader.result;
    var lines = text.split('\n');

    var output = document.getElementById('outputCSV');
    output.innerHTML = '';

    for (var i = 0; i < lines.length; i++) {
      if(i%2 == 0){
      var columns = lines[i].split(',');
      var value = columns[1];

      var content = document.createElement('div');
      content.className = "content";
      content.id = "leftdiv"+ counterL;
      linkedL[counterL] = false;
      counterL++;
      var val = document.createElement('div');
      val.className = "value";
      var quantity = document.createElement('select');
      quantity.className = "metric";
      addOptions(quantity);
      var metric = document.createElement('select');
      metric.className = "submetric"
      defaultSelect(quantity, metric);
      val.textContent = value;
      content.appendChild(val); 
      content.appendChild(quantity);  
      content.appendChild(metric);
      output.appendChild(content);
      }
    }
    var column = document.getElementById('outputCSV');
            var rows = column.getElementsByClassName("value");
            for (var i = 0; i < rows.length; i++) {
                rows[i].addEventListener("click", function(a) {
                    var elem = a.target.parentElement.id;
                    var src = elem.replace("leftdiv", "");  
                    var num = Number(src);
                    var st = document.getElementById(elem);
                    changeColorL(st, num);
                    checkCounters();
                    isLinked(0, num);
                  });
            }
  };
 
  reader.readAsText(input.files[0]);
  var event = new Event("csv_loaded");
  document.dispatchEvent(event);
}