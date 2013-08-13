LevelData = {
	levelTitle: 'Hypothetical Paths: Reaction Enthalpy',
	
	spcDefs: [
		{spcName: 'spc1', m: 4, r: 2, col: Col(200, 0, 0), cv: 2.5 * R, hF298: -10, hVap298: 30,sF298: 15, antoineCoeffs: {a: 8.07, b:1730.6, c: 233.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3},
		{spcName: 'spc2', m: 4, r: 2, col: Col(0, 200, 0), cv: 3.5 * R, hF298: -12, hVap298: 10, sF298: 15, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 4.5* R, spcVolLiq: .3},
		{spcName: 'spc3', m: 3, r: 1, col: Col(150, 100, 100), cv: 2.5 * R, hF298: -10, hVap298: 10,sF298: 15, antoineCoeffs: {a: 8.07, b:1530.6, c: 239.4-273.15}, cpLiq: 2.5* R, spcVolLiq: .3}
	],
	mainSequence: [
		{//First Scene
			sceneData: {//Scene 0
			},
			prompts:[ 
				{//Prompt 0
				sceneData: undefined,
							cutScene: true,
							text:" <p>Today we're going to examine hypothetical paths and how they can be used to determine unknown thermodynamic process values.</p><p>The use of hypothetical paths is entirely dependent on state functions. Please identify here what you believe are the distinguishing characteristics that make a thermodynamic property a state function.</p>",
							quiz:[
									{type: 'text',
									storeAs:'HypAns',
									text: 'Type your answer here.'
									}
								]	
				},
				{//Prompt 1
				sceneData:
					{
						objs: [
							{type:'AuxImage',
								attrs: {handle: 'piston1', imgFunc: 'img("img/Hyp/1.jpg")', slotNum: 1}
							},
							{type:'AuxImage',
								attrs: {handle: 'piston2', imgFunc: 'img("img/Hyp/2.jpg")', slotNum: 2}
							}	
						]
					},
					cutScene: true,
					text: "Over spring break Dr. Koretsky hiked up Eagle's Peak near San Francisco. The two routes he could take are seen to the right. How would the amounts of work required to complete the two routes compare? How would the potential energy change compare? Which of these two things, work or potential energy, is independent of path?<p>",
					quiz:[
									{type: 'text',
									storeAs:'2ndans',
									text: 'Type your answer here.'
									}
						]
				},
			]
								
		},
		{//Second Scene
			sceneData: {//Scene1
				walls: [
					{pts: [P(40,30), P(510,30), P(510,400), P(40,400)], handler: 'cVIsothermal', temp: 500, handle: 'firstWall', border: {type: 'open'},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 50), dims: V(400,300), count: 1000, temp: 500, returnTo: 'firstWall', tag: 'firstWall'},
				],
				rxns: [
					{handle: 'rxn1', rctA: 'spc1', rctB: 'spc1', activeE: 5, prods: {spc2:2}},
					{handle: 'rxn2', rctA: 'spc2', rctB: 'spc2', activeE: 6, prods: {spc1:2}}
				],
				buttonGroups: [
					{handle: 'hypoPath', label: 'Reaction', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'rxn1go', label: 'Enable RXN', exprs: ['collide.rxnHandlerEmergent.enableRxn("rxn1")','collide.rxnHandlerEmergent.enableRxn("rxn2")']},
							{handle: 'rxn1stop', label: 'Disable RXN', isDown: true, exprs: ['collide.rxnHandlerEmergent.disableRxn("rxn1")','collide.rxnHandlerEmergent.disableRxn("rxn2")']}
						]
					}
				],
				dataRecord: [
					{wallInfo: 'firstWall', data: 'frac', attrs: {spcName: 'spc2', tag: 'firstWall'}},
					{wallInfo: 'firstWall', data: 'Q'}
				],
				dataReadouts: [
					{label: 'Extent of reaction: ', expr: 'frac("firstWall", {tag:"firstWall", spcName:"spc2"})', units: '', decPlaces: 2, handle: 'extrxn', readout: 'mainReadout'},
					{label: 'Heat: ', expr: 'q("firstWall")', units: 'kJ', decPlaces: 2, handle: 'hRxn', readout: 'mainReadout'},
					{label: 'Pressure: ', expr: 'pInt("firstWall")', units: 'bars', decPlaces: 2, handle: 'pInt', readout: 'mainReadout'}
				],
				objs: [
					{type: 'QArrowsAmmt',
								attrs: {handle: 'arrow', wallInfo: 'firstWall', scale: 1}
					}
				]
			},
			prompts: [
				{//Prompt 0
				sceneData: 
					{
						graphs: [
							{type: 'Scatter', handle: 'molFracVsTime', xLabel: "Time (s)", yLabel: "Extent of rxn", axesInit:{x:{min:0, step:1},y:{min:0, step:0.2}}, numGridLines: {y:6}, axesFixed:{y: true},
								sets: [
									{handle: 'moleFrac', label:'moleFrac', pointCol:Col(255,50,50),flashCol:Col(255,200,200),data:{x: 'time("firstWall")',y: 'frac("firstWall",{spcName:"spc2",tag: "firstWall"})'},trace: true, fillInPts: true, finnInPtsMin: 5}
								]
							}
						],
						triggers: [
							{handle: 'firstReaction', expr: 'frac("firstWall", {tag:"firstWall", spcName:"spc2"})>0.5', message: "Perform the reaction and allow the process to reach equilibrium.", priority: 1} 
						]
					},
					cutScene: false,
					text: "The isothermal system above is held at 500 K and contains 1 mole of A.  The red colored species A  can reversibly react to form the green species B.  Begin the reaction and let it proceed to equilibrium.  You can start the reaction by clicking the 'Enable reaction' button.  What is the sign of the enthalpy of reaction? Explain.",
					quiz:[
							{type: 'text',
							storeAs:'realProcess',
							text: 'Type your answer here.'
							}
						]
				},
				{//Prompt 1
				sceneData: undefined,
					cutScene: true,
					text: "We can use hypothetical paths to calculate physical properties at states where data is unavailable. In this case, we don't have the enthalpy of reaction at 500 K, but we have the following data:<p> <center><table class= 'data'><tr><th>Species</th><th>##c_{v}##(J/mol-K)</th></tr><tr><td>A</td><td>2.5*R</td></tr><tr><td>B</td><td>3.5*R</td></tr></table><p> <table class='data'> <tr><th>T (K)</th><th>##\\Delta H_{rxn}## (kJ/mol)</th></tr><tr><td>298</td><td>-2</td></tr></table></p></center>The enthalpy of reaction can be defined as the heat absorbed by a system undergoing a full conversion reaction at constant temperature and pressure.  For example, in a reaction of A##\\rightarrow##B, the enthalpy of reaction would describe the heat after consuming one mole of A at constant temperature and pressure.  If the reaction were 2A##\\rightarrow##B, the enthalpy of reaction would describe the heat after consuming two moles of A at constant temperature and pressure."
				},
				{//Prompt 2
				sceneData: undefined,
					cutScene: true,
					text: "<center><table class= 'data'><tr><th>Species</th><th>##c_{v}##(J/mol-K)</th></tr><tr><td>A</td><td>2.5*R</td></tr><tr><td>B</td><td>3.5*R</td></tr></table><p> <table class='data'> <tr><th>T (K)</th><th>##\\Delta H_{rxn}## (kJ/mol)</th></tr><tr><td>298</td><td>-2</td></tr></table></p></center> <p> Using this data, construct a hypothetical path in three steps that will allow you to calculate the enthalpy of reaction for the previous process.  Calculate the enthalpy change for each step and record the values on a separate sheet of paper. <p> The process is: <p> 1 mole A (500 K) ##\\rightarrow## 1 mole B (500 K)",
				},
				{//Prompt 3
				scendeData: undefined,
					text: "<p>Record the change in enthalpy for each of your steps here.",
					cutScene: true,
					quiz: [
						{type: 'textSmall',
						storeAs: 'step1',
						units: 'kJ',
						preText: 'Change in enthalpy of step 1: ',
						text: ''},
						{type: 'textSmall',
						storeAs:'step2',
						units: 'kJ',
						preText: 'Change in enthalpy of step 2: ',
						text: '',},
						{type: 'textSmall',
						storeAs: 'step3',
						units: 'kJ',
						preText: 'Change in enthalpy of step 3: ',
						text: '',}
					]
				}
			]
		},
		{//Third Scene
			sceneData: {//Scene2
				walls: [
					{pts: [P(40,30), P(510,30), P(510,400), P(40,400)], handler: 'cVIsothermal', isothermalRate: 3, handle: 'secondWall', temp: 500, border: {type: 'open'},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 75), dims: V(400,300), count: 1000, temp: 500, returnTo: 'secondWall', tag: 'secondWall'},
				],
				rxns: [
					{handle: 'rxn1', rctA: 'spc1',rctB: 'spc1', activeE: 3, prods: {spc2:2}},
					{handle: 'rxn2', rctA: 'spc1', rctB: 'spc2', activeE: 2, prods: {spc2:2}}
				],
				buttonGroups: [
					{handle: 'Reaction', label: 'Reaction', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'rxn1go', label: 'Enable RXN', exprs: ['collide.rxnHandlerEmergent.enableRxn("rxn1")']},
							{handle: 'rxn1stop', label: 'Disable RXN', isDown: true, exprs: ['collide.rxnHandlerEmergent.disableRxn("rxn1")']},
						]
					},
					{handle: 'Heat', label: 'Heat', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'isothermal', label: 'Isothermal', isDown: true, exprs: ['walls.secondWall.isothermalInit("current")']},
							{handle: 'adiabatic', label: 'Adiabatic', isDown: false, exprs: ['walls.secondWall.isothermalStop()']}
						]
					}
				],
				dataRecord: [
					{wallInfo: 'secondWall', data: 'frac', attrs: {spcName: 'spc2', tag: 'secondWall'}},
					{wallInfo: 'secondWall', data: 'Q'},
					{wallInfo: 'secondWall', data: 'enthalpy'},
					//{wallInfo: 'firstWall', data: '
				],
				dataReadouts: [
					{label: 'Temperature: ', expr: 'tempSmooth("secondWall")', units: 'K', decPlaces: 0, handle: 'someTemp', readout: 'mainReadout'},
					{label: 'Change in Enthalpy: ', expr: 'enthalpy("secondWall") + 4126.37', units: 'kJ', decPlaces: 2, handle: 'H', readout: 'mainReadout'},
					{label: 'x-rxn: ', expr: 'frac("secondWall", {tag:"secondWall", spcName:"spc2"})', units: '', decPlaces: 2, handle: 'liqTemp', readout: 'mainReadout'}
				],
				objs: [
					// {type: 'QArrowsAmmt',
								// attrs: {handle: 'arrow', wallInfo: 'firstWall', scale: 1}
					// }
					{
						type: 'Heater',
						attrs: {wallInfo: 'secondWall', handle: 'heatyTHeater', max: 8, dims: V(100, 40)}
					}
				],
				graphs: [
							{type: 'Scatter', handle: 'EnthalpyFracVsTemp', xLabel: "Extent of rxn", yLabel: "Enthalpy", axesInit:{y:{min:110, step:10},x:{min:0, step:0.2}}, numGridLines: {x:6}, axesFixed:{x: true},
								sets: [
									{handle: 'moleFrac', label:'mole\nFrac', pointCol:Col(255,50,50),flashCol:Col(255,200,200),data:{y: '(enthalpy("secondWall") + 11500) / 1000',x: 'frac("secondWall",{spcName:"spc2",tag: "secondWall"})'},trace: true, fillInPts: true, fillInPtsMin: 5}
								]
							},
							{type: 'Scatter', handle: 'convVsTemp', xLabel: "Extent of rxn", yLabel: "Temperature", axesInit:{y:{min:200, step:80},x:{min:0, step:0.2}}, numGridLines: {x:6}, axesFixed:{x: true},
								sets: [
									{handle: 'moleFrac', label:'mole\nFrac', pointCol:Col(50,250,50),flashCol:Col(255,200,200),data:{y: 'temp("secondWall")',x: 'frac("secondWall",{spcName:"spc2",tag: "secondWall"})'},trace: true, fillInPts: true, fillInPtsMin: 5}
								]
							}
						],
			},
			prompts: [
				{//Prompt 0
				sceneData: {
						triggers:[
							{handle: 'hypPath1', expr: 'fracDiff(temp("secondWall"),298)<.01', message:"What should the temperature be at the end of your first step?"}
						]
					},
					text:"Now we're going to carry out the hypothetical path.  Above is species A in the same initial state as the previous system.  You can use the buttons to the right to set whether the system is isothermal and whether the reaction occurs.  For this hypothetical process, the activation energy has been lowered so the reaction proceeds at 298 K and the reverse reaction has been disabled. <p> Take the first step in the hypothetical path. How does the enthalpy change compare to the value you calculated?",
					quiz: [
						{type: 'text',
						storeAs: 'hypAns1',
						text: 'Type your answer here'
						}
					]
				},
				{//Prompt 1
				sceneData: {
					triggers:[
						{handle:'hypPath2', expr: 'frac("secondWall", {tag:"secondWall", spcName:"spc2"})==1', message: "What should the extent of reaction be after the second step in your hypothetical path?", priority: 1}
					]
				},
					text: "Take the next step in the hypothetical path.  How does the enthalpy change of this step compare to the value you calculated?   <p>If you are reacting, you will want to have the system be isothermal at this step to make sure the enthalpy of reaction is equal to the tabulated value.",
					quiz: [
						{type: 'text',
						storeAs: 'hypAns2',
						text: 'Type your answer here'
						}
					]
				},
				{//Prompt 2
				sceneData: {
					triggers: [
					{handle: 'hypPath1', expr: 'fracDiff(temp("secondWall"),500)<.01', message:"What should the temperature be at the end of your hypothetical path?"}
					]
				},
					text: "Take the final step in the hypothetical path. Input the enthalpy change.",
					quiz:[
						{type: 'text',
						storeAs: 'hypAns3',
						text: 'Type your answer here'
						}
					]
				},
				{//Prompt 3
				sceneData: undefined,
					cutScene: true,
					text: "How does the enthalpy change of the process compare to the value you predicted?  Can you explain any differences?",
					quiz:[
						{type: 'text',
						storeAs: 'hypAns4',
						text: 'Type your answer here'
						}
					]
				}
			]
		},
		{//Fourth Scene
			sceneData: {//Scene 3
				walls: [
					{pts: [P(40,30), P(510,30), P(510,400), P(40,400)], handler: 'cVIsothermal', temp: 500, handle: 'thirdWall', border: {type: 'open'},},
				],
				dots: [
					{spcName: 'spc1', pos: P(55, 50), dims: V(400,300), count: 1000, temp: 500, returnTo: 'thirdWall', tag: 'thirdWall'},
				],
				rxns: [
					{handle: 'rxn1', rctA: 'spc1', rctB: 'spc1', activeE: 5, prods: {spc2:2}},
					{handle: 'rxn2', rctA: 'spc2', rctB: 'spc2', activeE: 6, prods: {spc1:2}}
				],
				buttonGroups: [
					{handle: 'hypoPath', label: 'Reaction ', prefIdx: 1, isRadio: true,
						buttons: [
							{handle: 'rxn1go', label: 'Enable RXN', exprs: ['collide.rxnHandlerEmergent.enableRxn("rxn1")','collide.rxnHandlerEmergent.enableRxn("rxn2")']},
							{handle: 'rxn1stop', label: 'Disable RXN', isDown: true, exprs: ['collide.rxnHandlerEmergent.disableRxn("rxn1")','collide.rxnHandlerEmergent.disableRxn("rxn2")']}
						]
					}
				],
				dataRecord: [
					{wallInfo: 'thirdWall', data: 'frac', attrs: {spcName: 'spc2', tag: 'thirdWall'}},
					{wallInfo: 'thirdWall', data: 'Q'}
				],
				dataReadouts: [
					{label: 'Extent of reaction: ', expr: 'frac("thirdWall", {tag:"thirdWall", spcName:"spc2"})', units: '', decPlaces: 2, handle: 'extrxn', readout: 'mainReadout'}
				],
				objs: [
					{type: 'QArrowsAmmt',
								attrs: {handle: 'arrow', wallInfo: 'thirdWall', scale: 1}
					}
				]
			},
			prompts: [
				{//Prompt 0
					sceneData:{
						triggers: [
								{handle: 'lastReaction', expr: 'frac("thirdWall", {tag:"thirdWall", spcName:"spc2"})>0.5', message: "Perform the reaction and allow the process to reach equilibrium.", priority: 1} 
							]
					},
						cutscene: true,
						text: "Now that we know the enthalpy of reaction at 500 K, perform the experiment and calculate the amount of heat that will be released during the process.",
						quiz: [
							{type: 'textSmall',
							storeAs: 'finalAns',
							text: ' ',
							units: 'kJ'
							}
						]
				}
			]
		},
		{//Prompt 1
			sceneData: undefined,
				prompts: [
					{
						cutScene: true,
						title: '',
						text: 'You have completed the simulation.'
					}
				]
		}
	]
}
