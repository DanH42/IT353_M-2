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

$(function(){
	getRecentPastes();

	var query = getURLQuery();
	if(query.id){
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
				if(res && res.success)
					window.location = "?id=" + res.id;
				else
					error();
			},
			failure: error
		});
	});
});

function getURLQuery(){
	var things = {}
	var parts = window.location.search.substr(1).split("&");
	for(var i = 0; i < parts.length; i++){
		var thing = parts[i].split("=");
		things[decodeURIComponent(thing[0])] = decodeURIComponent(thing[1]);
	}
	return things;
}

function loadPaste(id){
	$("#newPaste").hide();
	$("#content").html("").show();
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
				var $title = $("<h2>");
				$title.text(res.title);
				$("#content").append($title);

				var $time = $("<div>");
				$time.addClass("time");
				$time.text(new Date(res.created).toLocaleString());
				$("#content").append($time);

				var $text = $("<pre>");
				$text.addClass("brush: " + res.type);
				$text.text(res.text);
				$("#content").append($text);

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
