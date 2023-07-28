var counterL = 0;
var reload = false;

function readCSVFile(event) {
  var input = event.target;
  var reader = new FileReader();

  reader.onload = function() {
    if(reload) counterL = 0;
    var text = reader.result;
    var lines = text.split('\n');

    // Assuming the CSV file has a header row
    var header = lines[0].split(',')[1];

    var output = document.getElementById('outputCSV');
    output.innerHTML = '';

    for (var i = 1; i < lines.length; i++) {
      if(i%2 == 0){
      var columns = lines[i].split(',');
      var value = columns[1]; // Second column

      var content = document.createElement('div');
      content.className = "content";
      content.id = "leftdiv"+ counterL;
      counterL++;
      var val = document.createElement('div');
      val.className = "value";
      var metric = document.createElement('div');
      metric.className = "metric";
      val.textContent = value;
      content.appendChild(val); 
      content.appendChild(metric);  
      output.appendChild(content);
      }
    }
  };

  reload = true;
  reader.readAsText(input.files[0]);
}