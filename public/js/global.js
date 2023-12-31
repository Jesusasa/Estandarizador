document.addEventListener('scheme_loaded', loadSelect);
document.addEventListener('select_loaded', () => document.getElementById('maps').addEventListener('change', loadRelations));

//value of the previous select in case we decide to cancel the creation of a new option
var selectActual = 'empty';

//when the selected option changes, we either do a "factory reset", leaving it as when we first loaded the page,
// or load the corresponding scheme file and modify the arrays and color the rows accordingly
function loadRelations(){
    var option = document.getElementById('maps').value;
    //if empty, clear everything
    
    if(option == "empty") {
        resetEverything();
        selectActual = option;
    }
    //if create, instead of just clearing everything, first we create a new option for the select, choose it, and then clear
    else if (option == "create"){
        //the new div
        var shadow = document.createElement('div');
        shadow.id = 'shadow';
        document.body.appendChild(shadow);
        var name = document.createElement('div');
        name.id= 'new-name';
        //input text
        var inp = document.createElement('input');
        inp.id = 'text';
        name.appendChild(inp);
        //confirm button
        var buttons = document.createElement('div');
        buttons.id = 'confirm-cancel';
        var confirm = document.createElement('button');
        confirm.textContent = "Confirm";
        confirm.addEventListener("click", () => {
            //get the text from the input
            
            var text = document.getElementById('text');
            var s = document.getElementById('maps');
            console.log(text.value);
            console.log(s);
            //check if the option exists
            var exists = false;
            var fix = Array.from(s).map(option => option.value);

            if(fix.indexOf(text.value) == -1){
               //create the new option and edit its value and the text the user sees if the option doesn't exist
               var opt = document.createElement('option');
               var val = text.value;
               opt.textContent = val;
               opt.value = val.replace(/\s+/g, '_');
               //add the option to the select
               var newoption = document.getElementById('maps');
               var last = newoption.lastElementChild;
               opt.selected = true;
               newoption.insertBefore(opt, last);
               //clear everything
               resetEverything();
               var a = document.getElementById('new-name');
               var b = document.getElementById('shadow');
               document.body.removeChild(a);
               document.body.removeChild(b);
               checkButtons();
            }
            else console.log('Existe');
        });
        buttons.appendChild(confirm);
        //cancel button
        var cancel = document.createElement('button');
        cancel.textContent = "Cancel";
        cancel.addEventListener("click", () => {
            a = document.getElementById('maps');
            a.value = selectActual;
            var a = document.getElementById('new-name');
            var b = document.getElementById('shadow');
            document.body.removeChild(a);
            document.body.removeChild(b);
        });
        buttons.appendChild(cancel);
        name.appendChild(buttons);
        document.body.appendChild(name);
    }
    //if it's any other option, we clear everything
    else {
        //load from file
        selectActual = option;
        fetch('/relations/'+option+".txt")
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            const array1 = JSON.parse(lines[0]);
            const array2 = JSON.parse(lines[1]);
            var a3 = lines[2].slice(1,-1);
            const fix = /{[^{}]*}/g;
            a3 = a3.match(fix);
            a3 = a3.map(element => element.replace('{', ''));
            const array3 = a3.map(element => element.replace('}',''));
            if(!fillArrays(array1, array2, array3)){console.error("The relations txt doesn't match the csv.")}
        })
        .catch(error => {
            //if there is no file, reset everything
            resetEverything();
            checkButtons();
            console.error("File not found");
        });
    }
}

function resetEverything(){
    linkedL.fill(false);
    linkedR.fill(false);
    selectedL.length = 0;
    selectedR.length = 0;
    numL = 0;
    numR = 0;
    links.length = 0;
    white = false;
    checkButtons();
    paintBorders();
    document.getElementById('outputCSV').disabled = true;
    document.getElementById('outputSCH').disabled = true;
}

function fillArrays(a1, a2, a3){
    if(linkedL.length == a1.length && linkedR.length == a2.length){
        linkedL = a1;
        linkedR = a2;
        var exp = /\[.*?\]/g;
        var i = 0;
        links.length = 0;
        a3.forEach(element => {
            element = element.match(exp);
            var both = {left: [], right: []};
            links.push(both);
            links[i].left = JSON.parse(element[0]);
            links[i].right = JSON.parse(element[1]);
            i++;
        });
        console.log(links.length);
        selectedR.length = 0;
        selectedL.length = 0;
        numL = 0;
        numR = 0;
        white = false;
        checkButtons();
        //after setting the new values for the arrays, we paint the applicable borders
        paintBorders();
        return true;
    }
}

//check if the links array is empty and enables or disables the button accordingly
function checkButtons(){
    var button = document.getElementById('transform');
    button.disabled = links.length == 0 ? true : false;
    button = document.getElementById('tolink');
    button.disabled = numL == 0 && numR == 0 ? true : false;
    button = document.getElementById('unlink');
    button.disabled = white ? false : true;
}

function paintBorders(){
    //unselect selected rows
    var blackbgs = document.getElementsByClassName('selected');
    Array.from(blackbgs).forEach(element => {
        element.classList.remove('selected');
    });
    //remove white borders
    var whiteborders = document.getElementsByClassName('linked-clicked');
    Array.from(whiteborders).forEach(element => {
        element.classList.remove('linked-clicked');
    });
    //remove black borders
    var blackborders = document.getElementsByClassName('linked');
    Array.from(blackborders).forEach(element => {
        element.classList.remove('linked');
    });
    //add black borders according to the new values in linkedL and linkedR
    var i = 0;
    for(i = 0;i<linkedL.length;i++){
        if(linkedL[i]){
            document.getElementById('leftdiv'+i).classList.add('linked');
        }
    }
    for(i = 0;i<linkedR.length;i++){
        if(linkedR[i]){
            document.getElementById('rightdiv'+i).classList.add('linked');
        }
    }
}

function loadSelect(){
    var a = document.getElementById('maps');
    for(var i = a.options.length; i> 0;i--){
        a.remove(i);
    }
    a.options[0].selected = true;
    fetch('/relationsS')
        .then(response => response.json())
        .then(data => {
            data.forEach(element => {
                var a = document.getElementById('maps');
                var option = document.createElement('option');
                var ele = String(element)
                ele = ele.replace(".txt", "");
                option.textContent = ele;
                option.value = ele;
                a.appendChild(option);
            });
            var a = document.getElementById('maps');
            var option = document.createElement('option');
            option.textContent = "Create New";
            option.value = "create";
            a.appendChild(option);
            var event = new Event("select_loaded");
            document.dispatchEvent(event);
        })
        .catch(error => {
            console.error("Couldn't read the options")
        });
}

function changeColorR(st, num){
    if(!linkedR[num]){
        if(!selectedR.includes(num)) {
            if(numR < 1){
             st.classList.add("selected");
             selectedR.push(num);
             numR++;
            }
        }
        else {
            st.classList.remove("selected");
            var a = selectedR.indexOf(num);
            selectedR.splice(a, 1);
            numR--;
        }
    }
    
}

function changeColorL(st, num){
    if(!linkedL[num]){
        if(!selectedL.includes(num)) {
            if(!(numR > 1 && numL >= 1)){
             st.classList.add("selected");
             selectedL.push(num);
             numL++;
            }
        }
        else {
            st.classList.remove("selected");
            var a = selectedL.indexOf(num);
            selectedL.splice(a, 1);
            numL--;
        }
    }
    
}

function checkCounters(){
    var a = document.getElementById('tolink');
    if(numL>0 && numR>0) a.disabled = false;
    else a.disabled = true;
}

