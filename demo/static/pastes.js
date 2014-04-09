$(function(){
	$("#newPaste").submit(function(e){
		e.preventDefault();

		var text = $("#paste").val();
		console.log(text);
		//TODO: POST paste to server
	});
});
