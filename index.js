const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const e = require('express')
const router = express.router
var app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var results = fs.readFile('./person.json', function (err, data) {
    if (err) {
        res.writeHead(404);
        results = JSON.stringify(err);
        return;
    }
    results = JSON.parse(data);
});

function addData(name, age, address) {
    fs.readFile('person.json', 'utf-8', (err, data) => {
        if (err) {
            console.log(err)
        } else {
            var object = JSON.parse(data)
            object.push({
                id: Object.keys(object).length+1,
                name: name,
                age: age,
                address: address,
            })
            var json = JSON.stringify(object)
            fs.writeFile('./person.json', json, 'utf-8', callbackify)
        }
    })
}



app.get('/findAll', (req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(results));
})

app.get('/search', (req, res) => {
    var pattern = req.query.q.toLowerCase().split("").map((x)=>{
        return `(?=.*${x})`
    }).join("");
    var regex = new RegExp(`${pattern}`, "g")
    var filtered = results.filter( e => 
        e.name.toLowerCase().match(regex) ||
        e.address.toLowerCase().match(regex) ||
        e.age.toString().toLowerCase().match(regex)
    );
    if (filtered == null) {
        res.writeHead(404);
        res.end(`Object Not Found`)
    } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(filtered));
    }
})

app.get('/findOne/:id', (req, res) => {
    var selectedObj = results.find(person => person.id == req.params.id)
    if (selectedObj == null) {
        res.writeHead(404);
        res.end(`Object Not Found`)
    } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(selectedObj));
    }
})


app.post('/create', (req, res) => {
    fs.readFile('person.json', 'utf8', function (err, data){
        if (err){
            console.log(err);
        } else {
            var obj = JSON.parse(data);
            const newData = {
                id: Object.keys(obj).length+1, 
                name: req.body.name,
                age: req.body.age,
                address: req.body.address
            }
            obj.push(newData);
            var json = JSON.stringify(obj);
            fs.writeFile('person.json', json, 'utf8', (ec, dc) => {
                if (ec) {
                    res.writeHead(404);
                    res.end(`{"Error": "${http.STATUS_CODES[404]}"}`)
                } else {
                    res.writeHead(200);
                    res.end('Data creation successful');
                }
            });
        }
    });
})

app.delete('/delete/:id', (req, res) => {
    fs.readFile('person.json', 'utf8', function (err, data){
        if (err){
            console.log(err);
        } else {
            var obj = JSON.parse(data);
            var deleteObj = obj.find(person => person.id == req.params.id)
            obj.splice(obj.indexOf(deleteObj), 1)
            var json = JSON.stringify(obj);
            fs.writeFile('person.json', json, 'utf8', (ec, dc) => {
                if (ec) {
                    res.writeHead(404);
                    res.end(`{"Error": "${http.STATUS_CODES[404]}"}`)
                } else {
                    res.writeHead(200);
                    res.end('Data creation successful');
                }
            });
        }
    });
})

// app.use('/', function log(req, res) {
//     console.log('Path: ', req.path)
//     console.log('Method: ',)
// })

app.all('/', function (req, res) {
    console.log('Execute Time: ', Date.now())
})

app.listen(port, () => {
    console.log(`Listening at ${port}`)
})