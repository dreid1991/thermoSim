LevelData = {
	levelTitle: 'Hypothetical Path: Phase Change',
	
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 30, antoineCoeffs: {a: 8.07, b:1730.6, c: 233.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc2', m: 4, r: 2, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -15, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc3', m: 3, r: 1, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3}
	],
	mainSequence: [
		{//First Scene
			sceneData: {//Scene 0
			},
			prompts:[ 
				{sceneData: undefined,
							cutScene: true,
							text:" The use of hypothetical paths relies upon state functions. Identify the distinguishing characteristic that makes something a state function."
				},
				{sceneData:
					{
						objs: [
							{type:'AuxImage',
								attrs: {handle: 'piston1', imgFunc: 'img("img/work/block0Pic2.jpg")', slotNum: 1}
							},
							{type:'AuxImage',
								attrs: {handle: 'piston2', imgFunc: 'img("img/work/block0Pic1.jpg")', slotNum: 2}
							}	
						]
					},
					cutScene: true,
					text: "Over spring break Dr. Koretsky hiked up Eagle’s Peak near San Francisco. The two routes he could take are seen to the left. How would the amounts of work required to complete the two routes compare? How would the potential energy change compare?"
				}
				
			]
								
		},
		{//Second Scene
			sceneData: {//Scene1
				walls: [
					{pts: [P(40,30), P(510,30), P(510,400), P(40,400)], handler: 'cVIsothermal', handle: 'firstWall', border: {type: 'open'},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 210), dims: V(150,150), count: 1000, temp: 300, returnTo: 'firstWall', tag: 'firstWall'},
				],
				rxns: [
					{handle: 'rxn1', rctA: 'spc1', activeE: 5, prods: {spc2:1}},
					{handle: 'rxn2', rctA: 'spc2', activeE: 6, prods: {spc1:1}}
				],
				buttonGroups: [
					{handle: 'hypoPath', label: 'hypPath', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'rxn1go', label: 'Enable RXN', exprs: ['collide.enableRxn("rxn1")','collide.enableRxn("rxn2")']},
							{handle: 'rxn1stop', label: 'Disable RXN', isDown: true, exprs: ['collide.disableRxn("rxn1")','collide.disableRxn("rxn2")']}
						]
					}
				],
				graphs: [
					{type: 'Scatter', handle: 'molFracVsTime', xLabel: "Time (s)", yLabel: "Mole Frac", axesInit:{x:{min:0, step:1},y:{min:0, step:0.1}},
						sets: [
							{handle: 'moleFrac', label:'moleFrac', pointCol:Col(255,50,50),flashCol:Col(255,200,200),data:{x: 'time("firstWall")',y: 'frac("firstWall",{spcName:"spc1",tag: "firstWall"})'},trace: true, fillInPts: true, finnInPtsMin: 5}
						]
					}
				],
				dataRecord: [
					{wallInfo: 'firstWall', data: 'frac', attrs: {spcName: 'spc1', tag: 'firstWall'}},
					{wallInfo: 'firstWall', data: 'Q'}
				],
				objs: [
					{type: 'QArrowsAmmt',
								attrs: {handle: 'arrow', wallInfo: 'firstWall', scale: 1}
					}
				]
			},
			prompts: [
				{sceneData: undefined,
				cutScene: false,
				text: "The isothermal system above contains 1 mole of A and is held at 500 K.  The (spcA color) Species A  can reversibly react to form (spcB color) B.  Begin the reaction and let it proceed to equilibrium.  You can start the reaction by clicking the 'Enable reaction' button.  What is the sign of the enthalpy of reaction?"
				},
				{sceneData: undefined,
				cutScene: true,
				text: "We can use hypothetical paths to calculate physical properties at states where data is unavailable.  In this case, we don't have the enthalpy of reaction at 500 K, but we have the following data:"
				}
			]
		},
		
	]
}
