function Database(){
}
Database.prototype = {
	addSet: function(name){
		if(this[name]===undefined){
			this[name]=[];
		} else{
			alert(name," already exists");
		}
	},

	removeSet: function(name){
		delete this[name];
	},
	removeVal: function(name, idx){
		try{
			this[name].splice(idx,1);
		}
		catch(e){
			alert("Tried to remove val.  ",name," or ",idx," doesn't exist");		
			console.log(e.message);
		}
	},
}