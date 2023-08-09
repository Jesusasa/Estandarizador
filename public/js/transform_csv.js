document.addEventListener("close", closepreview);

var textL = [];
var textR = [];
var valL = [];
var valR = [];

//saves the arrays links, linkedL and linkedR in a file to save the relations between rows
//then it creates a new file with the transformed csv for the user to download
function transform(){
    var option = document.getElementById('maps').value;
    if(option != "empty" && option != "create"){
        if(links.length > 0){
            //const fix = links.map(item => JSON.stringify(item)); //fix so the server can handle the array of objects properly
            var add = "";
            for(var i = 0;i<links.length;i++){
                add += JSON.stringify(links[i]);
            }
            const a = /"left":|\s*"right":/g;
            const fix = add.replace(a, "");
            const arrays = {
                linkL: linkedL,
                linkR: linkedR,
                link: fix
            };
        
            var name = document.getElementById("maps");
            const path = "./relations/"+name.value;
            const send = JSON.stringify({fileName: path, data: arrays});
            fetch('relations', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: send
            })
            .then(response => response.text())
            .then(message => {
                console.log(message);
            })
            .catch(error => {
                console.error("There's been an issue creating the links file: "+ error);
            });
        }

        textL.length = 0;
        textR.length = 0;
        valL.length = 0;
        valR.length = 0;
        var counter = 0;

        tmp = [];
        tmpV = [];

        links.forEach(element => {
            //separate left text, left values, right text and right values
            element.left.forEach(a => {
                var a1 = document.getElementById("leftdiv"+a);
                if(a1.children[1].value == "texto") tmp.push(a1.children[0].innerText);
                else changeType(a1.children[0], a1.children[1].value, 0, tmpV);
            });
            textL[counter] = Object.assign({}, tmp);
            valL[counter] = Object.assign({}, tmpV);
            tmp.length = 0;
            tmpV.length = 0;
            element.right.forEach(b => {
                var b1 = document.getElementById("rightdiv"+b);
                if(b1.children[1].value == "texto") tmp.push(b1.children[0].innerText);
                else changeType(b1.children[0], b1.children[1].value, 1, tmpV);
            });
            textR[counter] = Object.assign({}, tmp);
            valR[counter] = Object.assign({}, tmpV);
            tmp.length = 0;
            tmpV.length = 0;
            counter++;
        });
        showPreview();
    }
}

//TODO: change the type of childName according to childMetric
function changeType(childName, childMetric, side, arrayV){
    if(side == 0) arrayV.push(childName.innerText);
    if(side == 1) arrayV.push(childName.innerText);
}

function showPreview(){
    var w = document.createElement('div');
    w.id = 'previewWindow';
    var first = document.createElement('div');
    first.id = 'previewTitulo';
    var t = document.createElement('h1');
    t.id = 'previewTitle';
    t.innerText = "Vista previa";
    var b = document.createElement('div');
    b.id = "previewButtons";
    var b1 = document.createElement('button');
    b1.id = 'previewConfirm';
    b1.innerText = "Confirmar";
    b1.addEventListener('click', () => {
        console.log("confirmed");
        var event = new Event("close");
        document.dispatchEvent(event);
    });
    var b2 = document.createElement('button');
    b2.id = 'previewCancel';
    b2.innerText = "Cancelar";
    b2.addEventListener('click', () => {
        console.log("cancel");
        var event = new Event("close");
        document.dispatchEvent(event);
    });
    b.appendChild(b2);
    b.appendChild(b1);
    first.appendChild(t);
    first.appendChild(b);
    var second = document.createElement('div');
    second.id = 'previewTable';
    w.appendChild(first);
    w.appendChild(second);
    document.body.appendChild(w);

    var a = document.getElementById('previewTable');
    fetch("scheme/ejemplo.csv")
        .then(response => response.text())
        .then(data => {
           var lines = data.split('\n');

            a.innerHTML = '';
            var counterR = 0;
            for (var i = 0; i < lines.length-1; i++) {
                var columns = lines[i].split(';');
                var content = document.createElement('div');
                content.className = "previewContent";
                content.id = "previewRow"+ counterR;
                var j = 0;
                //each position of textL is an object with the names of the left rows
                textL.forEach(element => {
                    //access each element of an object in textL
                    console.log(element);
                    Array.from(element).forEach(name => {
                        var box = document.createElement('div');
                        box.id = 'draggable'+i+'-'+j;
                        box.innerText = name;
                        console.log(box.innerText);
                        box.addEventListener("dragstart", (event) => {
                            console.log(event);
                        });
                        content.appendChild(box);
                    });
                });
                counterR++;
                a.appendChild(content);
            }
        });
}

function closepreview(){
    var a = document.getElementById('previewWindow');
    document.body.removeChild(a);
}