nMedidas=0;

function anadirMedida(event) {
    const divMedidas = document.getElementById('medidas');
    //const nuevaMedidaButton = document.getElementById('nuevaMedida');
    
    nMedidas++;
    console.log(nMedidas);
    const fila = document.createElement('div');
    fila.innerHTML = `
        <label for="medida${nMedidas}">Medida:</label>
        <input type="text" id="medida${nMedidas}" name="medidas[]" placeholder="Ejemplo: metro">
        <label for="equivalencia${nMedidas}">Equivalencia:</label>
        <input type="text" id="equivalencia${nMedidas}" name="equivalencias[]" placeholder="Ejemplo: 1">
    `;

    console.log(fila);
    divMedidas.appendChild(fila);
    /*
    nuevaMedidaButton.addEventListener('click', () => {
        
    });
    */
}

function submitFormulario(event) {
    /*
    const formulario = document.getElementById('form');
    formulario.addEventListener('submit', (event) => {
        
    });
    */
    event.preventDefault(); //si no funciona pues pongo onsubmit en el formulario en vez de onclick

    const tipo = document.querySelector('[name="tipo"]').value;
    const medidas = document.querySelectorAll('[name="medidas[]"]');
    const equivalencias = document.querySelectorAll('[name="equivalencias[]"]');
    /*
    const data = {
        tipo: tipo,
        filas: []
    };
    */
    var text = `${tipo}\n`;
    /*
    for (let i = 0; i < medidas.length; i++) {
        data.filas.push({
            medida: medidas[i].value,
            equivalencia: equivalencias[i].value
        });
    }
    */

    for(let i=0; i<medidas.length; i++) {
      text.concat(medidas[i].value + ', ');
      text.concat(equivalencias[i].value + '\n');
    }

    text.concat('-\n');

    console.log(text); 

    // Realizar la solicitud AJAX
    
    $.ajax({
      url: '/crear_medidas',
      method: 'POST',
      data: { texto: text },
      success: function (response) {
        console.log("Peticion AJAX realizada con exito");
      },
      error: function (xhr, status, error) {
        console.error('Error en la solicitud:', status, error);
      }
    });
    
}
/*
$(document).ready(function () {
    const buscarUsuarioCheckbox = document.getElementById('buscarUsuarioCheckbox');
    const buscarPorUsuario = buscarUsuarioCheckbox.checked;
    $('#formulario').submit(function (e) {
      e.preventDefault(); // Evito el envío del formulario por defecto y asi no recargar la pagina

      $('#tablaTodos').hide();
      $('#tablaResultados').show();
      //let busqueda = document.forms["formulario"].elements['buscar'].value; // Obtener el término de búsqueda
      let busqueda = document.getElementById("buscar").value;
      let url_;

      //if (buscarPorUsuario) url = '/buscar_usuario_tecnico';
      if (buscarPorUsuario) url_ = '/buscar_usuario_tecnico';
      else url_ = '/obtener-avisos-t1';
      // Realizar la solicitud AJAX
      $.ajax({
        url: url_,
        method: 'POST',
        data: { texto: busqueda },
        success: function (response) {
          // Aquí puedes utilizar el array "avisos" en tu script de jQuery
          console.log(response);
          mostrarResultados(response);
        },
        error: function (xhr, status, error) {
          console.error('Error en la solicitud:', status, error);
        }
      });
    });

    // Función para mostrar los resultados en la vista
    function mostrarResultados(avisos) {
      var tablaResultados = $('#tablaResultados tbody');

      tablaResultados.empty(); // Limpiar el contenido anterior
      // Recorrer los avisos y agregar las filas a la tabla
      console.log(avisos);
      avisos.forEach(aviso => {
        let row = $('<tr>');
        let tipoA;
        if (aviso.tipo === 'Sugerencia') {
          tipoA = $('<td><img src="../img/sugerencia.png" width="70px" height="70px"></img></td>');
        } else if (aviso.tipo === 'Incidencia') {
          tipoA = $('<td><img src="../img/incidencia.png" width="70px" height="70px"></img></td>');
        } else if (aviso.tipo === 'Felicitacion') {
          tipoA = $('<td><img src="../img/felicitacion.png" width="70px" height="70px"></img></td>');
        } else {
          tipoA = $('<td>');
        }
        let fecha = new Date(aviso.fecha);
        let fechaA = $('<td>').text(fecha.toLocaleDateString('es-ES'));
        let textoA;
        if (aviso.observaciones.length > 200) {
          textoA = $('<td style="width: 70%;"><p style="font-size: 15px;">' + aviso.observaciones.substring(0, 200) + '</p></td>');
        } else {
          textoA = $('<td style="width: 70%;"><p style="font-size: 15px;">' + aviso.observaciones + '</p></td>');
        }
        let boton1;
        console.log(aviso.tecnico);
        if (aviso.tecnico === null) {
          boton1 = $('<button type="button"  data-bs-toggle="modal" data-bs-target="#asignarAviso' + aviso.idAviso + '"><img src="../img/tecnico_b.png" height="70px" width="60px"></button>');
        } else {
          boton1 = $('<button type="button"  data-bs-toggle="modal" data-bs-target="#asignarAviso' + aviso.idAviso + '"><img src="../img/tecnico_v.png" height="70px" width="60px"></button>');
        }
        let boton2 = $('<button type="button" data-bs-toggle="modal" data-bs-target="#terminarAviso' + aviso.idAviso + '"><img src="../img/papelera.png" height="70px" width="60px"></button>');
        let botonesA = $('<td>');
        botonesA.append(boton1);
        botonesA.append(boton2);

        row.append(tipoA);
        row.append(fechaA);
        row.append(textoA);
        row.append(botonesA);

        tablaResultados.append(row);
      });
    }
});
*/