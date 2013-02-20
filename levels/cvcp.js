
canvasHeight = 450;
$(function(){
	imgPath = 'cvcp';
	animText = new AnimText(c);
	myCanvas.height = canvasHeight;
	renderer = new Renderer();
	window['curLevel'] = new cvcp();
	curLevel.cutSceneEnd();
	curLevel.init();
	addJQueryElems($('button'), 'button');
	$('#resetExp').click(function(){curLevel.reset()});
	$('#toSim').click(function(){nextPrompt()});
	$('#toLastStep').click(function(){prevPrompt()});
	$('#previous').click(function(){prevPrompt()});
	$('#next').click(function(){nextPrompt()});
});

myCanvas.width = $('#main').width();



function cvcp(){
	this.setStds();
	this.wallSpeed = 1;
	this.readouts = {};
	this.compMode = 'Isothermal';//is this used?

	
	addSpecies(['spc1', 'spc3', 'spc4', 'spc5', 'spc6']);
	this.yMin = 30;
	this.yMax = 350;
}
_.extend(cvcp.prototype, 
			LevelTools, 
{
	init: function() {
		this.readout = new Readout('mainReadout', 30, myCanvas.width-130, 25, '13pt calibri', Col(255,255,255), 'left');
		$('#mainHeader').html('c<sub>v</sub> vs. c<sub>P</sub');
		showPrompt(0, 0, true);
	},
	sections: [
		{//S0
			sceneData:undefined,
			prompts:[
				{//P0
					sceneData:undefined,
					cutScene:true,
					text:"<p>It's time to look at heat capacities!</p><p>For an ideal monatomic gas, which of these is correct?  c<sub>V</sub> means heat capacity at constant volume, c<sub>P</sub> means heat capacity at constant pressure.",
					quiz:[
						{	
							type:'multChoice', 
							options:
								[
								{text:"img(img/cvcp/eq1.gif) and img(img/cvcp/eq3.gif)", isCorrect: false, message:"That's not correct"},
								{text:"img(img/cvcp/eq2.gif) and img(img/cvcp/eq3.gif)", isCorrect: false, message:"That's not correct"},
								{text:"img(img/cvcp/eq1.gif) and img(img/cvcp/eq4.gif)", isCorrect: true},
								{text:"img(img/cvcp/eq2.gif) and img(img/cvcp/eq5.gif)", isCorrect: false, message:"That's not correct"}
							]
						}
					],
				},
				{//P1
					sceneData:undefined,
					cutScene:true,
					text:"<p>Right.</p><p>So an ideal gas has a higher heat capacity under constant pressure than under constant volume.  We're going to investigate these processes to figure out why that is.</p><p>First, what does it mean in terms of energy required to heat a given system that c<sub>P</sub> is greater than c<sub>v</sub>?</p>",
					quiz:[
						{	
							storeAs: 'foo',
							type:'text',
							text:'Type your answer here.',
						},
					]
				}
			]
		},
		{//B1
			
			sceneData: function() {
				renderer.render({
					type: 'section',
					walls: [{pts:[P(40,190), P(255,190), P(255,425), P(40,425)], handler:'staticAdiabatic', handle:'left', bounds:undefined, vol:5, border: {type: 'std', col: Col(155, 155, 155)}},
							{pts:[P(295,190), P(510,190), P(510,425), P(295,425)], handler:'staticAdiabatic', handle:'right', bounds:{yMin:50, yMax:275}, vol:5, border: {type: 'std', yMin: 50, col:Col(155, 155, 155), width:5}}
					],
					
					//borders should be option in wall
					dots: [	{type: 'spc1', pos: P(45,200), dims: V(200, 200), count: 3/*50*/, temp:150, returnTo: 'left', tag: 'left'},
							{type: 'spc3', pos: P(45,200), dims: V(200, 200), count: 2/*50*/, temp:150, returnTo: 'left', tag: 'left'},
							{type: 'spc1', pos: P(300,200), dims: V(200, 200), count: 'get(foo, int, 350, 1, 1000)', temp:150, returnTo: 'right', tag: 'right'},
							{type: 'spc3', pos: P(300,200), dims: V(200, 200), count: 'eval(get(nummy, float, .25, .001, 2)*1000, 0, 250, 10, 500)', temp:150, returnTo: 'right', tag: 'right'}
					],
					objs: [
						{type: 'Piston', attrs: {handle: 'RightPiston', wallInfo: 'right', min:'get(goo, float, 2, 1, 1000)', init:'get(goo, float, 2, 1, 1000)', max:7, makeSlider:false}},
						/*{type: 'Heater', attrs: {handle: 'heaterLeft', wallInfo: 'left'}},*/
						//{type: 'DragWeights', attrs: {wallInfo: 'right', weightDefs:[{count:2, pressure:2}, {count: 4, pressure: .5}], weightScalar:70, displayText:true, pInit:0, compMode:'cPAdiabaticDamped', pistonOffset:V(130,-41)}},
						{type: 'Heater', attrs: {handle: 'heaterRight', wallInfo: 'right'}},
						{type: 'Inlet', attrs: {handle: 'inny', wallInfo: 'left', ptIdxs: [3, 4], fracOffset: .3, makeSlider: true, flows: [{spcName: 'spc1', nDotMax: .0001, temp: 300, tag: 'left'}, {spcName: 'spc3', nDotMax: .02, temp: 50, tag: 'left'}]}},
						{type: 'Outlet', attrs: {handle: 'outty', wallInfo: 'left', ptIdxs: [0, 1], fracOffset: .3}}
					],
					dataRecord: [
						{wallInfo: 'right', data: 'moles', attrs: {spcName: 'spc1', tag: 'right'}},
						{wallInfo: 'right', data: 'frac', attrs: {spcName: 'spc1', tag: 'right'}},
						{wallInfo: 'right', data: 'vDist', attrs: {spcName: 'spc1', tag: 'right'}},
						{wallInfo: 'right', data: 'mass'}
					],
					dataDisplay: [
						{wallInfo: 'left', data:'tempSmooth', readout: 'mainReadout'},
						{wallInfo: 'left', data:'q', readout: 'mainReadout'},
						{wallInfo: 'right', data:'tempSmooth', readout: 'pistonReadoutRightPiston'},
					//	{wallInfo: 'right', data:'frac', attrs: {spcName: 'spc1', tag: 'right'}, readout: 'mainReadout'},
						{wallInfo: 'right', data:'moles', attrs: {spcName: 'spc1', tag: 'right'}, readout: 'mainReadout'},
						//WHICH WALL, WHAT THING, WHERE
						{wallInfo: 'right', data:'qArrowsRate', readout: undefined}
					],
					

					graphs: [
						// {type: 'Scatter', handle:'pVSvLeft', xLabel:"P Int.", yLabel:"Temp (K)", axesInit:{x:{min:6, step:2}, y:{min:0, step:50}},
							// sets:[
								// {address:'temp', label:'Temp', pointCol:Col(255,50,50), flashCol:Col(255,200,200),
								 // data:{x: {wallInfo: 'left', data: 'pInt'}, y: {wallInfo: 'left', data: 'temp'}}, trace: false, fillInPts: false, fillInPtsMin: 5}
								
							// ]
						// },
						// {type: 'Scatter', handle:'pVSvRight', xLabel:"P Int.", yLabel:"Temp (K)", axesInit:{x:{min:0, step:30}, y:{min:0, step:.50}},
							// sets:[
								// {address:'cnt', label:'moles', pointCol:Col(255,50,50), flashCol:Col(255,200,200),
								 // data:{x: {wallInfo: 'right', data: 'time'}, y: {wallInfo: 'right', data: 'moles', attrs: {spcName: 'spc1', tag: 'right'}}}, trace: false, fillInPts: false, fillInPtsMin: 5},
								
								
							// ]
						// }
						{type: 'Hist', handle: 'histy', xLabel: 'Velocities', yLabel: 'Count', axesInit: {x: {min: 0, step: 10}, y: {min:0, step: 10}},
							sets: [
								{barCol: Col(150, 0, 0), data: {x: {wallInfo: 'right', data: 'vDist', attrs: {tag: 'right', spcName: 'spc1'}}}}
							]
						}
					],
					rxns: [
						{handle: 'decomp', rctA: 'spc1', hRxn: -2, activeE: 9, prods: {spc6: 2}},
						{handle: 'recomb', rctA: 'spc6', rctB: 'spc6', hRxn: 2, activeE: 11, prods: {spc1: 1}}
						
					]
					
				})
			},
			/*
			sceneData:
				function() {
					currentSetupType = 'section';
					//walls = WallHandler({pts:[[P(40,190), P(255,190), P(255,425), P(40,425)], [P(295,190), P(510,190), P(510,425), P(295,425)]], handlers:'staticAdiabatic', handles:['left', 'right'], bounds:[undefined, {yMin:50, yMax:275}], vols:[5,5]});
					walls = WallHandler();
					walls.addWall({pts:[P(40,190), P(255,190), P(255,425), P(40,425)], handler:'staticAdiabatic', handle:'left', bounds:undefined, vol:5});
					walls.addWall({pts:[P(295,190), P(510,190), P(510,425), P(295,425)], handler:'staticAdiabatic', handle:'right', bounds:{yMin:50, yMax:275}, vol:5});
					this.borderStd({wallInfo:'left', min:50});
					this.borderStd({wallInfo:'right', min:50});
					spcs['spc1'].populate(P(45,200), V(200, 200), 350, 185, 'left', 'left');
					spcs['spc3'].populate(P(45,200), V(200, 200), 250, 185, 'left', 'left');	

					spcs['spc1'].populate(P(300,200), V(200, 200), 350, 185, 'right', 'right');
					spcs['spc3'].populate(P(300,200), V(200, 200), 250, 185, 'right', 'right');	

					this.piston = new Piston({handle: 'RightPiston', wallInfo:'right', min:2, init:2, max:2, makeSlider:false})
					this.heaterLeft = new Heater({handle:'heaterLeft', wallInfo:'left'});
					this.heaterRight = new Heater({handle:'heaterRight', wallInfo:'right'});
					
					walls[0].displayTempSmooth('mainReadout')//.displayQ('mainReadout');
					walls[1].displayTempSmooth('mainReadout')//.displayQ('mainReadout');
				},
				*/
			prompts:[
				{//P0
					sceneData: 
						function(){
							renderer.render({
								type: 'prompt',
								listeners: [
									{dataSet: {wallInfo: 'left', data: 'temp'}, is:'equalTo', checkVal:250, alertUnsatisfied:"Bring the containers to 250 K", priorityUnsatisfied:1, checkOn:''},
									{dataSet: {wallInfo: 'right', data: 'temp'}, is:'equalTo', checkVal:250, alertUnsatisfied:"Bring the containers to 250 K", priorityUnsatisfied:1, checkOn:'conditions'}
								]
							})
							//walls[1].setDefaultReadout(this.piston.readout);
							//walls[1].displayPExt('pistonReadoutRightPiston');
							//walls[0].displayQ('mainReadout');
							//this.leftTemp250 = new StateListener({dataList:walls[0].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the containers to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});
							//this.rightTemp250 = new StateListener({dataList:walls[1].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the containers to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});
						},
					title:"Current step",
					text:"Okay, here’s a constant volume and a constant pressure container.  Both are adiabatic and contain 0.6 moles of an ideal monatomic gas.  Heat the two containers to 250 K.  How do the energies used compare?",
					quiz:[
						{	
							type:'setVals',
							label: 'hello',
							storeAs: 'goo',
							text:'',
							units: 'boo'
						},
						{
							type:'setVals',
							label: 'num moles:',
							storeAs: 'nummy',
							text: '',
							units: 'moles'
						}
					]
				},
				/*
				{//P0
					sceneData: 
						function(){
							currentSetupType = 'prompt1';
							//walls[1].setDefaultReadout(this.piston.readout);
							//walls[1].displayPExt('pistonReadoutRightPiston');
							this.leftTemp250 = new StateListener({dataList:walls[0].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the containers to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});
							this.rightTemp250 = new StateListener({dataList:walls[1].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the containers to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});
						},
					title:"Current step",
					text:"Okay, here’s a constant volume and a constant pressure container.  Both are adiabatic and contain 0.6 moles of an ideal monatomic gas.  Heat the two containers to 250 K.  How do the energies used compare?",
					quiz:[
						{	
						type:'text',
						text:'Type your answer here.',
						},
					]
				},
				*/
				{//P1
					sceneData:undefined,
					text:"<p>It took 0.5 kJ to bring the constant volume container to 250K while the constant pressure container took 0.8 kJ.</p>Do you have any theories about why that is?<br>",
					quiz:[
						{	
						type:'text',
						text:'Type your answer here.',
						},
					]
				},
				{//P2
					sceneData:undefined,
					cutScene:true,
					text:"<p>Let's think about those systems.  When you heated the constant volume container, where did the added energy go?</p>",
					quiz:[
						{	
							type:'multChoice', 
							options:
								[
								{text:"To the molecules, to speed them up, and to the surroundings by expanding the system.", isCorrect: false, message:"That's not correct.  Did the system expand?"},
								{text:"To the molecules, to speed them up", isCorrect: true},
								{text:"To the surroundings through work", isCorrect: false, message:"That's not correct.  Did the system expand?"}
							]
						}
					],
				},
				{//P3
					sceneData:undefined,
					cutScene:true,
					text:"<p>Good.  When you heated the constant <i>pressure</i> container, where did the added energy go?</p>",
					quiz:[
						{	
							type:'multChoice', 
							options:
								[
								{text:"To the molecules, to speed them up, and to the surroundings by expanding the system.", isCorrect: true},
								{text:"To the molecules, to speed them up", isCorrect: false},
								{text:"To the surroundings through work", isCorrect: false, message:"That's not correct.  Didn't the molecules also speed up?"}
							]
						}
					],
				}
			]

		},
		{//B2
			sceneData:
				function() {
					this.sections[1].setup.apply(this);
					//walls[1].setDefaultReadout(this.piston.readout);
					walls[1].displayWork('mainReadout');

				},
			prompts:[
				{//P0
					sceneData:
						function() {
							this.leftTemp250 = new StateListener({dataList:walls[0].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the containers to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});
							this.rightTemp250 = new StateListener({dataList:walls[1].data.t, is:'equalTo', targetVal:250, alertUnsatisfied:"Bring the containers to 250 K", priorityUnsatisfied:1, checkOn:'conditions'});							

						},
					text:"Try heating the containers to 250 K again.  This time the work done by the constant pressure container is displayed.  Is your theory consistant with the data from this heating?",
					quiz:[
						{	
						type:'text',
						text:'Type your answer here.',
						},
					]
				}

			]
		},
		{//B3
			sceneData:undefined,
			prompts:[
				{
					sceneData:undefined,
					cutScene:true,
					text:"<p>End of simulation.</p>",
				}
			]
		}

	]

}
)