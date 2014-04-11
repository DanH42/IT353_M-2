var express = require('express');
var app = express();
var mongo = new (require("mongolian"))({log:{debug:function(){}}});
var mdb = mongo.db("IT353");
var db = {};
db.pastes = mdb.collection("pastes");

app.configure(function(){
	app.use(express.compress());
	app.use(express.static(__dirname + '/static'));
	app.use(express.json());
});

app.listen(8080);

// Available highlighting languages
var brushes = ["plain", "as3", "bash", "csharp", "cpp", "css", "diff", "js",
	"java", "pl", "php", "ps", "py", "ruby", "scala", "sql", "vb", "xml"];

function create_new_id(){
	return Math.random().toString(16).substr(2);
}

app.get('/rs/pastes/paste/:id', function(request, response){
	db.pastes.findOne({id: request.params.id}, function(error, paste){
		if(paste && !error){
			response.send({
				success: true,
				id: paste.id,
				type: paste.type,
				text: paste.text,
				title: paste.title,
				created: paste.created
			});
		}else{
			response.send({
				success: false,
				error: "No such paste!"
			});
		}
	});
});

app.get('/rs/pastes/recent/:num', function(request, response){
	var cursor = db.pastes.find();    // Look up all pastes
	cursor.sort({created: -1});       // Sort by creation date
	cursor.limit(request.params.num); // Limit to max number
	cursor.toArray(function(error, pastes){
		if(pastes && !error){
			var output = [];
			for(var i = 0; i < pastes.length; i++){
				var text = pastes[i].text.substr(0, 100);   // Shortened preview
				text = text.replace(/(\r\n|\n|\r)/gm, " "); // Remove line breaks
				text = text.replace(/\s+/g, " ").trim();    // Remove extra spaces
				output.push({
					type: pastes[i].type,
					text: text,
					id: pastes[i].id,
					title: pastes[i].title,
					created: pastes[i].created
				});
			}

			response.send({
				success: true,
				pastes: output
			});
		}else{
			console.log(error);
			response.send({
				success: false,
				error: "Couldn't load any pastes!"
			});
		}
	});
});

app.post('/rs/pastes/new', function(request, response){
	var text = request.body.text;
	if(text.trim().length > 0){
		var id = create_new_id();

		var type = request.body.type;
		if(!type || brushes.indexOf(type) === -1)
			type = brushes[0];

		var title = request.body.title;
		if(title && title.trim().length > 0)
			title = title.trim();
		else
			title = text.split("\n")[0].trim().substr(0, 20); // First line of text

		var dataToInsert = {
			id: id,
			type: type,
			text: text,
			title: title,
			created: +new Date
		};

		db.pastes.insert(dataToInsert, function(error){
			if(error){
				console.log(error);
				response.send({
					success: false,
					error: "Unknown database error."
				});
			}else{
				response.send({
					success: true,
					id: id
				});
			}
		});
	}else{
		response.send({
			success: false,
			error: "No text given!"
		});
	}
});
