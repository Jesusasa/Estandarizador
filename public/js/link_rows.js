var selectedR = []; //array de las filas seleccionadas en el esquema
var selectedL = []; //array de las filas seleccionadas en el csv
var linkedL = []; //array de booleanos indicando qué filas del csv están actualmente vinculadas a una fila del esquema
var linkedR = []; //array de booleanos indicando qué filas del esquema están actualmente vinculadas a una fila del csv

var numL = 0; //indica el número de filas del csv actualmente seleccionadas. 0 por defecto
var numR = 0; //indica el número de filas del esquema actualmente seleccionadas. 0 por defecto.

var links = []; //indica cuales son las relaciones entre filas

var white = false; //indica si hay filas seleccionadas que están vinculadas a otras filas, es decir, con borde blanco

//checks if any of the to-be linked rows aren't already linked to a different set
function alreadyLinked(error){
    var found = false;
    var i = 0;
    var side = "";
    while(!found && (i<selectedL.length || i<selectedR.length)){
        if(i<selectedL.length && linkedL[selectedL[i]]) {found = true; side = "Izq";}
        if(!found && i<selectedR.length && linkedR[selectedR[i]]) {found = true; side = "Der";}
        else i++;
    }
    if(found) error += " Row " +i+ "on the " +side+ " side is already linked in another set.";
    return found;
}

//checks if all the types of the selected rows are equal or text
function mismatched(error){
    var mismatch = false;
    var i = 0;
    var types = [];
    types.push("Texto");
    while(!mismatch && (i<selectedL.length || i<selectedR.length)){
        if(i<selectedL.length){
            var a = document.getElementById("leftdiv"+selectedL[i]);
            //check if there are more types than text and a second type
            if(!types.includes(a.children[1].value)){
                if(types.length<2)types.push(a.children[1].value);
                else mismatch = true;
            } 
            
        }
        if(i<selectedR.length){
            var b = document.getElementById("rightdiv"+selectedR[i]); 
            //check if there are more types than text and a second type
            console.log(b.querySelector(".main").innerText);
            if(!types.includes(b.querySelector(".main").innerText)){
                if(types.length<2)types.push(b.children[1].innerText);
                else mismatch = true;
            }
        }
        i++;
    }
     if(mismatch)error += " The tipes of the rows can't be linked together.";
    return mismatch;
}

function selecteds_length(error){
    var enough = selectedL.length>0 && selectedR.length>0;
    if(!enough) error += " No rows selected in one side.";
    return enough;
}


function link(){
    var error = "";
    if(!alreadyLinked(error) && !mismatched(error) && selecteds_length(error)){
        var tr = document.getElementById('transform');
        if(tr.disabled == true) tr.disabled = false;
        var left;
        var right;
        var tmp_L = selectedL.slice();
        var tmp_R = selectedR.slice();
        var both = {left: tmp_L, right: tmp_R};
        links.push(both);
        i = 0;
        while(i<selectedL.length || i<selectedR.length){
            if(i<selectedL.length) {
                left += selectedL[i].toString() + " ";    
                linkedL[selectedL[i]] = true;
                var valL = "leftdiv"+selectedL[i];
                var contentL = document.getElementById(valL);
                contentL.classList.remove("selected");
                contentL.classList.add("linked");
            }
            if(i<selectedR.length) {
                right += selectedR[i].toString() + " ";
                linkedR[selectedR[i]] = true
                var valR = "rightdiv"+selectedR[i];
                var contentR = document.getElementById(valR);
                contentR.classList.remove("selected");
                contentR.classList.add("linked");
            }
            i++;
        }
        selectedR.length = 0;
        selectedL.length = 0;
        numL = 0;
        numR = 0;
        document.getElementById("tolink").disabled = true;
    }
    else {console.log(error);}
}

function isLinked(st, num){
    var dir = "";
    var e = 0;
    var div = st == 0 ? "leftdiv" : "rightdiv";
    var resL; 
    var side = st == 0 ? links.some(obj => obj.left.includes(num)) : links.some(obj => obj.right.includes(num));
    var elems;
    var index = st == 0 ? links.findIndex(obj => obj.left.some(res => res == num)) : 
                          links.findIndex(obj => obj.right.some(res => res == num));
    var r = document.getElementById(div+num);
    var same = false;
    //if there are rows with white borders, remove the white borders
    if(white){
        white = false;
        elems = document.getElementsByClassName("linked-clicked");
        Array.from(elems).forEach(element => {
            if(r.id == element.id) same = true;
            element.classList.remove("linked-clicked");
            element.classList.add("linked");
        });
        //if the selected row has been found in the array, we can disable the unlink button
        if(same){
            var ulbutton = document.getElementById("unlink");
            ulbutton.disabled = true;
        }
        var ulbutton = document.getElementById("unlink");
            ulbutton.disabled = true;
    } 
    //if there are no rows with white border and the selected row is linked to other rows that, turn their borders white
    //this won't happen if the selected row had white borders before the previous if statement
    if(!white && side && !same){
        //white border on all the applicable rows from the left side
        white = true;
        for(e = 0; e < links[index].left.length; e++){
            dir = "leftdiv"+links[index].left[e];
            resL = document.getElementById(dir);
            resL.classList.remove("linked");
            resL.classList.add("linked-clicked");
        } 
        //white border on all the applicable rows from the right side
        for(e = 0; e < links[index].right.length; e++){
            dir = "rightdiv"+links[index].right[e];
            resL = document.getElementById(dir);
            resL.classList.remove("linked");
            resL.classList.add("linked-clicked");
        }
        //enable the unlink button
        var ulbutton = document.getElementById("unlink");
        ulbutton.style.filter = "grayscale(100%)";
        ulbutton.disabled = false;
    }
}

//uses the id and side of every element with a white border to turn their positions in linkedL and linkedR false
//  and uses the last of them to find their index in links and eliminate it
//  it also removes the white borders 
function unlink(){
    var elems = document.getElementsByClassName("linked-clicked");
    var side;
    var elem;
    var ind;
    Array.from(elems).forEach(element => {
        elem = element.id;
        side = elem.includes("leftdiv") ? 0 : 1;
        if(side == 0){
            elem = Number(elem.replace("leftdiv", ""));
            linkedL[elem] = false;
        } else if(side == 1){
            elem = Number(elem.replace("rightdiv", ""));
            linkedR[elem] = false;
        }
        element.classList.remove("linked-clicked");
    });
    var ind = side == 0 ? links.findIndex(obj => obj.left.some(res => res == elem)) : 
                          links.findIndex(obj => obj.right.some(res => res == elem));
    links.splice(ind, 1);
    var ulbutton = document.getElementById("unlink");
    ulbutton.disabled = true;
    if(links.length==0){
        var li = document.getElementById('transform');
        li.disabled = true;
    }
}