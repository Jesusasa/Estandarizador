document.addEventListener("csv_loaded", load_scheme);

var schNames = [];
var schQuant = [];
var schMetric = []; 

function load_scheme(){
    
    a = document.getElementById("outputSCH");
        fetch("scheme/modelo.csv")
        .then(response => response.text())
        .then(data => {
           var lines = data.split('\n');
            schNames = [];
            schQuant = [];
            schMetric = [];
            a.innerHTML = '';
            var counterR = 0;
            for (var i = 0; i < lines.length-1; i++) {
                var columns = lines[i].split(';');
                var value = columns[0]; 
                schNames[i] = columns[0];
                var value2 = columns[1];
                schQuant[i] = columns[1];
                var value3 = columns[2];
                schMetric[i] = columns[2];
                var content = document.createElement('div');
                content.className = "content";
                content.id = "rightdiv"+ counterR;
                linkedR[counterR] = false;
                counterR++;
                var val = document.createElement('div');
                val.className = "value";
                val.textContent = value;
                var right = document.createElement('div');
                right.className = "metricR"
                var metric = document.createElement('div');
                metric.className = "main";
                metric.textContent = value2;
                var submetric = document.createElement('div');
                submetric.className = "sub";
                submetric.textContent = value3;
                right.appendChild(metric);
                right.appendChild(submetric);
                content.appendChild(val); 
                content.appendChild(right);
                a.appendChild(content);
            }
            var column = document.getElementById('outputSCH');
            var rows = column.getElementsByClassName("content");
            for (var i = 0; i < rows.length; i++) {
                rows[i].addEventListener("click", function(a) {
                        var b = a.target.parentElement;      
                        var elem = b.classList.contains('content') ? b.id 
                                 : b.parentElement.id;  
                        var src = elem.replace("rightdiv", "");  
                        var num = Number(src);
                        var st = document.getElementById(elem);
                        changeColorR(st, num);
                        isLinked(1, num);
                        checkCounters();
                    });
            }
        })
    var event = new Event("scheme_loaded");
    document.dispatchEvent(event);
}

