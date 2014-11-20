var view =  {//视图
	first: {
		activate: function(){
			document.getElementById("first").style.display = "block";
		}, 
		deactivate: function() {
			document.getElementById("first").style.display = "none";
		}
	}, 

	second: {
		activate: function(){
			document.getElementById("second").style.display = "block";
		}, 
		deactivate: function() {
			document.getElementById("second").style.display = "none";
		}
	}, 

	third: {
		activate: function(){
			document.getElementById("third").style.display = "block";
		}, 
		deactivate: function() {
			document.getElementById("third").style.display = "none";
		}
	}
}
var statem = new statemachine();
_.each(view, function(item){
	statem.add(item);//把视图添加到状态机
})