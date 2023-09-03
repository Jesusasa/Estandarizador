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
    res.render("crear_modelo");
});

app.post('/crear_modelo', (req, res) => {
    const { campo, tipoUds, none, long, peso, cant, vol, temp, otros } = req.body;

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
    /*
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
*/
    const filas = res.map(fila => [fila.campo, fila.tipo, fila.medida]);

    const cols = ['Campo', 'Tipo', 'Medida'];
    filas.unshift(cols);

    const csv = filas.map(fila => fila.join(',')).join('\n');

    fs.writeFileSync('datos.csv', csv, 'utf8');
    console.log("fin");
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



// ---------------------------------------------------MANEJADOR COMÚN----------------------------------------------------

/* Arrancar el servidor 
app.get("/", function (request, response) {
    response.redirect("formulario_pag_inicial");
    console.log(__dirname);
});
*/
//Formulario de creacion de cuenta
app.get("/formulario_crear_cuenta", function (request, response) {
    response.render('formulario_crear_cuenta',{
        emailError: null,
        passwdError: null, 
        cpassError: null,			
        empError: null,
        nombreError:null,
    }); //por defecto no hay ningun error
});

app.post("/formulario_crear_cuenta", multerFactory.single('foto'), function (request, response) {
    const { correo, passwd, cpass, nombre, perfil, tecnico, emp } = request.body;
    let foto='user.jpg'
    if(request.file) foto=request.file.originalname;
    let ok = utils.okForm(correo, passwd, cpass, foto, nombre, perfil, tecnico, emp);

    if (ok.error) {     
         response.render("formulario_crear_cuenta", ok.errors);
    } else {
        daoU.existeUsuario(ok.usuario.email, function (err, existe) {
            if (err) {
                response.render("formulario_crear_cuenta", ok.errors);
            } else {
                if (existe) {
                    daoU.reactivarUsuario(ok.usuario, function (err) {
                        if (err) {
                            response.status(500);
                            response.render("formulario_crear_cuenta", ok.errors);
                        } else {
                            response.render("formulario_pag_inicial", { errorMsg: null});
                        }
                    });
                } else {
                    daoU.insertUsuario(ok.usuario, function (err, insert) {
                        if (err) {
                            response.status(500);
                            response.render("formulario_crear_cuenta",  ok.errors );
                        } else {
                            response.render("formulario_pag_inicial", { errorMsg: null });
                        }
                    });
                }
            }
        });
    }
});

//Formulario de inicio de sesion
app.get("/formulario_pag_inicial", function (request, response) {
    response.render("formulario_pag_inicial", {errorMsg: null}); // por defecto no hay errores
});

app.post("/formulario_pag_inicial", function (request, response) {
    daoU.isUserCorrect(request.body.correo, request.body.passw, function (err, ok) {
        if (err) {
            response.status(500);
            response.render("formulario_pag_inicial", { errorMsg: err.message });
        } else {
            if (ok) {
                request.session.currentUser = ok; //si estan bien los datos se guarda la info del usuario
                if (ok.tecnico === 1) {
                    response.redirect("/tecnico_entrantes"); //se va a la pantalla de tecnicos
                } else {
                    response.redirect("/usuario_misAvisos"); //se va a la pantalla de usuarios
                }
            } else {
                let error = "Email o contraseña no válidos";
                response.render("formulario_pag_inicial", { errorMsg: error});
            }
        }
    });
});

//cerrar sesion
app.get("/logout", function (request, response) {
    request.session.destroy(); //se elimina la session en la BD
    response.redirect("/formulario_pag_inicial"); // se redirecciona para iniciar sesion de nuevo
});
/*
app.listen(config.port, function (err) {
    if (err) {
        console.log(err.message);
    } else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
});
*/
//Manejador de rutas imagenes usuario
app.get('/userImage/:email', accessControl, function (request, res) {
    daoU.getUserImageName(request.params.email, function (err, image) {
        if (err) res.end(err.message);
        else if (image === null) {
            const imgPath = __dirname + "/public/img/user.jpg"; // la imagen por defecto
            res.sendFile(imgPath);
        }
        else {
            const imgPath = __dirname + "/public/img/" + image;
            res.sendFile(imgPath);
        }
    })
})

//MANEJADOR DE MODAL DE PERFIL
app.get('/perfil', accessControl, function (request, response) {
    daoU.getInfoUsuario(response.locals.user.idUser, function (err, infoUsuario) {
        if (err) response.end("Error: " + err.message);
        else {
            if(infoUsuario.tecnico===0) {
                daoA.getTiposAvisosUsuario(infoUsuario.idUser, function (err, i, s, f) {
                    if(err) {
                        response.end("Error: " + err.message);
                    } else {
                        response.render("modalPerfil", { usuario: infoUsuario, incidencias: i.i, sugerencias: s.s, felicitaciones: f.f });
                    }
                });
            } else {
                daoA.getTiposAvisosTecnico(infoUsuario.idUser, function (err, i, s, f) {
                    if(err) {
                        response.end("Error: " + err.message);
                    } else {
                        response.render("modalPerfil", { usuario: infoUsuario, incidencias: i.i, sugerencias: s.s, felicitaciones: f.f });
                    }
                });
            }
        }
    })
});
//MANEJADOR DE MODAL NUEVO AVISO
app.get('/nuevoAviso', accessControl, function (request, response) {
    response.render("modal_nuevo_aviso", { user: response.locals.user });
});

app.post('/nuevoAviso', accessControl, function (request, response) {
    daoA.insertAviso(response.locals.user, request.body, function (err) {
        if (err) response.end("Error: " + err.message);
        else {
            response.redirect("/usuario_misAvisos");
        }
    })

});

// ---------------------------------------------------MANEJADOR USUARIO----------------------------------------------------

//Pagina de avisos de un usuario estandar
app.get("/usuario_misAvisos", accessControl, function (request, response) {
    daoA.getAvisosUsuario(response.locals.user.idUser, function (err, avisosUsuario) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        }
        else {
            console.log("Avisos del usuario recibidos");
            response.render("usuario_misAvisos", { user: response.locals.user, avisosUsuario: avisosUsuario });
        }
    })
})

//buscar
app.post('/obtener-avisos-u1', (request, response) => {
    // Obtener los datos del array de avisos
    daoA.buscarAvisosUsuario(request.session.currentUser.idUser, request.body.texto, function (err, a) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        }
        else {
            console.log("Avisos encontrados por texto");
            response.json(a);
        }
    });
});

//Pagina con el historico de avisos de un usuario estandar
app.get("/usuario_historico", accessControl, function (request, response) {
    daoA.getAvisosUsuarioHistorico(response.locals.user.idUser, function (err, historico) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Historico de avisos recibido");
            response.render("usuario_historico", { avisos: historico });
        }
    });
});

//buscar
app.post('/obtener-avisos-u2', (request, response) => {
    // Obtener los datos del array de avisos
    daoA.buscarAvisosUsuario(request.session.currentUser.idUser, request.body.texto, function (err, a) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        }
        else {
            console.log("Avisos encontrados por texto");
            response.json(a);
        }
    });
});

//buscar Avisos Usuario
app.get("/buscar_usuario", accessControl, function(request, response){
    const busqueda = request.query.busqueda;

    const avisosFiltrados = avisos.filter(aviso => aviso.contenido.includes(busqueda));

    response.send(avisosFiltrados);
});

app.post("/buscar_usuario", accessControl, function(request,response){
    daoU.getAvisosUsuario(response.locals.usuario.idUser,function(err,incidencias){
        if(err) {
            response.status(500);
            response.end("Error: " + err.message);
        }
        else{
            response.render("buscar_texto",{user:response.locals.usuario.nombre, listaAvisos:utils.buscarAvisos(request.body.buqueda)});
        }
    })

});

// ---------------------------------------------------MANEJADOR TÉCNICO----------------------------------------------------

//entrantes tecnico
app.get("/tecnico_entrantes", accessControl, function (request, response) {
    daoA.getAvisosTecnicoEntrantes(function (err, a) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Avisos entrantes de los técnicos recibidos");
            daoU.getTecnicos(function(err, t){
                if(err){
                    response.status(500);
                    response.end("Error: " + err.message);
                } else {
                    response.render("tecnico_entrantes", { user: response.locals.user, avisos: a, tecnicos: t });
                }
            });
        }
    });
});

//buscar
app.post('/obtener-avisos-t1', (request, response) => {
    // Obtener los datos del array de avisos
    daoA.buscarAvisosEntrantesTecnico(request.body.texto, function (err, a) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        }
        else {
            console.log("Avisos encontrados por texto");
            response.json(a);
        }
    });
});

//avisos tecnico
app.get("/tecnico_misAvisos", accessControl, function(request, response){
    daoA.getAvisosTecnico(request.session.currentUser.idUser, function(err, a){
        if(err){
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Avisos del tecnico recibidos");
            response.render("tecnico_misAvisos", {avisos: a});
        }
    });
});

//buscar
app.post('/obtener-avisos-t2', (request, response) => {
    // Obtener los datos del array de avisos
    daoA.buscarAvisoTecnico(request.session.currentUser.idUser, request.body.texto, function (err, a) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        }
        else {
            console.log("Avisos encontrados por texto");
            response.json(a);
        }
    });
});

//historico tecnico
app.get("/tecnico_historico", accessControl, function (request, response) {
    daoA.getAvisosTecnicoHistorico(request.session.currentUser.idUser, function (err, avisosHistoricoTecnico) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Historico de avisos recibido");
            response.render("tecnico_Historico", { avisos: avisosHistoricoTecnico });
        }
    });
});

//buscar
app.post('/obtener-avisos-t3', (request, response) => {
    // Obtener los datos del array de avisos
    daoA.buscarAvisoTecnico(request.session.currentUser.idUser, request.body.texto, function (err, a) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        }
        else {
            console.log("Avisos encontrados por texto");
            response.json(a);
        }
    });
});

//gestion usuarios tecnico
app.get("/tecnico_gestionUsers", accessControl, function (request, response) {
    daoU.getUsuarios(function (err, listaUsuarios) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Recuperados usuarios para gestionar correctamente");
            response.render("tecnico_gestionUsers", { usuarios: listaUsuarios });

        }
    });
});

//buscar
app.post('/obtener-usuarios-t4', (request, response) => {
    // Obtener los datos del array de avisos
    daoU.buscarUsuario(request.body.texto, function(err, u){
        if(err){
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Usuarios recibidos");
            response.json(u);
        }
    });
});

app.post("/gestionarUsuario/:idUser", accessControl, function (request, response) {
    daoU.eliminarUsuario(request.params.idUser, function (err) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Usuario dado de baja");
            response.redirect("/tecnico_gestionUsers");
        }
    });
});


// POST ENCARGADO DE CAPTURAR FORMULARIO DE BORRADO DE AVISO
app.post("/eliminar_aviso/:idAviso", accessControl, function (request, response) {

    daoA.eliminarAviso(request.params.idAviso, request.body.comentarios, function (err) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Aviso eliminado correctamente");
            response.redirect("/tecnico_entrantes");
        }
    });
});

// POST ENCARGADO DE CAPTURAR FORMULARIO DE ASIGNACION DE AVISO
app.post("/asignarAviso/:idAviso", accessControl, function (request, response) {

    daoA.asignarAviso(request.params.idAviso, request.body.idTecnico, function (err) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Aviso asignado correctamente");
            response.redirect("/tecnico_entrantes");
        }
    });
});

//terminar aviso
app.post("/terminar_aviso/:avisoId", accessControl, function (request, response) {
    daoA.terminarAviso(request.params.avisoId, request.body.comentario, response.locals.user.idUser, request.body.tipo, function (err) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        }
        else {
            console.log("Aviso eliminado correctamente");
            response.status(200);
            response.redirect("/tecnico_entrantes");
        }
    });
});

app.get("/buscar_avisoTecnico", accessControl, function (request, response) {
    response.redirect("/tecnico_entrantes");
})

app.post("/buscar_avisoTecnico", accessControl, function (request, response) {
    daoA.buscarAvisoTecnico(request.body.texto, function (err, listaAvisos) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Avisos encontrados por texto");
            response.render('tecnico_entrantes', { avisos: listaAvisos });
        }
    });
});

app.get("/buscar_usuario_tecnico", accessControl, function (request, response) {
    response.redirect("/tecnico_misAvisos");
});

app.post("/buscar_usuario_tecnico", accessControl, function (request, response) {
    daoU.buscarUsuario(request.body.texto, function (err, listaAvisos) {
        if (err) {
            response.status(500);
            response.end("Error: " + err.message);
        } else {
            console.log("Avisos encontrados por texto");
            response.render("buscar_usuario", { avisos: listaAvisos });
        }
    });
});




