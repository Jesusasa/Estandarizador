var options = [
    {val: "texto", text:"Texto"},
    {val: "peso", text:"Peso"},
    {val: "altura", text:"Altura"},
    {val: "tiempo", text:"Tiempo"},
    {val: "velocidad", text:"Velocidad"},
];

function addOptions(element){
    for(var i = 0; i<options.length;i++){
        var option = document.createElement("option");
        option.value = options[i].val;
        option.text = options[i].text;
        element.appendChild(option);
    }
}
function startingOption(element, pos){
    result = options.findIndex(x => x.val === pos.trim());
    element.selectedIndex = result;
}

