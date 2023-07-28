const express = require('express');

const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'edit.html'));
  });

app.get('/edit.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'edit.css'));
});

app.get('/scripts/read_csv.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'read_csv.js'));
  });

app.get('/scripts/addrow.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'addrow.js'));
  });

app.get('/scripts/global.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'global.js'));
  });

app.get('/scripts/link_rows.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'link_rows.js'));
  });

app.get('/scripts/load_datascheme.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'load_datascheme.js'));
  });

app.get('/scripts/select_options.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'select_options.js'));
  });

app.get('/scripts/showbutton.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'showbutton.js'));
  });

app.get('/scripts/transform_csv.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'scripts', 'transform_csv.js'));
  }); 

app.use('/scheme', express.static(path.join(__dirname, 'scheme')));

app.post('/relations', (req, res) => {
  const name = req.body.fileName;
  const data = req.body.data;
  //const fix = data.link.map(item => JSON.parse(item));
  const l = data.linkL;
  const r = data.linkR;
  const ls = data.link;
  const save = JSON.stringify(l)+"\n"+JSON.stringify(r)+"\n"+JSON.stringify(ls);
  const file = name+".txt";
  console.log(file);
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
  const file = path.join(__dirname, name);
  console.log(file);
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

app.listen(PORT, () => {});