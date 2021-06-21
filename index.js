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

app.use('/', function log(req, res, next) {
    console.log('Execute Time: ', Date.now())
    console.log('Path: ', req.path)
    console.log('Method: ', req.method)
    next()
})

app.get('/findAll', (req, res) => {
    var endResults = ''
    if (req.query.q == null) {
        if (results == null) {
            res.writeHead(404);
            endResults = 'Object Not Found'
        } else {
            res.writeHead(200, {'Content-Type': 'application/json'});
            endResults = JSON.stringify(results)
        }
    } else {
        var pattern = req.query.q.toLowerCase().split("").map((x)=>{
            return `(?=.*${x})`
        }).join("");
        var regex = new RegExp(`${pattern}`, "g")
        var filtered = results.filter( e => 
            e.name.toLowerCase().match(regex) ||
            e.age.toString().toLowerCase().match(regex)
        );
        if (filtered == null) {
            res.writeHead(404);
            endResults = 'Object Not Found'
        } else {
            res.writeHead(200, {'Content-Type': 'application/json'});
            endResults = JSON.stringify(filtered)
        }
    }
    res.end(endResults);
})

app.get('/findOne', (req, res) => {
    var selectedObj = results.find(person => person.id == req.query.id)
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

app.use((req, res, next) => {
    return res.status(404).send({ message: "404: Page Not Found" });
});

app.listen(port, () => {
    console.log(`Listening at ${port}`)
})