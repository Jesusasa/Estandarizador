"use strict";

const config = require("./config");
const path = require("path");
const mysql = require("mysql");
//const utils = require("./utils");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { nextTick } = require("process");
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const csv = require('csv-parser');
const multer = require("multer");



// const DAOUsuarios = require("./DAO/DAOUsuarios");
// const DAOAvisos = require("./DAO/DAOAvisos");
const { callbackify } = require("util");
const res = require("express/lib/response");
const { forEach } = require("underscore");

// Crear un servidor Express.js 
const app = express();
app.use(express.json());
const root = path.join(__dirname);

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore(config.mysqlConfig);

const middlewareSession = session({
    saveUninitialized: false,
    secret: "sessionId",
    resave: false,
    store: sessionStore
});

const accessControl = function (request, response, next) {
    if (request.session.currentUser) {
        response.locals.user = request.session.currentUser;
        next();
    } else {
        response.redirect("/formulario_pag_inicial");
    }
}
var almacen = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, path.join(__dirname, 'public', 'csv'));
    },
    filename: function (request, file, cb) {
        cb(null, file.originalname);
    }
});
const multerFactory = multer({ storage: almacen });

app.use(function (err, request, res, next) {
    if (err instanceof multer.MulterError) {
        res.status(500).send('Error al subir el archivo.');
    } else {
        next(err);
    }
});

app.use(middlewareSession);

app.use(bodyParser.urlencoded({ extended: false }));

// Crear un pool de conexiones a la base de datos de MySQL 
const pool = mysql.createPool(config.mysqlConfig);

//let daoU = new DAOUsuarios(pool);
//let daoA = new DAOAvisos(pool);

//------------------------------------------ESTANDARIZADOR DE BASES DE DATOS---------------------------------------------

app.get('/', (req, res) => {
    res.render("inicio");
});

app.get('/crear_modelo', (req, res) => {
    /*fs.readFile(path.join(__dirname, 'metrics', 'medidas.txt'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al leer los datos.');
        } else {
            const medidas = JSON.parse(data);

            // Crear el objeto deseado
            
            const objetoMedidas = {
                tipos: [],
                nombres: []
                
                tipos: medidas.map(medida => medida.tipo),
                nombres: medidas.reduce((acc, medida) => acc.concat(medida.filas), [])
                
            };
            
            let tipos = [];
            medidas.forEach(obj => {
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const item = JSON.parse(key);
                        tipos.push(item.tipo);
                    }
                }
            });

            console.log(medidas);
            res.render("crear_modelo", { medidas: medidas, tipos: tipos });
        }
    });*/
    res.render('crear_modelo');
});

/*
app.post('/crear_modelo', (req, res) => {
    const { campo, tipoUds, none, long, peso, cant, vol, temp, otros } = req.body;

    //if(!campo) res.redirect("/crear_medidas");

    var res = [];

    var medidas = [long, peso, cant, vol, temp, otros];
    
    for(var i = 0; i < long.length; i++) {
        if(long[i] != 'none') {
            res.push({ campo: campo[i], tipo: tipoUds[i], medida: long[i] });
        } else if(peso[i] != 'none') {
            res.push({ campo: campo[i], tipo: tipoUds[i], medida: peso[i]});
        } else if(cant[i] != 'none') {
            res.push({ campo: campo[i], tipo: tipoUds[i], medida: cant[i]});
        } else if(vol[i] != 'none') {
            res.push({ campo: campo[i], tipo: tipoUds[i], medida: vol[i]});
        } else if(temp[i] != 'none') {
            res.push({ campo: campo[i], tipo: tipoUds[i], medida: temp[i]});
        } else if(otros[i] != 'none') {
            res.push({ campo: campo[i], tipo: tipoUds[i], medida: otros[i]});
        } else {
            res.push({ campo: campo[i], tipo: tipoUds[i], medida: '-'});
        }
    }

    medidas.map(medida => {
        for(var i = 0; i < medida.length; i++) {
            console.log(medida);
            if(long[i] != 'none') {
                res.push({ campo: campo, tipo: tipoUds[i], medida: long[i] });
            } else if(peso[i] != 'none') {
                res.push({ campo: campo, tipo: tipoUds[i], medida: peso[i]});
            } else if(cant[i] != 'none') {
                res.push({ campo: campo, tipo: tipoUds[i], medida: cant[i]});
            } else if(vol[i] != 'none') {
                res.push({ campo: campo, tipo: tipoUds[i], medida: vol[i]});
            } else if(temp[i] != 'none') {
                res.push({ campo: campo, tipo: tipoUds[i], medida: temp[i]});
            } else if(otros[i] != 'none') {
                res.push({ campo: campo, tipo: tipoUds[i], medida: otros[i]});
            } else {
                res.push({ campo: campo, tipo: tipoUds[i], medida: '-'});
            }
        }
    });

    const filas = res.map(fila => [fila.campo, fila.tipo, fila.medida]);

    const cols = ['Campo', 'Tipo', 'Medida'];
    filas.unshift(cols);

    const csv = filas.map(fila => fila.join(',')).join('\n');

    fs.writeFileSync('datos.csv', csv, 'utf8');
    console.log("fin");
    
});


app.post('/crear_modelo', (req, res) => {

});
*/
app.get('/crear_medidas', (req, res) => {
    res.render("crear_medidas");
});

app.post('/crear_medidas', (req, res) => {
    let medidas=req.body;
    console.log(medidas);

    // Ruta del archivo JSON
    const fileName = 'medidas.txt';

    // Leer el archivo si existe
    fs.readFile(fileName, (err, fileData) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // El archivo no existe, creamos uno nuevo
                const data = [medidas];
                fs.writeFile(path.join(__dirname, 'metrics', fileName), medidas, (err) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error: los datos no se han guardado');
                    } else {
                        res.send('Los datos se han guardado correctamente');
                    }
                });
            } else {
                console.error(err);
                res.status(500).send('Error desconocido al guardar los datos');
            }
        } else {
            // El archivo existe, leemos su contenido y agregamos los nuevos datos
            const existingData = fileData;
            existingData.push(medidas);

            fs.writeFile(path.join(__dirname, 'metrics', fileName), existingData, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error al guardar los datos.');
                } else {
                    res.send('Datos guardados exitosamente.');
                }
            });
        }
    });
});

app.get('/edit', (req, res) => {
    res.render("edit");
});

app.get('/modificar-csv', (req, res) => {
    // Leer el archivo CSV existente
    const results = [];
    fs.createReadStream('./csv/readStream.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Modificar los datos del CSV (por ejemplo, cambiar un valor)
        results[0].columna = 'nuevo valor';
  
        // Guardar los cambios en el archivo CSV
        const csvStream = csv.format({ headers: true });
        const writableStream = fs.createWriteStream('./csv/writeStream.csv');
        writableStream.on('finish', () => {
            console.log('CSV modificado correctamente');
            res.render('exito'); // Renderizar una página de éxito o redireccionar a otra página
        });
        csvStream.pipe(writableStream);
        results.forEach(data => csvStream.write(data));
        csvStream.end();
    })
    .on("end", function () {
        console.log("finished");
    });
});

app.use('/scheme', express.static(path.join(__dirname, '')));
app.use('/metrics', express.static(path.join(__dirname, 'metrics')));

app.post('/relations', (req, res) => {
  const name = req.body.fileName;
  const data = req.body.data;
  //const fix = data.link.map(item => JSON.parse(item));
  const l = data.linkL;
  const r = data.linkR;
  const ls = data.link;
  const save = JSON.stringify(l)+"\n"+JSON.stringify(r)+"\n"+JSON.stringify(ls);
  const file = name+".txt";
  fs.writeFile(file, save, (err) => {
  if (err) {
    console.error(err);
    res.status(500).send('Error saving data to file.');
  } else {
    res.send('Data saved successfully!');
  }
  });
});

app.get('/relationsS', (req, res) => {
  fs.readdir(path.join(__dirname, 'relations'), (err, files) => {
    if(err){
      res.status(500).send("Error reading names of tiles");
    } else {
      const names = files.filter(file => fs.statSync(path.join(path.join(__dirname, 'relations'), file)).isFile());
      res.json(names);
    }
  });
});

app.get('/relations/:option', (req, res) => {
  const name = req.params.option;
  const file = path.join(path.join(__dirname, "relations"), name);
  if(!fs.existsSync(file)){
    res.status(404).send("File not found");
    return;
  } 
  fs.readFile(file, (err, data) => {
    if(err){
      res.status(500).send("Error reading the file");
    } else res.send(data);
  })
});

app.use('/scheme', express.static(path.join(__dirname, 'scheme')));
app.use('/options', express.static(path.join(__dirname, 'options')));

app.listen(config.port, function (err) {
    if (err) {
        console.log(err.message);
    } else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
});





