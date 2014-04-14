var brushes = {
	"plain": "shBrushPlain",
	"as3": "shBrushAS3",
	"bash": "shBrushBash",
	"csharp": "shBrushCSharp",
	"cpp": "shBrushCpp",
	"css": "shBrushCss",
	"diff": "shBrushDiff",
	"js": "shBrushJScript",
	"java": "shBrushJava",
	"pl": "shBrushPerl",
	"php": "shBrushPhp",
	"ps": "shBrushPowerShell",
	"py": "shBrushPython",
	"ruby": "shBrushRuby",
	"scala": "shBrushScala",
	"sql": "shBrushSql",
	"vb": "shBrushVb",
	"xml": "shBrushXml"
};

var currentID;

$(function(){
	getRecentPastes();

	var query = getURLQuery();
	if(query.id){
		$("#deleteLink").click(function(){
			$("#deleteLink").hide();
			$("#deletePaste").show();
			return false;
		});

		$("#deletePaste").submit(function(e){
			e.preventDefault();
		
			var pass = $("#deletePass").val();
			$.ajax({
				type: "DELETE",
				url: "rs/pastes/paste/" + currentID + "/" + encodeURIComponent(pass),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function(res){
					if(res && res.success)
						window.location = ".";
					else
						error();
				},
				failure: error
			});
		});

		loadPaste(query.id);
		return;
	}

	$("#newPaste").submit(function(e){
		e.preventDefault();

		var text = $("#paste").val();
		var title = $("#title").val();
		var type = $("#type").val();
		$.ajax({
			type: "POST",
			url: "rs/pastes/new",
			data: JSON.stringify({
				title: title,
				type: type,
				text: text
			}),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(res){
				if(res && res.success){
					savePassword(res.id, res.pass);
					window.location = "?id=" + res.id;
				}else
					error();
			},
			failure: error
		});
	});
});

function getURLQuery(){
	var params = {}
	var parts = window.location.search.substr(1).split("&");
	for(var i = 0; i < parts.length; i++){
		var param = parts[i].split("=");
		params[decodeURIComponent(param[0])] = decodeURIComponent(param[1]);
	}
	return params;
}

function savePassword(id, pass){
	localStorage[id] = pass;
}

function getPassword(id){
	return localStorage[id];
}

function loadPaste(id){
	currentID = id;

	$("#newPaste").hide();
	$("#content").show();

	$.ajax({
	    type: "GET",
	    url: "rs/pastes/paste/" + id,
	    contentType: "application/json; charset=utf-8",
	    dataType: "json",
	    success: function(res){
	    	if(!res || !res.success)
	    		return error();

			document.title = res.title + " - Pastebin";

			var scriptURL = "syntaxhighlighter/scripts/" + brushes[res.type] + ".js";
			$.getScript(scriptURL, function(){
				var $title = $("#content .title");
				$title.text(res.title);

				var $time = $("#content .time");
				$time.text(new Date(res.created).toLocaleString());

				var pass = getPassword(res.id);
				if(pass)
					$("#deletePass").val(pass);

				var $text = $("#content .text");
				$text.addClass("brush: " + res.type);
				$text.text(res.text);

				SyntaxHighlighter.highlight();
			});
	    },
	    failure: error
	});
}

function getRecentPastes(){
	$.ajax({
	    type: "GET",
	    url: "rs/pastes/recent/5",
	    contentType: "application/json; charset=utf-8",
	    dataType: "json",
	    success: function(res){
	    	if(!res || !res.success)
	    		return error();
	    	$("#recent").html("");
	    	for(var i = 0; i < res.pastes.length; i++){
	    		var $div = $("<div>");
	    		$div.addClass("recentPaste");

	    		var $title = $("<a>");
	    		$title.addClass("title");
	    		$title.attr("href", "?id=" + res.pastes[i].id);
	    		$title.text(res.pastes[i].title);
	    		$div.append($title);

				var $time = $("<div>");
	    		$time.addClass("time");
	    		$time.text(moment(res.pastes[i].created).fromNow());
	    		$div.append($time);

				var $text = $("<pre>");
	    		$text.addClass("text");
	    		$text.text(res.pastes[i].text);
	    		$div.append($text);

	    		$("#recent").append($div);
	    	}
	    },
	    failure: error
	});
}

function error(){
	alert("All is lost. The end is here.");
}
