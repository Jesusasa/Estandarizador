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
            fetch('relations', {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fileName: path, data: arrays})
            })
            .then(response => response.text())
            .then(message => {
                console.log(message);
            })
            .catch(error => {
                console.error("There's been an issue creating the links file: "+ error);
            });
        }
        
    }
}