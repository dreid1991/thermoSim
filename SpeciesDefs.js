function SpeciesDef(name, mass, radius, colors){
	this.name = name;
	this.m = mass;
	this.r = radius;
	this.cols = colors;
}

speciesDefs = [new SpeciesDef("spc1", 3, 2, Col(200,0,0)),
new SpeciesDef("spc2", 5, 6, Col(0, 200, 200)),
new SpeciesDef("spc3", 1, 1, Col(225, 0, 225))]
