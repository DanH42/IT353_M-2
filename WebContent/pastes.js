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

var ads = ["Ads/ad1.gif", "Ads/ad2.gif", "Ads/ad3.gif", "Ads/ad4.gif", "Ads/ad5.gif", "Ads/ad6.gif", "Ads/ad7.gif", "Ads/ad8.gif"];

var intendedAction;

$(function(){
	getRecentPastes();

	$("#ad").prop("src", ads[Math.floor(Math.random() * ads.length)]);

	var query = getURLQuery();
	if(query.id){
		if(query.action == "edit")
			return editPaste(query.id, getPassword(query.id));

		$("#editLink").click(function(){
			intendedAction = "edit";
			$("#modSubmit").val("Edit");
			$("#editLink").hide();
			$("#deleteLink").hide();
			$("#modPaste").show();
			return false;
		});

		$("#deleteLink").click(function(){
			intendedAction = "delete";
			$("#modSubmit").val("Delete");
			$("#editLink").hide();
			$("#deleteLink").hide();
			$("#modPaste").show();
			return false;
		});

		$("#modPaste").submit(function(e){
			e.preventDefault();
		
			var pass = $("#modPass").val();
			if(intendedAction == "delete"){
				$.ajax({
					type: "DELETE",
					url: "rs/pastes/paste/" + query.id + "/" + encodeURIComponent(pass),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function(res){
						if(res && res.success)
							window.location = ".";
						else
							error(res.error || "Unable to delete paste.");
					},
					failure: error.bind(this, "Unable to delete paste.")
				});
			}else if(intendedAction == "edit"){
				savePassword(query.id, pass);
				window.location = "?id=" + query.id + "&action=edit";
			}else
				error("Unknown error. Please reload the page and try again.");
		});

		loadPaste(query.id);
		return;
	}

	$("#newPaste").submit(function(e){
		e.preventDefault();

		newPaste();
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

function newPaste(){
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
				error(res.error || "Unable to create new paste.");
		},
		failure: error.bind(this, "Unable to create new paste.")
	});
}

function editPaste(id, pass){
	$.ajax({
	    type: "GET",
	    url: "rs/pastes/paste/" + id,
	    contentType: "application/json; charset=utf-8",
	    dataType: "json",
	    success: function(res){
	    	if(!res || !res.success)
	    		return error(res.error || "Unable to load paste.");

			$("#pasteSubmit").val("Update");
			$("#paste").val(res.text);
			$("#title").val(res.title);
			$("#type").val(res.type);

			$("#newPaste").submit(function(e){
				e.preventDefault();

				var text = $("#paste").val();
				var title = $("#title").val();
				var type = $("#type").val();
				console.log("Sending...");
				$.ajax({
					type: "PUT",
					url: "rs/pastes/paste/" + id + "/" + encodeURIComponent(pass),
					data: JSON.stringify({
						title: title,
						type: type,
						text: text
					}),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function(res){
						if(res && res.success){
							// The password should already be saved, but rewrite it just in case.
							// Maybe in the future, editing a paste might change its password.
							savePassword(res.id, res.pass);
							window.location = "?id=" + res.id;
							console.log("Done");
						}else
							error(res.error || "Unable to edit paste.");
					},
					failure: error.bind(this, "Unable to edit paste.")
				});
			});
	    },
	    failure: error.bind(this, "Unable to load paste.")
	});
}

function loadPaste(id){
	$("#newPaste").hide();
	$("#content").show();

	$.ajax({
	    type: "GET",
	    url: "rs/pastes/paste/" + id,
	    contentType: "application/json; charset=utf-8",
	    dataType: "json",
	    success: function(res){
	    	if(!res || !res.success)
	    		return error(res.error || "Unable to load paste.");

			var type = "";
			if(res.type !== "plain")
				type = "[" + $("#type option[value='" + res.type + "']").text() + "] ";
			document.title = type + res.title + " - Fakebin";

			var scriptURL = "syntaxhighlighter/scripts/" + brushes[res.type] + ".js";
			$.getScript(scriptURL, function(){
				var $title = $("#content .title");
				$title.text(res.title);

				var $time = $("#content .time");
				$time.text(new Date(res.updated).toLocaleString());

				var pass = getPassword(res.id);
				if(pass)
					$("#modPass").val(pass);

				var $text = $("#content .text");
				$text.addClass("brush: " + res.type);
				$text.text(res.text);

				SyntaxHighlighter.highlight();
			});
	    },
	    failure: error.bind(this, "Unable to load paste.")
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
	    		return error(res.error || "Unable to load recent pastes.");
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
	    		$time.text(moment(res.pastes[i].updated).fromNow());
	    		$div.append($time);

			var $text = $("<pre>");
	    		$text.addClass("text");
	    		$text.text(res.pastes[i].text);
	    		$div.append($text);

	    		$("#recent").append($div);
	    	}
	    },
	    failure: error.bind(this, "Unable to load recent pastes.")
	});
}

function error(text){
	var $err = $(document.createElement('div'));
	$err.addClass("error").text(text);
	$(document.body).append($err);
	$err.animate({"bottom": "0em"}, function(){
		setTimeout(function(){
			$err.animate({"bottom": "-2em"}, function(){
				$err.remove();
			});
		}, 2000);
	});
}
