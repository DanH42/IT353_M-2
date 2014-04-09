var express = require('express');
var app = express();
var mongo = new (require("mongolian"))({log:{debug:function(){}}});
var mdb = mongo.db("IT353");
var db = {};
db.pastes = mdb.collection("pastes");

app.configure(function(){
	app.use(express.compress());
	app.use(express.static(__dirname + '/static'));
});

app.listen(8080);

app.get('/rs/pastes/paste', function(req, res){
	res.send("This was a GET.");
});

app.post('/rs/pastes/paste', function(req, res){
	res.send("This was a POST.");
});

