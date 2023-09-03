document.addEventListener("close", closepreview);

var textL = [];
var textR = [];
var valL = [];
var valR = [];

var chosen = false; //only one element can be chosen at a time when moving them in the preview

//saves the final result of the project that will be used to transform the csv
var final = [];
//saves the metrics of the quanitities of each row
var finalMetrics = [];

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

        var tmp = []; //array with text rows
        var tmpV = []; //array with other rows

        links.forEach(element => {
            var side;
            //separate left text, left values, right text and right values
            element.left.forEach(a => {
                var a1 = document.getElementById("leftdiv"+a);
                if(a1.children[1].value == "Texto") tmp.push(a1.children[0].innerText);
                else changeType(a1.children[0], a1.children, 0, tmpV);
            });
            textL[counter] = tmp.slice();
            valL[counter] = tmpV.slice();
            tmp.length = 0;
            tmpV.length = 0;
            element.right.forEach(b => {
                var b1 = document.getElementById("rightdiv"+b);
                if(b1.children[1].children[0].innerText == "Texto") tmp.push(b1.children[0].innerText);
                else changeType(b1.children[0], b1.children, 1, tmpV);
            });
            textR[counter] = tmp.slice();
            valR[counter] = tmpV.slice();
            tmp.length = 0;
            tmpV.length = 0;
            counter++;
        });
        showPreview();
    }
}

function changeType(childName, childMetric, side, arrayV){
    arrayV.push(childName.innerText);
    if(side == 0){
        var tmp_m = {quantity: childMetric[1].value, metric: childMetric[2].value, name: childName.innerText};
        finalMetrics.push(tmp_m);
    } else if (side == 1){
        var tmp_m = {quantity: childMetric[1].children[0].innerText, metric: childMetric[1].children[1].innerText, name: childName.innerText};
        finalMetrics.push(tmp_m);
    }
}

//creates the preview with the final rows and the relations between the csv and the scheme.
//for each row, the left half has the elements of type Texto.
//-these elements can be moved around inside their respective area to reorder them
//the right half has the elements of the remaining types.
//-these elements can't be moved around. It doesn't matter, since they are going to be transformed and added
//TODO: add another area to the right with the name of the target scheme row the elements will be in
function showPreview(){
    //window with the preview of the rows
    var w = document.createElement('div');
    w.id = 'previewWindow';
    //upper part, with the title and buttons
    var first = document.createElement('div');
    first.id = 'previewTitulo';
    var t = document.createElement('h1');
    t.id = 'previewTitle';
    t.innerText = "Vista previa";
    var b = document.createElement('div');
    b.id = "previewButtons";
    //confirm button. Proceeds with the transformation when clicked, then closes the window
    var b1 = document.createElement('button');
    b1.id = 'previewConfirm';
    b1.innerText = "Confirmar";
    b1.addEventListener('click', () => {
        console.log("confirmed");
        toArrays();
        var event = new Event("close");
        document.dispatchEvent(event);
    });
    //cancel button. Closes the window when clicked
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
    //main part of the preview, where the rows are shown. Starts empty.
    var second = document.createElement('div');
    second.id = 'previewTable';
    w.appendChild(first);
    w.appendChild(second);
    document.body.appendChild(w);

    //creates the final rows
    //for each index of links, create a row with the elements of the first relation of type text to the left
    //and the elements of the other types to the right
    //at the end of the row, a square with the name of the final DB column will be shown
    //TODO: bit of an overhaul so only one element of the scheme can be selected at a time for a relation
    //-make a new array that stores the name of that element to add it in the rightmost area of its respective row
    //-optional due to time: instead, allow several sheme rows to be in the same relation, and make it so rows
    //--from the preview can be related for its elements to be moved around
    var a = document.getElementById('previewTable');
            var counterR = 0;
            a.innerHTML = '';

            for (var i = 0; i < links.length; i++) {
                var content = document.createElement('div');
                content.className = "previewContent";
                content.id = "previewRow"+ counterR;
                var j = 0;
                var t = document.createElement('div');
                t.className = "previewText";
                var m = document.createElement('div');
                m.className = "previewQuantity";
                //each position of textL is an object with the names of the left rows of type Texto
                //for each element, add an element with its content in the 'texts' area
                textL[i].forEach(element => {
                    //access each element of an object in textL
                        var box = document.createElement('div');
                        box.id = 'prev'+i+'-'+j;
                        box.className = 'preview';
                        box.innerText = element;
                        box.addEventListener("click", (event) => {
                            toggleSelect(event);
                            console.log(event);
                        });
                        t.appendChild(box);
                        j++;
                });
                //each position of textR is an object with the names of the right rows of type Texto
                //to be removed
                textR[i].forEach(element => {
                    //access each element of an object in textL
                        var box = document.createElement('div');
                        box.id = 'prev'+i+'-'+j;
                        box.className = 'preview';
                        box.innerText = element;
                        box.addEventListener("click", (event) => {
                            toggleSelect(event);
                            console.log(event);
                        });
                        t.appendChild(box);
                        j++;
                });
                //for each element to the left
                valL[i].forEach(element => {
                    //access each element of an object in textL
                        var box = document.createElement('div');
                        box.id = 'prev'+i+'-'+j;
                        box.className = 'preview';
                        box.innerText = element;
                        box.addEventListener("click", (event) => {
                            toggleSelect(event);
                            console.log(event);
                        });
                        m.appendChild(box);
                        j++;
                });
                //to be removed
                valR[i].forEach(element => {
                    //access each element of an object in textL
                        var box = document.createElement('div');
                        box.id = 'prev'+i+'-'+j;
                        box.className = 'preview';
                        box.innerText = element;
                        box.addEventListener("click", (event) => {
                            toggleSelect(event);
                            console.log(event);
                        });
                        m.appendChild(box);
                        j++;
                    });
                counterR++;
                content.appendChild(t);
                content.appendChild(m);
                a.appendChild(content);
            }
}

function closepreview(){
    var a = document.getElementById('previewWindow');
    document.body.removeChild(a);
}

function toggleSelect(element){
    //checks if the element was already selected, or, if not, if it can be selected
    //if it was selected
    if(chosen && element.target.classList.contains('pselected')){
        element.target.classList.remove('pselected');
        chosen = false;
    //it wasn't seleced but it can be selected
    } else if(!chosen && !element.target.classList.contains('pselected')){
        element.target.classList.add('pselected');
        chosen = true;
    //if there was already a chosen element and it's from the same row, however, they'll swap places
    } else if(chosen && !element.target.classList.contains('pselected')){
        var a = document.getElementsByClassName('pselected')[0];
        var b = a.id.replace('prev', '')[0];
        var c = element.target.id.replace('prev', '')[0];
        //if the elements share the same parent, they swap places
        //this means they are both in the same row and are both either text or a quantity
        if(a.parentElement == element.target.parentElement){
            swapPlaces(element);
        }
        //regardless of the outcome, the chosen element is unselected
        a.classList.remove('pselected');
        chosen = false;
    }
}

function swapPlaces(element){
    //get the parent
    var parent = element.target.parentElement;
    var tar = document.getElementById(element.target.id);
    //create a temporary element
    var temp = document.createElement('div');
    //get the chosen element
    var a = document.getElementsByClassName('pselected')[0];
    //put the temporary element before the chosen element
    console.log(temp);
    console.log(a);
    parent.insertBefore(temp, a);
    //put the chosen element before the target element
    parent.insertBefore(a, tar);
    //put the target element before the temporary element
    parent.insertBefore(tar, temp);
    //remove the temporary element
    parent.removeChild(temp);
}

//reads the preview window and saves the rows in an array
//each index has two values, one for the text and the other for the quantities
//there is a second array, which only saves the metrics of the quanitities of each row
function toArrays(){
    //get the parent element of the rows
    var a = document.getElementById('previewTable');
    //for each row
    Array.from(a.children).forEach(element => {
        var i = 0;
        var tmp_L = [];
        var tmp_R = [];
        //for each text of the row
        for(i = 0;i<element.children[0].children.length;i++){
            tmp_L.push(element.children[0].children[i].innerText);
        }
        //for each quantity of the row
        for(i = 0;i<element.children[1].children.length;i++){
            tmp_R.push(element.children[1].children[i].innerText);
        }
        var both = {text: tmp_L, right: tmp_R};
        final.push(both);
    });
}